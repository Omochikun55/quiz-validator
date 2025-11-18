# Quiz Validator CLI - Usage Examples

This document provides practical examples of using the quiz-validator CLI tool.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Advanced Examples](#advanced-examples)
4. [Format Conversion](#format-conversion)
5. [Batch Processing](#batch-processing)
6. [Output Formats](#output-formats)

## Installation

### Global Installation

```bash
npm install -g @omochikun/quiz-validator
```

### Local Project Installation

```bash
npm install @omochikun/quiz-validator
npx quiz-validator validate quiz.json
```

## Basic Usage

### Example 1: Validate a Single Quiz File

Create a quiz file `quiz.json`:

```json
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "correctAnswer": "Paris",
    "explanation": "Paris is the capital and most populous city of France.",
    "category": "Geography",
    "difficulty": "easy"
  },
  {
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": "4",
    "explanation": "The sum of 2 and 2 is 4.",
    "category": "Math",
    "difficulty": "easy"
  }
]
```

Validate it:

```bash
quiz-validator validate quiz.json
```

Output:

```
✓ Validation complete

# Quiz Validation Report

## Summary

- **Total Questions**: 2
- **Passed**: ✅ 2
- **Failed**: ❌ 0
- **Average Score**: 100.0/100

---

## Detailed Results

### Question 1 ✅ PASS

**Score**: 100/100

**Question**: What is the capital of France?

---

### Question 2 ✅ PASS

**Score**: 100/100

**Question**: What is 2+2?

---

📊 Summary:
Total: 2
Passed: 2
Failed: 0
Average Score: 100.0/100
```

### Example 2: Strict Validation Mode

```bash
quiz-validator validate quiz.json --strict
```

This enables strict validation requiring:
- Explanations for all questions
- Categories for all questions
- Difficulty levels for all questions

### Example 3: Generate HTML Report

```bash
quiz-validator validate quiz.json --format html --output report.html
```

This generates an interactive HTML report with:
- Summary statistics
- Chart.js bar chart showing scores
- Detailed results for each question
- Error and warning information

Open `report.html` in your browser to view the report.

### Example 4: Generate JSON Report

```bash
quiz-validator validate quiz.json --format json --output report.json
```

Produces structured JSON output suitable for programmatic processing.

## Advanced Examples

### Example 5: Validate with Custom Output

```bash
quiz-validator validate quiz.json --format markdown --output my-report.md
```

### Example 6: Validate and Display Results

```bash
quiz-validator validate quiz.json --format markdown
```

Displays the markdown report directly to stdout.

## Format Conversion

### Example 7: Convert from Anki Format

Create an Anki export file `anki-export.txt`:

```
What is the capital of France?	Paris	Geography	easy
What is 2+2?	4	Math	easy
What is the largest planet?	Jupiter	Astronomy	easy
```

Convert to JSON:

```bash
quiz-validator convert anki-export.txt --type anki --output quiz.json
```

Output `quiz.json`:

```json
[
  {
    "question": "What is the capital of France?",
    "explanation": "Paris",
    "category": "Geography",
    "tags": ["Geography", "easy"]
  },
  {
    "question": "What is 2+2?",
    "explanation": "4",
    "category": "Math",
    "tags": ["Math", "easy"]
  },
  {
    "question": "What is the largest planet?",
    "explanation": "Jupiter",
    "category": "Astronomy",
    "tags": ["Astronomy", "easy"]
  }
]
```

### Example 8: Convert from CSV Format

Create a CSV file `questions.csv`:

```csv
question,answer,option1,option2,option3,option4
"What is the capital of France?","Paris","London","Berlin","Madrid"
"What is 2+2?","4","3","5","6"
"What is the largest planet?","Jupiter","Mars","Saturn","Venus"
```

Convert to JSON:

```bash
quiz-validator convert questions.csv --type csv --output quiz.json
```

### Example 9: Convert from Quizlet Format

Create a Quizlet export file `quizlet-export.txt`:

```
What is the capital of France?
Paris
What is 2+2?
4
What is the largest planet?
Jupiter
```

Convert to JSON:

```bash
quiz-validator convert quizlet-export.txt --type quizlet --output quiz.json
```

## Batch Processing

### Example 10: Validate All Quizzes in a Directory

```bash
quiz-validator batch ./quizzes
```

Output:

```
✓ Found 3 JSON files
✓ Validating quiz1.json...
✓ Validating quiz2.json...
✓ Validating quiz3.json...

# Batch Validation Summary

📁 Total Files: 3
📝 Total Questions: 15
✅ Passed: 14
❌ Failed: 1

## File Results

✅ **quiz1.json**: 5/5 passed
✅ **quiz2.json**: 5/5 passed
⚠️ **quiz3.json**: 4/5 passed
```

### Example 11: Recursive Batch Validation

```bash
quiz-validator batch ./quizzes --recursive --output summary.md
```

This:
- Scans all subdirectories
- Validates all JSON files found
- Saves the summary report to `summary.md`

### Example 12: Batch Validation with Report

```bash
quiz-validator batch ./quizzes --recursive --output batch-report.md
cat batch-report.md
```

## Output Formats

### Example 13: Comparing Output Formats

#### Markdown Output (Default)

```bash
quiz-validator validate quiz.json --format markdown
```

Human-readable format with:
- Clear section headers
- Emoji indicators (✅/❌)
- Error and warning details
- Formatted for documentation

#### JSON Output

```bash
quiz-validator validate quiz.json --format json
```

Structured format with:
- Complete validation data
- Suitable for programmatic processing
- Easy to parse and analyze

#### HTML Output

```bash
quiz-validator validate quiz.json --format html --output report.html
```

Interactive format with:
- Visual styling
- Chart.js visualization
- Browser-viewable
- Professional appearance

## Workflow Examples

### Example 14: Complete Quiz Development Workflow

```bash
# 1. Convert from Anki format
quiz-validator convert anki-deck.txt --type anki --output quiz.json

# 2. Validate the converted quiz
quiz-validator validate quiz.json --format markdown --output validation.md

# 3. Review the validation report
cat validation.md

# 4. Generate HTML report for stakeholders
quiz-validator validate quiz.json --format html --output report.html

# 5. Batch validate all quizzes in the project
quiz-validator batch ./quizzes --recursive --output project-summary.md
```

### Example 15: Continuous Integration

```bash
#!/bin/bash
# validate-quizzes.sh

echo "Validating all quiz files..."
quiz-validator batch ./quizzes --recursive

if [ $? -eq 0 ]; then
  echo "✅ All quizzes passed validation"
  exit 0
else
  echo "❌ Some quizzes failed validation"
  exit 1
fi
```

Run in CI/CD:

```bash
chmod +x validate-quizzes.sh
./validate-quizzes.sh
```

## Tips and Tricks

### Tip 1: Pipe Output to File

```bash
quiz-validator validate quiz.json > report.txt
```

### Tip 2: Use with grep to Find Issues

```bash
quiz-validator validate quiz.json --format markdown | grep -A5 "❌ FAIL"
```

### Tip 3: Batch Validate with Filtering

```bash
# Only validate .json files in a specific directory
quiz-validator batch ./important-quizzes --recursive
```

### Tip 4: Generate Multiple Reports

```bash
# Generate all three formats
quiz-validator validate quiz.json --format json --output report.json
quiz-validator validate quiz.json --format html --output report.html
quiz-validator validate quiz.json --format markdown --output report.md
```

## Troubleshooting

### Issue: Command not found

**Solution**: Ensure the package is installed globally:

```bash
npm install -g @omochikun/quiz-validator
```

### Issue: Invalid JSON file

**Solution**: Validate your JSON syntax:

```bash
cat quiz.json | jq .
```

### Issue: File not found

**Solution**: Use absolute paths:

```bash
quiz-validator validate /full/path/to/quiz.json
```

### Issue: Permission denied

**Solution**: Check file permissions:

```bash
chmod 644 quiz.json
```

## Additional Resources

- [Main Documentation](../README.md)
- [GitHub Repository](https://github.com/Omochikun55/quiz-validator)
- [npm Package](https://www.npmjs.com/package/@omochikun/quiz-validator)
