import { pipeline } from "node:stream/promises";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { Context, SQSEvent } from "aws-lambda";
import csv from "csv-parser";
import * as sql from "mssql";

// Use the promise-native pipeline helpers if needed (not required here)
// Environment/config expectations (set in Lambda configuration):
// - MSSQL_SERVER, MSSQL_PORT (optional), MSSQL_DATABASE, MSSQL_USER, MSSQL_PASSWORD
// - TABLE_NAME: target SQL Server table with a single NVARCHAR(MAX) column named `data` (default: csv_raw_rows)
// - BATCH_SIZE (optional, default 500)
// - THROW_ON_ERROR (optional, default true)

const TABLE_NAME = process.env.TABLE_NAME ?? "csv_raw_rows";
// No batching: insert each parsed row immediately to avoid buffering.
const THROW_ON_ERROR = process.env.THROW_ON_ERROR !== "false";

const s3 = new S3Client({});

const poolConfig: sql.config = {
  server: process.env.MSSQL_SERVER,
  port: process.env.MSSQL_PORT ? Number(process.env.MSSQL_PORT) : undefined,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE,
  options: {
    // adjust encryption/trust based on your environment
    encrypt: process.env.MSSQL_ENCRYPT ? process.env.MSSQL_ENCRYPT === "true" : true,
    trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERT === "true" || true,
  },
  pool: { max: process.env.MSSQL_POOL_MAX ? Number(process.env.MSSQL_POOL_MAX) : 10 },
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;
async function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    const pool = new sql.ConnectionPool(poolConfig);
    poolPromise = pool.connect();
  }
  return poolPromise;
}

async function insertBatch(clientPool: sql.ConnectionPool, rows: string[]): Promise<void> {
  if (rows.length === 0) return;

  // Create an in-memory Table for bulk insert. The destination table must exist with a
  // matching column name (`data`) and compatible type (NVARCHAR(MAX)).
  const table = new sql.Table(TABLE_NAME);
  table.create = false; // we expect the table to already exist
  // Use NVARCHAR(MAX) for the JSON payload
  table.columns.add("data", sql.NVarChar(sql.MAX), { nullable: true });

  for (const r of rows) {
    table.rows.add(r);
  }

  const transaction = new sql.Transaction(clientPool);
  try {
    await transaction.begin();
    const request = new sql.Request(transaction);
    await request.bulk(table);
    await transaction.commit();
  } catch (err) {
    try {
      await transaction.rollback();
    } catch (_) {
      // ignore rollback errors
    }
    throw err;
  }
}

async function processS3Object(bucket: string, key: string): Promise<number> {
  const decodedKey = decodeURIComponent(key.replace(/\+/g, " "));

  const getCommand = new GetObjectCommand({ Bucket: bucket, Key: decodedKey });
  const result = await s3.send(getCommand);

  const body = result.Body as unknown as NodeJS.ReadableStream | undefined;
  if (!body) {
    throw new Error("S3 object body is empty");
  }

  const pool = await getPool();

  let totalInserted = 0;

  // Use Node.js pipeline with async iterator for csv-parser so we never buffer
  // the full file in memory. For each parsed record we immediately perform
  // a single-row bulk insert. This keeps memory low but increases DB calls.
  const parser = csv();
  const pipePromise = pipeline(body, parser);

  for await (const record of parser as AsyncIterable<Record<string, string>>) {
    const jsonRow = JSON.stringify(record);
    // insert single row as a bulk operation with one row
    await insertBatch(pool, [jsonRow]);
    totalInserted += 1;
  }

  // await pipeline completion to propagate stream errors
  await pipePromise;

  return totalInserted;
}

export const handler = async (event: SQSEvent, _context: Context): Promise<void> => {
  for (const record of event.Records) {
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
      }
    }
  }
};
