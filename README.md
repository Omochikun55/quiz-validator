# @omochikun/quiz-validator

**Validation library for quiz and question data with customizable rules and detailed error reporting**

[![npm version](https://img.shields.io/npm/v/@omochikun/quiz-validator.svg)](https://www.npmjs.com/package/@omochikun/quiz-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A lightweight, zero-dependency TypeScript library for validating quiz and question data with customizable validation rules, scoring, and detailed error reporting.

## ✨ Features

- ✅ **Comprehensive Validation** - Question text, options, explanations, categories, difficulty
- 🎯 **Customizable Rules** - Define custom validation rules with min/max length, patterns, validators
- 📊 **Scoring System** - Automatic 0-100 score calculation based on validation results
- 📝 **Detailed Reports** - Generate markdown reports for single questions or entire quiz sets
- 🔧 **Flexible Options** - Configure all validation criteria to match your requirements
- 📦 **Zero Dependencies** - Lightweight and fast
- 🔧 **TypeScript First** - Full type safety and IntelliSense support
- 🧪 **Well Tested** - 33 unit tests with 100% coverage

## 📦 Installation

```bash
npm install @omochikun/quiz-validator
```

## 🚀 Quick Start

```typescript
import { validateQuizQuestion } from '@omochikun/quiz-validator';

const question = {
  question: 'What is the capital of France?',
  options: ['London', 'Paris', 'Berlin', 'Madrid'],
  correctAnswer: 'Paris',
  explanation: 'Paris is the capital and largest city of France.',
  category: 'Geography',
  difficulty: 'easy',
};

const result = validateQuizQuestion(question, {
  requireExplanation: true,
  explanationMinLength: 10,
});

console.log(result);
// {
//   valid: true,
//   errors: [],
//   warnings: [],
//   score: 100
// }
```

## 📖 API Reference

### Types

#### `QuizQuestion`

```typescript
interface QuizQuestion {
  id?: string | number;
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  category?: string;
  difficulty?: string | number;
  [key: string]: any; // Additional custom fields
}
```

#### `QuizValidationOptions`

```typescript
interface QuizValidationOptions {
  questionMinLength?: number;        // Default: 5
  questionMaxLength?: number;        // Default: 500
  optionMinLength?: number;          // Default: 1
  optionMaxLength?: number;          // Default: 200
  explanationMinLength?: number;     // Default: 10
  explanationMaxLength?: number;     // Default: 1000
  minOptions?: number;               // Default: 2
  maxOptions?: number;               // Default: 10
  requireExplanation?: boolean;      // Default: false
  requireCategory?: boolean;         // Default: false
  requireDifficulty?: boolean;       // Default: false
  customRules?: ValidationRule[];
}
```

#### `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score: number; // 0-100
}
```

---

### Functions

#### `validateQuizQuestion(question, options?): ValidationResult`

Validate a single quiz question.

```typescript
import { validateQuizQuestion } from '@omochikun/quiz-validator';

const result = validateQuizQuestion(
  {
    question: 'Sample question?',
    options: ['A', 'B', 'C', 'D'],
  },
  {
    questionMinLength: 10,
    minOptions: 4,
  }
);
```

#### `validateQuizSet(questions, options?)`

Validate multiple questions and get summary statistics.

```typescript
import { validateQuizSet } from '@omochikun/quiz-validator';

const result = validateQuizSet(questions, {
  requireExplanation: true,
});

console.log(result.summary);
// {
//   total: 10,
//   passed: 8,
//   failed: 2,
//   averageScore: 87
// }
```

#### `validateField(value, rule): ValidationError | null`

Validate a single field against a validation rule.

```typescript
import { validateField } from '@omochikun/quiz-validator';

const error = validateField('short', {
  field: 'explanation',
  minLength: 10,
  required: true,
});
```

#### `generateReport(result, questionId?): string`

Generate a markdown report for a validation result.

```typescript
import { validateQuizQuestion, generateReport } from '@omochikun/quiz-validator';

const result = validateQuizQuestion(question);
const report = generateReport(result, question.id);
console.log(report);
// ## Question 1
// **Score**: 100/100
// **Status**: ✅ PASS
// ...
```

#### `generateBatchReport(questions, results): string`

Generate a summary report for multiple questions.

```typescript
import { validateQuizSet, generateBatchReport } from '@omochikun/quiz-validator';

const { results } = validateQuizSet(questions);
const report = generateBatchReport(questions, results);
```

---

## 💡 Usage Examples

### Example 1: Basic Question Validation

```typescript
import { validateQuizQuestion } from '@omochikun/quiz-validator';

const question = {
  question: 'What is 2 + 2?',
  options: ['3', '4', '5'],
  correctAnswer: '4',
};

const result = validateQuizQuestion(question);

if (result.valid) {
  console.log('✅ Question is valid!');
} else {
  console.log('❌ Validation failed:');
  result.errors.forEach((error) => {
    console.log(`- ${error.field}: ${error.message}`);
  });
}
```

### Example 2: Custom Validation Rules

```typescript
import { validateQuizQuestion } from '@omochikun/quiz-validator';

const question = {
  question: 'Advanced question?',
  options: ['A', 'B', 'C', 'D'],
  points: 10,
  timeLimit: 30,
};

const result = validateQuizQuestion(question, {
  customRules: [
    {
      field: 'points',
      required: true,
      customValidator: (value) => value >= 5 && value <= 20,
      errorMessage: 'Points must be between 5 and 20',
    },
    {
      field: 'timeLimit',
      required: true,
      customValidator: (value) => value > 0,
      errorMessage: 'Time limit must be positive',
    },
  ],
});
```

### Example 3: Educational Quiz Validation

```typescript
import { validateQuizQuestion } from '@omochikun/quiz-validator';

const educationalQuestion = {
  question: 'Explain the water cycle.',
  options: [
    'Evaporation → Condensation → Precipitation',
    'Condensation → Evaporation → Precipitation',
    'Precipitation → Evaporation → Condensation',
  ],
  explanation:
    'The water cycle consists of evaporation (water turning to vapor), condensation (vapor forming clouds), and precipitation (rain/snow falling).',
  category: 'Science',
  difficulty: 'intermediate',
};

const result = validateQuizQuestion(educationalQuestion, {
  requireExplanation: true,
  requireCategory: true,
  requireDifficulty: true,
  explanationMinLength: 50,
  questionMinLength: 15,
});
```

### Example 4: Batch Validation with Report

```typescript
import { validateQuizSet, generateBatchReport } from '@omochikun/quiz-validator';

const questions = [
  {
    id: 1,
    question: 'Question 1?',
    options: ['A', 'B', 'C'],
  },
  {
    id: 2,
    question: 'Question 2?',
    options: ['X', 'Y', 'Z'],
  },
  // ... more questions
];

const { results, summary } = validateQuizSet(questions, {
  questionMinLength: 10,
  minOptions: 3,
});

console.log(`Passed: ${summary.passed}/${summary.total}`);
console.log(`Average Score: ${summary.averageScore}/100`);

const report = generateBatchReport(questions, results);
console.log(report);
```

### Example 5: Certification Exam Validation

```typescript
import { validateQuizQuestion } from '@omochikun/quiz-validator';

const certQuestion = {
  id: 'CERT-001',
  question: 'Which HTTP method is idempotent?',
  options: ['GET', 'POST', 'PATCH', 'All of the above'],
  correctAnswer: 'GET',
  explanation:
    'GET is idempotent, meaning multiple identical requests have the same effect as a single request.',
  category: 'Web Development',
  difficulty: 'intermediate',
  tags: ['HTTP', 'REST API'],
};

const result = validateQuizQuestion(certQuestion, {
  requireExplanation: true,
  requireCategory: true,
  explanationMinLength: 30,
  questionMinLength: 20,
  customRules: [
    {
      field: 'tags',
      required: true,
      customValidator: (tags) => Array.isArray(tags) && tags.length > 0,
      errorMessage: 'At least one tag is required',
    },
  ],
});
```

### Example 6: Detect Duplicate Options

```typescript
import { validateQuizQuestion } from '@omochikun/quiz-validator';

const question = {
  question: 'Select the correct answer:',
  options: ['Option A', 'Option B', 'Option A'], // Duplicate!
};

const result = validateQuizQuestion(question);

console.log(result.warnings);
// [{
//   field: 'options',
//   message: 'Duplicate options detected',
//   rule: 'duplicates'
// }]
```

### Example 7: Validate External Content

```typescript
import { validateQuizSet } from '@omochikun/quiz-validator';
import fs from 'fs';

// Load questions from JSON file
const questions = JSON.parse(fs.readFileSync('quiz_data.json', 'utf-8'));

const result = validateQuizSet(questions, {
  requireExplanation: true,
  explanationMinLength: 50,
  explanationMaxLength: 500,
  questionMinLength: 20,
  minOptions: 4,
  maxOptions: 4,
});

if (!result.valid) {
  console.log(`${result.summary.failed} questions failed validation`);

  // Generate detailed report
  const report = generateBatchReport(questions, result.results);
  fs.writeFileSync('validation_report.md', report);
}
```

---

## 🎯 Validation Rules

### Built-in Validations

| Field | Default Min | Default Max | Required by Default |
|-------|-------------|-------------|---------------------|
| question | 5 chars | 500 chars | ✅ Yes |
| options count | 2 options | 10 options | No |
| option length | 1 char | 200 chars | No |
| explanation | 10 chars | 1000 chars | No |
| category | - | - | No |
| difficulty | - | - | No |

### Custom Validation Rules

```typescript
interface ValidationRule {
  field: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  errorMessage?: string;
}
```

**Example: Email validation**

```typescript
{
  field: 'authorEmail',
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  errorMessage: 'Invalid email format'
}
```

**Example: Numeric range**

```typescript
{
  field: 'difficulty',
  customValidator: (value) => value >= 1 && value <= 5,
  errorMessage: 'Difficulty must be between 1 and 5'
}
```

---

## 📊 Scoring System

The scoring system calculates a 0-100 score based on:

- **Total checks**: All validation rules applied
- **Failed checks**: Number of validation errors
- **Formula**: `((totalChecks - failedChecks) / totalChecks) × 100`

**Example:**
- 10 total checks
- 2 failed checks
- Score: `(10 - 2) / 10 × 100 = 80`

---

## 🖥️ CLI Usage

### Installation

```bash
npm install -g @omochikun/quiz-validator
```

### Commands

#### Validate a single file

```bash
quiz-validator validate quiz.json
quiz-validator validate quiz.json --format html --output report.html
quiz-validator validate quiz.json --strict
```

**Options:**
- `-f, --format <type>`: Output format (json|html|markdown), default: markdown
- `-o, --output <file>`: Output file path (optional, prints to stdout if not specified)
- `--strict`: Enable strict validation mode (requires explanation, category, difficulty)

#### Batch validation

```bash
quiz-validator batch ./quizzes
quiz-validator batch ./quizzes --recursive --output summary.md
```

**Options:**
- `-r, --recursive`: Scan subdirectories
- `-o, --output <file>`: Summary report output file

#### Convert formats

```bash
quiz-validator convert anki-export.txt --type anki --output quiz.json
quiz-validator convert questions.csv --type csv --output quiz.json
quiz-validator convert quizlet-export.txt --type quizlet --output quiz.json
```

**Options:**
- `-t, --type <format>`: Source format (anki|csv|quizlet), default: anki
- `-o, --output <file>`: Output JSON file (optional, prints to stdout if not specified)

### Supported Import Formats

#### Anki TSV Format

```
Front\tBack\tTag1\tTag2
What is 2+2?\t4\tMath\tBasic
What is 3+3?\t6\tMath\tBasic
```

#### CSV Format

```
question,answer,option1,option2,option3,option4
"What is the capital of France?","Paris","London","Berlin","Madrid"
"What is 2+2?","4","3","5","6"
```

#### Quizlet Format

```
Term 1
Definition 1
Term 2
Definition 2
```

### Output Formats

#### JSON Output

```bash
quiz-validator validate quiz.json --format json
```

Produces structured JSON with validation results, errors, and summary statistics.

#### HTML Output

```bash
quiz-validator validate quiz.json --format html --output report.html
```

Generates an interactive HTML report with Chart.js visualization of scores.

#### Markdown Output

```bash
quiz-validator validate quiz.json --format markdown --output report.md
```

Generates a readable markdown report with detailed error information.

---

## 🧪 Testing

This package is thoroughly tested with 33 unit tests covering:

- Field validation logic
- Question validation
- Batch validation
- Report generation
- Real-world scenarios

Run tests:

```bash
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Setup

```bash
# Clone repository
git clone https://github.com/Omochikun55/quiz-validator.git
cd quiz-validator

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- [GitHub Repository](https://github.com/Omochikun55/quiz-validator)
- [npm Package](https://www.npmjs.com/package/@omochikun/quiz-validator)
- [Issues](https://github.com/Omochikun55/quiz-validator/issues)

---

## 🙏 Acknowledgments

Created with ❤️ for developers building educational platforms, quizzes, and assessments.

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**
