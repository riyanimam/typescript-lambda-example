# TypeScript Lambda Example

This folder contains a small, opinionated TypeScript project scaffold suitable for AWS Lambda functions.

Files created
- `src/handler.ts` — example Lambda handler and `processEvent` helper
- `src/utils/logger.ts` — tiny logging wrapper
- `tests/handler.test.ts` — Jest test for `processEvent`
- `tsconfig.json` — TypeScript config
- `jest.config.js` — Jest + ts-jest configuration
- `package.json` — build/test scripts


Getting started

Prerequisites: Node >= 14 (recommended 18+), npm

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

A GitHub Actions workflow is included at `.github/workflows/ci.yml` — it runs install, build, lint and tests on push/PR for Node 18 and 20.

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

# typescript-lambda-example