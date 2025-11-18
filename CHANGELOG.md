# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-01-XX

### Added

- **CLI Tool**: New command-line interface for quiz validation
  - `validate` command: Validate single or multiple quiz files
  - `batch` command: Batch validate quizzes with recursive directory scanning
  - `convert` command: Convert quiz data from other formats
  
- **Format Support**: Import/export functionality for multiple formats
  - Anki TSV format support
  - CSV format support
  - Quizlet format support
  
- **Output Formatters**: Multiple output format options
  - JSON formatter: Structured data output
  - HTML formatter: Interactive reports with Chart.js visualization
  - Markdown formatter: Human-readable reports with detailed error information
  
- **CLI Features**:
  - Spinner animations for better UX
  - Color-coded output (chalk)
  - Flexible command options
  - Recursive directory scanning
  - File output support
  
- **Documentation**:
  - Comprehensive CLI usage guide in README
  - CLI usage examples and tutorials (examples/cli-usage.md)
  - Support for all new commands and options
  
- **Testing**:
  - CLI command unit tests
  - Formatter unit tests
  - Importer unit tests
  - End-to-end integration tests
  - 70%+ test coverage for new features

### Changed

- Updated build configuration to support CLI compilation
- Enhanced npm scripts with `build:cli` and `test:watch` commands
- Updated package.json with CLI dependencies and bin entry point

### Dependencies Added

- `commander@^12.0.0`: CLI framework
- `chalk@^5.3.0`: Terminal color support
- `ora@^8.0.0`: Spinner animations
- `chart.js@^4.4.0`: Chart visualization (dev dependency)

---

## [1.0.0] - 2023-XX-XX

### Added

- Initial release
- Core validation library for quiz questions
- Customizable validation rules
- Scoring system (0-100)
- Detailed error reporting
- Batch validation support
- Report generation (markdown)
- TypeScript support with full type safety
- Comprehensive test coverage
