import { SQSHandler, SQSRecord } from 'aws-lambda';
import { GetObjectCommand, S3Client as S3ClientClass } from '@aws-sdk/client-s3';
import { parse } from 'csv-parse/sync';
import { Pool } from 'pg';

// Environment variables (configure in Lambda):
// DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_TABLE
// CREATE_TABLE_IF_NOT_EXISTS (optional, 'true' to auto-create table)

// Lazily created S3 client so tests can inject a mock client before the client
// is instantiated. Use `setS3Client` in tests to provide a test double.
let s3: any = null;
export function setS3Client(client: any | null) {
  s3 = client;
}
function getS3Client() {
  if (!s3) s3 = new S3ClientClass({ region: process.env.AWS_REGION || 'us-east-1' });
  return s3;
}
// Allow injecting a DB pool (useful for tests). If not provided, getPool
// will construct a real pg.Pool from env vars.
let injectedPool: any = null;
export function setDbPool(pool: any | null) {
  injectedPool = pool;
}

function streamToString(stream: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err: any) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

function getPool(): Pool {
  if (injectedPool) return injectedPool;

  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  if (!host || !user || !database) {
    throw new Error('Missing required DB env vars (DB_HOST, DB_USER, DB_NAME)');
  }

  return new Pool({ host, port, user, password, database });
}

async function ensureTable(pool: Pool, table: string, columns: string[]) {
  // Create table with text columns if it doesn't exist
  const cols = columns.map((c) => `"${c}" text`).join(', ');
  const sql = `CREATE TABLE IF NOT EXISTS "${table}" (${cols});`;
  await pool.query(sql);
}

async function insertRows(pool: Pool, table: string, rows: Record<string, string | null>[]) {
  if (rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const colList = cols.map((c) => `"${c}"`).join(', ');
  const placeholders = (rIndex: number) =>
    cols.map((_, cIndex) => `$${rIndex * cols.length + cIndex + 1}`).join(', ');

  const values: any[] = [];
  rows.forEach((r) => cols.forEach((c) => values.push(r[c] ?? null)));

  const rowsSql = rows.map((_, i) => `(${placeholders(i)})`).join(', ');
  const sql = `INSERT INTO "${table}" (${colList}) VALUES ${rowsSql};`;
  await pool.query(sql, values);
}

function extractS3InfoFromSqsRecord(record: SQSRecord) {
  // S3 event is usually stored as JSON in record.body
  try {
    const body = JSON.parse(record.body);
    // If the message was forwarded by SNS, the S3 event may be in body.Message
    const payload = body.Records ? body : JSON.parse(body.Message ?? body);
    const rec = payload.Records[0];
    const bucket = rec.s3.bucket.name;
    const key = decodeURIComponent(rec.s3.object.key.replace(/\+/g, ' '));
    return { bucket, key };
  } catch (err) {
    throw new Error(`Failed to parse SQS record body as S3 event: ${err}`);
  }
}

export const handler: SQSHandler = async (event) => {
  const pool = getPool();
  const table = process.env.DB_TABLE;
  const createTable = process.env.CREATE_TABLE_IF_NOT_EXISTS === 'true';

  if (!table) {
    throw new Error('DB_TABLE env var is required');
  }

  try {
    // Process records sequentially (simple approach). For higher throughput, parallelize with care.
    for (const record of event.Records) {
      const { bucket, key } = extractS3InfoFromSqsRecord(record);

      // Create the GetObjectCommand if available; in some test runtimes the
      // imported GetObjectCommand may not be a constructor (due to ESM/CJS
      // interop). Fall back to passing a plain payload object to the client's
      // send() method (our tests inject a client that accepts this).
      let getCommand: any;
      try {
        getCommand =
          typeof GetObjectCommand === 'function'
            ? new (GetObjectCommand as any)({ Bucket: bucket, Key: key })
            : { Bucket: bucket, Key: key };
      } catch (_err) {
        getCommand = { Bucket: bucket, Key: key };
      }
      const resp = await getS3Client().send(getCommand);

      if (!resp.Body) {
        console.warn(`S3 object ${bucket}/${key} had empty body`);
        continue;
      }

      const bodyString = await streamToString(resp.Body as any);
      // parse CSV using csv-parse sync with header: true
      const records: Record<string, string>[] = parse(bodyString, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      if (records.length === 0) {
        console.info(`No CSV rows in ${bucket}/${key}`);
        continue;
      }

      const columns = Object.keys(records[0]);
      if (createTable) {
        await ensureTable(pool, table, columns);
      }

      // Insert rows
      await insertRows(pool, table, records as Record<string, string | null>[]);
      console.info(`Inserted ${records.length} rows into ${table} from ${bucket}/${key}`);
    }
  } finally {
    await pool.end();
  }
};
