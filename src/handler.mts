import type { SQSEvent, SQSRecord, Context } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { parse } from "csv-parse";
import { Pool } from "pg";
// Use the promise-native pipeline available in Node 16.7+/18+/20
import { pipeline } from 'stream/promises';

// Environment/config expectations (set in Lambda configuration):
// - PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
// - TABLE_NAME: target Postgres table to insert rows into
// - BATCH_SIZE (optional, default 100)
// - THROW_ON_ERROR (optional, default true): if true, a DB failure will cause the handler to throw so SQS can retry

const TABLE_NAME = process.env.TABLE_NAME ?? "csv_raw_rows";
const BATCH_SIZE = Number(process.env.BATCH_SIZE ?? 100);
const THROW_ON_ERROR = process.env.THROW_ON_ERROR !== "false";

// Create AWS S3 client and PG pool globally to reuse between Lambda invocations
const s3 = new S3Client({});

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: process.env.PGPOOL_MAX ? Number(process.env.PGPOOL_MAX) : 5,
});

async function insertBatch(
  client: import("pg").PoolClient,
  rows: unknown[],
): Promise<void> {
  if (rows.length === 0) return;

  // We'll insert each row as JSONB into a single `data` column.
  // Table schema expected (example):
  // CREATE TABLE csv_raw_rows (id BIGSERIAL PRIMARY KEY, data JSONB NOT NULL, created_at timestamptz DEFAULT now());

  const insertText = `INSERT INTO ${TABLE_NAME} (data) VALUES ${rows.map((_, i) => `($${i + 1})`).join(",")}`;
  const values = rows.map((r) => JSON.stringify(r));
  await client.query(insertText, values);
}

async function processS3Object(bucket: string, key: string): Promise<number> {
  const decodedKey = decodeURIComponent(key.replace(/\+/g, " "));

  const getCommand = new GetObjectCommand({ Bucket: bucket, Key: decodedKey });
  const result = await s3.send(getCommand);

  const body = result.Body;
  if (!body) {
    throw new Error("S3 object body is empty");
  }

  // In Node.js, result.Body is a Readable stream
  // We will pipe it through csv-parse with columns:true to get objects (first row as headers)
  const parser = parse({ columns: true, skip_empty_lines: true, trim: true });

  // Collect rows in batches and insert into Postgres
  const client = await pool.connect();
  let totalInserted = 0;
  try {
    await client.query("BEGIN");

  // We'll read from parser as async iterator
  // pipeline body -> parser ensures proper stream handling
  // Start the pipeline and keep its promise so we can await it later and surface stream errors.
  const pipelinePromise = pipeline(body as NodeJS.ReadableStream, parser);

    let batch: unknown[] = [];
    for await (const record of parser as AsyncIterable<
      Record<string, string>
    >) {
      batch.push(record);
      if (batch.length >= BATCH_SIZE) {
        await insertBatch(client, batch);
        totalInserted += batch.length;
        batch = [];
      }
    }

    if (batch.length > 0) {
      await insertBatch(client, batch);
      totalInserted += batch.length;
    }

    // Await pipeline completion to capture any stream errors that may have occurred.
    await pipelinePromise;

    await client.query("COMMIT");
    return totalInserted;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export const handler = async (
  event: SQSEvent,
  _context: Context,
): Promise<void> => {
  // Process SQS records sequentially to make DB transactions simpler; can be parallelized if you want higher throughput.
  for (const record of event.Records as SQSRecord[]) {
    let parsed: any;
    try {
      parsed = JSON.parse(record.body);
    } catch (err) {
      console.error("Failed to parse SQS message body as JSON", {
        err,
        messageId: record.messageId,
      });
      if (THROW_ON_ERROR) throw err as Error;
      continue;
    }

    const s3Records = parsed?.Records ?? [];
    if (!Array.isArray(s3Records) || s3Records.length === 0) {
      console.warn("SQS message contained no S3 Records", {
        messageId: record.messageId,
      });
      continue;
    }

    for (const s3Record of s3Records) {
      const bucket = s3Record?.s3?.bucket?.name;
      const key = s3Record?.s3?.object?.key;

      if (!bucket || !key) {
        console.warn("S3 record missing bucket or key", {
          s3Record,
          messageId: record.messageId,
        });
        continue;
      }

      console.info("Processing S3 CSV", {
        bucket,
        key,
        messageId: record.messageId,
      });
      try {
        const inserted = await processS3Object(bucket, key);
        console.info("Inserted rows from S3 object", {
          bucket,
          key,
          inserted,
          messageId: record.messageId,
        });
      } catch (err) {
        console.error("Failed processing S3 object", {
          err,
          bucket,
          key,
          messageId: record.messageId,
        });
        if (THROW_ON_ERROR) throw err as Error;
        // otherwise, continue to next S3 record/message
      }
    }
  }
};
