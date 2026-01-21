# TypeScript ESM Lambda Example

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange?logo=amazon-aws)](https://aws.amazon.com/lambda/)
[![Biome](https://img.shields.io/badge/Biome-2.3-60a5fa?logo=biome)](https://biomejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18?logo=vitest)](https://vitest.dev/)
[![Code Style](https://img.shields.io/badge/code_style-biome-60a5fa)](https://biomejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A production-ready AWS Lambda template using TypeScript with ECMAScript Modules (ESM), featuring
S3-to-PostgreSQL CSV processing, comprehensive testing, and automated code quality workflows.

## Features

- **TypeScript with ESM**: Native ES modules using `.mts` extension and `NodeNext` module resolution
- **AWS SDK v3**: Modern AWS integrations with S3, SQS event handling
- **PostgreSQL Integration**: Batch CSV ingestion from S3 to PostgreSQL
- **Production-Ready**: Error handling, retries, configurable batch processing
- **Code Quality**: Biome for linting/formatting, Lefthook for git hooks, automated CI/CD
- **Type Safety**: Full TypeScript types with AWS Lambda event definitions
- **Testing**: Vitest with native ESM support and AWS SDK mocking

## Prerequisites

- **Node.js** >= 20 (Lambda runtime: `nodejs20.x` or `nodejs22.x`)
- **pnpm** >= 10 (fast, disk-efficient package manager)
- **PostgreSQL** (for local development and testing)
- **AWS Account** (for deployment)

## Quick Start

### Install Dependencies

```bash
pnpm install
```

### Build

Compile TypeScript to JavaScript in the `dist/` directory:

```bash
pnpm run build
```

### Run Tests

```bash
pnpm test

# Watch mode for development
pnpm run test:watch
```

### Lint and Format

```bash
# Check code with Biome
pnpm run lint

# Auto-fix issues
pnpm run lint:fix

# Format code
pnpm run format
```

## Project Structure

```text
typescript-lambda-example/
├── src/
│   ├── handler.mts          # Main Lambda handler for SQS/S3 events
│   └── s3-to-mssql.mts      # S3 CSV to PostgreSQL pipeline
├── tests/
│   └── handler.test.mts     # Jest tests with AWS SDK mocks
├── .github/workflows/       # CI/CD automation
├── dist/                    # Compiled JavaScript output
├── tsconfig.json            # TypeScript ESM configuration
├── jest.config.cjs          # Jest configuration for ESM
├── .eslintrc.json           # ESLint rules
├── .prettierrc              # Prettier formatting
└── package.json             # Dependencies and scripts
```

## Lambda Handler

The main handler (`src/handler.mts`) processes SQS events where each message contains S3 event
notifications. It:

1. Parses SQS messages and extracts S3 event details
2. Fetches CSV files from S3
3. Streams and parses CSV data
4. Batch inserts rows into PostgreSQL
5. Handles errors with configurable retry logic

### Environment Variables

Configure these in your Lambda function:

- `PGHOST` — PostgreSQL host
- `PGPORT` — PostgreSQL port (default: 5432)
- `PGDATABASE` — Database name
- `PGUSER` — Database user
- `PGPASSWORD` — Database password
- `TABLE_NAME` — Target table (default: `csv_raw_rows`)
- `BATCH_SIZE` — Insert batch size (default: 100)
- `THROW_ON_ERROR` — Throw on DB errors for SQS retry (default: `true`)

### Example S3 Event Structure

```json
{
  "Records": [
    {
      "eventVersion": "2.1",
      "eventSource": "aws:s3",
      "s3": {
        "bucket": { "name": "my-bucket" },
        "object": { "key": "data/file.csv" }
      }
    }
  ]
}
```

## TypeScript and ESM

This project uses **ECMAScript Modules** with TypeScript:

- Source files use `.mts` extension
- `package.json` sets `"type": "module"`
- `tsconfig.json` uses `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`
- Local imports require explicit `.mjs` extensions

### Example Import

```typescript
import type { SQSEvent } from "aws-lambda";
import { S3Client } from "@aws-sdk/client-s3";
import { myFunction } from "./utils.mjs"; // Note .mjs extension
```

## Development Workflow

### Git Hooks with Lefthook

Git hooks are automatically installed when you run `pnpm install`. They will:

**Pre-commit:**

- Run Biome linter and formatter on staged files
- Lint markdown files
- Remove trailing whitespace

**Pre-push:**

- Run tests
- Build the project

Manual hook execution:

```bash
Manual hook execution:

```bash
# Run pre-commit checks
npx lefthook run pre-commit

# Run pre-push checks
npx lefthook run pre-push

## Deployment

### Package for Lambda

Create a deployment package with compiled code and dependencies:

```bash
pnpm run build
zip -r lambda-package.zip dist node_modules package.json
```

**Windows PowerShell:**

```powershell
pnpm run build
Compress-Archive -Path dist, node_modules, package.json `
  -DestinationPath lambda-package.zip
```

### Lambda Configuration

- **Runtime**: `nodejs20.x`
- **Handler**: `dist/handler.handler`
- **Architecture**: `x86_64` or `arm64`
- **Memory**: 512 MB (adjust based on CSV size)
- **Timeout**: 300 seconds (adjust for large files)
- **Environment**: Set PostgreSQL and processing variables

### Terraform Example

```hcl
resource "aws_lambda_function" "csv_processor" {
  filename         = "lambda-package.zip"
  function_name    = "s3-csv-to-postgres"
  role            = aws_iam_role.lambda_role.arn
  handler         = "dist/handler.handler"
  runtime         = "nodejs20.x"
  timeout         = 300
  memory_size     = 512

  environment {
    variables = {
      PGHOST         = var.db_host
      PGDATABASE     = var.db_name
      TABLE_NAME     = "csv_data"
      BATCH_SIZE     = "100"
    }
  }
}
```

## CI/CD

GitHub Actions workflows automate quality checks:

- **CI**: Build, test, lint on every push/PR
- **Code Quality**: ESLint, Prettier, TypeScript type checking
- **Security**: CodeQL analysis, dependency audits
- **Semantic Release**: Automated versioning and changelogs

## Contributing

1. Create a feature branch
2. Make changes with semantic commit messages (e.g., `feat:`, `fix:`)
3. Ensure tests pass: `pnpm test`
4. Ensure linting passes: `pnpm run lint`
5. Submit pull request

## Resources

- [Development Guide](./DEVELOPMENT.md)
- [Changelog](./CHANGELOG.md)
- [AWS Lambda TypeScript](https://docs.aws.amazon.com/lambda/latest/dg/lambda-typescript.html)
- [TypeScript ESM](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

## License

See [LICENSE](./LICENSE) for details.
