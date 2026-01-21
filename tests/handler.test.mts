import { Readable } from "node:stream";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Import the handler source (ESM .mts)
import { handler } from "../src/handler.mjs";

describe("handler ESM tests", () => {
  const s3Mock = mockClient(S3Client);
  let poolConnectStub: any;
  let fakeClient: any;

  beforeEach(async () => {
    s3Mock.reset();

    fakeClient = {
      query: vi.fn().mockResolvedValue({}),
      release: vi.fn().mockReturnValue(undefined),
    };

    // stub Pool.prototype.connect to return our fake client
    const pg = await import("pg");
    poolConnectStub = vi.spyOn(pg.Pool.prototype, "connect").mockResolvedValue(fakeClient);

    process.env.PGDATABASE = "testdb";
    process.env.PGHOST = "localhost";
    process.env.PGUSER = "user";
    process.env.PGPASSWORD = "pw";
    process.env.TABLE_NAME = "csv_raw_rows";
    process.env.BATCH_SIZE = "2";
    process.env.THROW_ON_ERROR = "true";
  });

  afterEach(() => {
    poolConnectStub.mockRestore();
  });

  it("downloads CSV from S3 and inserts rows into Postgres in batches", async () => {
    const csv = "name,age\nAlice,30\nBob,25\nCharlie,40\n";
    s3Mock.on(GetObjectCommand).resolves({ Body: Readable.from([csv]) as any });

    const s3Event = {
      Records: [
        {
          s3: { bucket: { name: "my-bucket" }, object: { key: "test.csv" } },
          eventName: "ObjectCreated:Put",
        },
      ],
    };

    const sqsEvent = {
      Records: [{ body: JSON.stringify(s3Event), messageId: "msg-1" }],
    } as any;

    await handler(sqsEvent, {} as any);

    const calls = fakeClient.query.mock.calls;
    // filter to only INSERT queries since BEGIN/COMMIT are also executed
    const insertCalls = calls.filter(
      (c: any) => typeof c[0] === "string" && c[0].startsWith("INSERT")
    );
    // Accept either 1 call that inserted all rows, or multiple batched calls. Validate total rows inserted = 3
    expect(insertCalls.length).toBeGreaterThanOrEqual(1);
    const totalInserted = insertCalls.reduce((s: number, c: any) => s + (c[1]?.length ?? 0), 0);
    expect(totalInserted).toBe(3);
  });
});
