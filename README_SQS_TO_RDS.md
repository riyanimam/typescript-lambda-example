# SQS -> S3 CSV -> RDS Lambda

This Lambda reads SQS events that contain S3 ObjectCreated notifications, downloads the CSV object from S3, parses it, and bulk-inserts rows into a Postgres RDS table.

Files

- `src/sqsToRds.ts` — TypeScript Lambda handler

Environment variables (required)

- `DB_HOST` — RDS endpoint
- `DB_PORT` — RDS port (defaults to 5432)
- `DB_USER` — DB user
- `DB_PASSWORD` — DB password
- `DB_NAME` — Database
- `DB_TABLE` — Target table name

Optional

- `CREATE_TABLE_IF_NOT_EXISTS` — set to `true` to auto-create table (all columns created as `text` based on CSV header)
- `AWS_REGION` — region for S3 client (defaults to `us-east-1`)

Permissions

- Lambda needs SQS read permissions (managed by event source mapping).
- Lambda needs `s3:GetObject` permission on the bucket(s).
- Lambda needs network access to the RDS instance (VPC, subnets, security groups) and DB credentials.

Deployment notes

- Add environment variables (use AWS Secrets Manager recommended for DB credentials).
- Attach IAM policy to allow S3 GetObject and any other required actions.
- If RDS is in a VPC, run the Lambda in the same VPC with appropriate security groups.

Limitations and improvements

- Current implementation loads whole CSV into memory before parsing. For large files stream parsing would be better.
- The example expects CSV headers compatible with DB column names. If `CREATE_TABLE_IF_NOT_EXISTS` is true the table will be created with `text` columns.
- Consider using batching and concurrency limits when inserting very large CSVs.
