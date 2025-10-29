# TypeScript ESM Lambda example

This small example shows an AWS Lambda handler written in TypeScript using ESM (.mts) that receives SQS events where each SQS message body is an S3 notification event.

Files added

- `tsconfig.json` — TypeScript configuration using NodeNext/ESM and output to `dist`
- `src/handler.mts` — ESM Lambda handler; parses SQS message bodies as S3 events and logs bucket/key

Build & test

1. Install deps:

```bash
npm install
```

1. Build (emit JS to `dist`):

```bash
npm run build
```

Notes

- The handler expects each SQS message body to be the S3 event JSON (the shape S3 sends when configured to send notifications to SQS).
- If you want Lambda to fail and cause the SQS message to be retried, rethrow an error from the handler instead of catching JSON parse errors.

## TypeScript Lambda Example

This folder contains a small, opinionated TypeScript project scaffold suitable for AWS Lambda functions.

Files created

- `src/handler.ts` — example Lambda handler and `processEvent` helper
- `src/utils/logger.ts` — tiny logging wrapper
- `tests/handler.test.ts` — Jest test for `processEvent`
- `tsconfig.json` — TypeScript config
- `jest.config.js` — Jest + ts-jest configuration
- `package.json` — build/test scripts

Getting started

Prerequisites: Node >= 20 (Lambda runtime: nodejs20.x), npm

Install dependencies

```bash
cd typescript-lambda-example
npm install
```

Build

```bash
npm run build
```

Run tests

```bash
npm test
```

Lint and format

```bash
npm run lint
npm run format
```

Continuous Integration

A GitHub Actions workflow is included at `.github/workflows/ci.yml` — it runs install, build, lint and tests on push/PR for Node 20.

Packaging for Lambda

Simple manual flow:

1. npm run build
2. Zip the `dist/` contents and any runtime `node_modules` (if you added dependencies) and upload to Lambda.

Example (UNIX / WSL / Git Bash):

```bash
cd typescript-lambda-example
npm run build
zip -r lambda-package.zip dist node_modules package.json
```

If you use Windows PowerShell, use the native Compress-Archive cmdlet instead.

Notes

- This scaffold intentionally includes devDependency-only developer tooling. Add runtime packages to `dependencies` when you need them (for example AWS SDK v3 modules like `@aws-sdk/client-s3`).
- The `handler` entrypoint is `dist/handler.js` after building. Integrate with Terraform/SAM/CDK as needed.

## S3 -> SQS -> Lambda example

This project includes a simple Lambda handler implemented in `src/handler.ts`.
It is designed to be triggered by SQS where each SQS message body contains an
S3 event notification. The handler parses the SQS body (and an SNS envelope
if present), decodes URL-encoded S3 object keys, and demonstrates fetching the
object with `@aws-sdk/client-s3`.

ESM and typings

- This project uses Node ESM semantics: `package.json` contains `"type": "module"`.
- TypeScript is configured with `module: "NodeNext"` and `moduleResolution: "nodenext"` in `tsconfig.json`.
- Because of `nodenext` resolution, local imports need explicit file extensions in source files (for example `import { foo } from './bar.js'`). TypeScript will resolve `.ts` during compile and will emit `.js` imports for runtime.
- Event typings come from `@types/aws-lambda` (you'll see `S3Event` and `SQSEvent` used in `src/handler.ts`).

Build and test locally

```bash
cd typescript-lambda-example
npm install
npm run build
npm test
```

- Deployment notes

- The compiled Lambda entrypoint is `dist/handler.js`. Deploy to a Node 20 runtime (`nodejs20.x`) that supports ESM. Ensure your deployment tooling preserves the package layout and `package.json` `type` field.
- For large objects, stream processing is recommended rather than loading the full object into memory.

Example S3 notification JSON structure expected in the SQS message body:

```json
{
  "Records": [
    {
      "eventVersion": "2.1",
      "eventSource": "aws:s3",
      "s3": {
        "bucket": { "name": "my-bucket" },
        "object": { "key": "path/to/object.csv" }
      }
    }
  ]
}
```
