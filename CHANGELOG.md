# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Migrated from npm to pnpm** for faster, more efficient package management
- Updated all documentation to use pnpm commands
- Updated all CI/CD workflows to use pnpm
- Updated git hooks to use pnpm
- Replaced ESLint and Prettier with Biome for unified linting and formatting
- Replaced Jest with Vitest for faster, native ESM testing
- Replaced Python pre-commit with Lefthook (Node.js-based git hooks)
- Updated all workflows and documentation to use new tooling

### Added

- Biome configuration (biome.json)
- Vitest configuration (vitest.config.mts)
- Lefthook configuration (lefthook.yml)

### Removed

- ESLint configuration and dependencies
- Prettier configuration and dependencies
- Jest configuration and dependencies
- Python pre-commit configuration

## [0.1.0] - 2026-01-20

- Initial TypeScript Lambda example with ESM support
- S3 to PostgreSQL CSV processing Lambda handler
- SQS event processing with S3 notification parsing
- AWS SDK v3 client integrations
- Git hooks for code quality
- Comprehensive development documentation
- CI/CD workflows for automated testing and quality checks
- TypeScript configuration for ESM with NodeNext module resolution
- Testing setup with AWS SDK mocking
- TypeScript Lambda handler using ESM (.mts files)
- S3 CSV to PostgreSQL ingestion pipeline
- Batch insertion with configurable batch size
- Error handling and SQS retry logic
