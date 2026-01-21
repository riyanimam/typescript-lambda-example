# Development Guide

This guide covers local development setup and workflows for the TypeScript Lambda project.

## Prerequisites

- **Node.js** >= 20 (LTS recommended)
- **npm** >= 9
- **Git** >= 2.30
- **pre-commit** (optional but recommended): `brew install pre-commit` or `pip install pre-commit`

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd typescript-lambda-example
npm install
```

### 2. Install Pre-commit Hooks (Recommended)

```bash
pre-commit install
```

This will automatically run linting, formatting, and validation checks before each commit.

### 3. Build the Project

```bash
npm run build
```

TypeScript files in `src/` are compiled to JavaScript in `dist/` using the ESM module system.

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode for development
npm run test:dev

# Run tests with coverage
npm test -- --coverage
```

### Code Quality

#### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

#### Formatting

```bash
# Format all files
npm run format

# Check formatting without making changes
npx prettier --check .
```

### Manual Pre-commit Checks

```bash
# Run all pre-commit hooks manually
pre-commit run --all-files

# Run specific hook
pre-commit run eslint --all-files
pre-commit run prettier --all-files
```

## Project Structure

```text
typescript-lambda-example/
├── src/                    # TypeScript source files (.mts for ESM)
│   ├── handler.mts        # Main Lambda handler
│   └── s3-to-mssql.mts    # Additional handlers/utilities
├── tests/                  # Jest tests
│   └── handler.test.mts
├── dist/                   # Compiled JavaScript output
├── .github/workflows/      # CI/CD workflows
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration (ESM)
├── tsconfig.jest.json     # TypeScript config for Jest
├── jest.config.cjs        # Jest configuration
├── .eslintrc.json         # ESLint rules
├── .prettierrc            # Prettier formatting rules
└── .pre-commit-config.yaml # Pre-commit hooks
```

## TypeScript and ESM

This project uses **ECMAScript Modules (ESM)** with TypeScript:

- Source files use `.mts` extension
- `package.json` has `"type": "module"`
- `tsconfig.json` uses `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`
- Import statements use explicit `.mjs` extensions for local modules

### Example Import

```typescript
import type { SQSEvent } from "aws-lambda";
import { S3Client } from "@aws-sdk/client-s3";
import { myFunction } from "./utils.mjs"; // Note .mjs extension
```

## Common Tasks

### Adding a New Dependency

```bash
# Production dependency
npm install <package-name>

# Development dependency
npm install --save-dev <package-name>
```

### Creating a New Lambda Handler

1. Create new file in `src/` with `.mts` extension
2. Define handler function with AWS Lambda signature
3. Export handler as named or default export
4. Add corresponding test in `tests/`

Example:

```typescript
import type { SQSEvent, Context } from "aws-lambda";

export async function handler(event: SQSEvent, context: Context) {
  // Your handler logic here
}
```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update <package-name>
```

## Environment Variables

Lambda functions often need environment variables. Set them in:

- **Local testing**: Create `.env` file (git-ignored)
- **AWS Lambda**: Set via Lambda configuration or Terraform

Common environment variables for this project:

- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` — PostgreSQL connection
- `TABLE_NAME` — Target database table
- `BATCH_SIZE` — Batch size for insertions
- `THROW_ON_ERROR` — Whether to throw on errors (for SQS retry)

## Troubleshooting

### ESM Import Issues

If you see `ERR_MODULE_NOT_FOUND`:

- Ensure local imports use `.mjs` extension
- Check `package.json` has `"type": "module"`
- Verify `tsconfig.json` uses `NodeNext` module resolution

### Jest Test Failures

- ESM tests require `--experimental-vm-modules` flag
- Use `npm run test:dev` for debugging
- Check `tsconfig.jest.json` for test-specific TypeScript config

### Pre-commit Hook Failures

- Run `pre-commit run --all-files` to see all issues
- Auto-fix with `npm run lint -- --fix` and `npm run format`
- Update hooks: `pre-commit autoupdate`

## Resources

- [AWS Lambda TypeScript](https://docs.aws.amazon.com/lambda/latest/dg/lambda-typescript.html)
- [TypeScript ESM Documentation](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Jest with ESM](https://jestjs.io/docs/ecmascript-modules)
