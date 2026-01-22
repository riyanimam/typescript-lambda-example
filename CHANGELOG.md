# 1.0.0 (2026-01-22)


### Bug Fixes

* Add missing conventional-changelog-conventionalcommits dependency ([5881fd7](https://github.com/riyanimam/typescript-lambda-template/commit/5881fd76fdd953927852042f57e8002cb14b25c5))
* Add missing conventional-changelog-conventionalcommits dependency ([#4](https://github.com/riyanimam/typescript-lambda-template/issues/4)) ([26b1412](https://github.com/riyanimam/typescript-lambda-template/commit/26b14121f084b599892e51dfd4d062a4f9a8b691))
* add repository field to package.json ([c86ffcb](https://github.com/riyanimam/typescript-lambda-template/commit/c86ffcb9c7f741b141171611d3d4ed96b8a6e7be))
* correct PR title validation types format ([28fbe9c](https://github.com/riyanimam/typescript-lambda-template/commit/28fbe9c7889be6cc3234be2dd1f497ee608d2587))
* Exclude auto-generated CHANGELOG.md from markdown linting ([ec27817](https://github.com/riyanimam/typescript-lambda-template/commit/ec2781765b046fdb822c06ef7095e7bf3f2e99f6))
* Exclude auto-generated CHANGELOG.md from markdown linting ([#6](https://github.com/riyanimam/typescript-lambda-template/issues/6)) ([d3c0f60](https://github.com/riyanimam/typescript-lambda-template/commit/d3c0f608b0bba1d0ad98c919a9ed3c2780aeb20f))
* Fixing Repo Config ([#2](https://github.com/riyanimam/typescript-lambda-template/issues/2)) ([13c543d](https://github.com/riyanimam/typescript-lambda-template/commit/13c543d9ceb26f602403ebcf46c6d605fca678bb))
* remove explicit pnpm version from workflows ([1687248](https://github.com/riyanimam/typescript-lambda-template/commit/1687248c32bed4d50666328a3b75a05b1e164fbd))
* remove Jest types from tsconfig and add mssql types ([506680e](https://github.com/riyanimam/typescript-lambda-template/commit/506680e8adfa89847c781230a934ef8db2c9f64f))
* resolve @azure/identity security vulnerability ([0e0946d](https://github.com/riyanimam/typescript-lambda-template/commit/0e0946d3dcadd9c34e6a3f8c7b35cdf4588143eb))
* update repository URL to typescript-lambda-template ([5d58db9](https://github.com/riyanimam/typescript-lambda-template/commit/5d58db9941773def0ae305f2ddd7f7e6ed892ec4))
* Update semantic-release config to use pnpm-lock.yaml ([494f317](https://github.com/riyanimam/typescript-lambda-template/commit/494f317ff9765e3325a043588d054ffee133c49e))
* Update semantic-release config to use pnpm-lock.yaml ([#3](https://github.com/riyanimam/typescript-lambda-template/issues/3)) ([c58fc73](https://github.com/riyanimam/typescript-lambda-template/commit/c58fc734b08af4ac53e4e79c3d804d9639b670d2))


### Features

* add comprehensive project tooling and documentation ([0bd8f7b](https://github.com/riyanimam/typescript-lambda-template/commit/0bd8f7b34bff285671c7c2170f339f91c821fb85))
* Project ([cd191f1](https://github.com/riyanimam/typescript-lambda-template/commit/cd191f1e800d54a8944142738b1c36ec34997097))
* Project Initialization ([be13cd9](https://github.com/riyanimam/typescript-lambda-template/commit/be13cd95566cb5f78879921fb28141c0b5ea3443))
* Project Initialization ([#1](https://github.com/riyanimam/typescript-lambda-template/issues/1)) ([52742f3](https://github.com/riyanimam/typescript-lambda-template/commit/52742f31fec1ae2ce69d5bd82601bbc69dd007dc))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Updated to pnpm 10.28.1** (latest version) for improved performance and features
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
