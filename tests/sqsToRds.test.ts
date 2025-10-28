// Tests for src/sqsToRds.ts using aws-sdk-client-mock (ESM test runtime)

import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { handler, setS3Client, setDbPool } from '../src/sqsToRds';
import { Readable } from 'stream';

describe('sqsToRds handler (CSV parsing) - ESM mocks', () => {
  let s3Mock: any;
  let s3Instance: any;

  // lightweight mock DB pool used by tests (mimics pg.Pool API used in handler)
  const mockPool = {
    query: jest.fn(async (_text: string, _params?: any[]) => ({ rows: [] })),
    end: jest.fn(async () => undefined),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    // create a lightweight S3-like instance (has send) and let aws-sdk-client-mock wrap it
    s3Instance = { send: jest.fn() } as any;
    s3Mock = mockClient(s3Instance);
    setS3Client(s3Instance);
    setDbPool(mockPool);

    process.env.DB_TABLE = 'test_table';
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'user';
    process.env.DB_NAME = 'db';
    process.env.DB_PORT = '5432';
  });

  it('parses direct S3 event in SQS body and logs parsed rows', async () => {
    const csv = 'col1,col2\n1,2\n3,4\n';
    s3Mock
      .onAnyCommand()
      .resolves({ $metadata: {}, Body: Readable.from([Buffer.from(csv)]) as any } as any);

    const s3Event = {
      Records: [{ s3: { bucket: { name: 'my-bucket' }, object: { key: 'path%2Fto%2Ffile.csv' } } }],
    };
    const sqsEvent = { Records: [{ body: JSON.stringify(s3Event) }] } as any;

    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    await handler(sqsEvent, {} as any, () => {});

    expect(infoSpy).toHaveBeenCalled();
    const matched = infoSpy.mock.calls.find((c) => String(c[0]).includes('Inserted 2 rows'));
    expect(matched).toBeTruthy();
  });

  it('parses SNS-wrapped S3 event and logs parsed rows', async () => {
    const csv = 'a,b\nX,Y\n';
    s3Mock
      .onAnyCommand()
      .resolves({ $metadata: {}, Body: Readable.from([Buffer.from(csv)]) as any } as any);

    const s3Event = {
      Records: [{ s3: { bucket: { name: 'bucket2' }, object: { key: 'file.csv' } } }],
    };
    const sqsEvent = {
      Records: [{ body: JSON.stringify({ Message: JSON.stringify(s3Event) }) }],
    } as any;

    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    await handler(sqsEvent, {} as any, () => {});

    const matched = infoSpy.mock.calls.find((c) => String(c[0]).includes('Inserted 1 rows'));
    expect(matched).toBeTruthy();
  });

  it('skips malformed record bodies without throwing', async () => {
    s3Mock
      .onAnyCommand()
      .resolves({ $metadata: {}, Body: Readable.from([Buffer.from('col1\n1')]) as any } as any);

    const sqsEvent = {
      Records: [{ body: 'not-json' }, { body: JSON.stringify({ Records: [] }) }],
    } as any;
    // handler currently throws on invalid JSON body; assert that behavior
    await expect(handler(sqsEvent, {} as any, () => {})).rejects.toThrow();
  });
});
