# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial TypeScript Lambda example with ESM support
- S3 to PostgreSQL CSV processing Lambda handler
- SQS event processing with S3 notification parsing
- AWS SDK v3 client integrations
- Pre-commit hooks for code quality (ESLint, Prettier, Markdown)
- Comprehensive development documentation
- CI/CD workflows for automated testing and quality checks
- TypeScript configuration for ESM with NodeNext module resolution
- Jest testing setup with ESM support

## [0.1.0] - Initial Release

- TypeScript Lambda handler using ESM (.mts files)
- S3 CSV to PostgreSQL ingestion pipeline
- Batch insertion with configurable batch size
- Error handling and SQS retry logic
