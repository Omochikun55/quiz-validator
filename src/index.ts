/**
 * @omochikun/quiz-validator
 * Validation library for quiz and question data
 */

export interface ValidationRule {
  field: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  errorMessage?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  rule?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score: number;
}

export interface QuizQuestion {
  id?: string | number;
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  category?: string;
  difficulty?: string | number;
  [key: string]: any;
}

export interface QuizValidationOptions {
  questionMinLength?: number;
  questionMaxLength?: number;
  optionMinLength?: number;
  optionMaxLength?: number;
  explanationMinLength?: number;
  explanationMaxLength?: number;
  minOptions?: number;
  maxOptions?: number;
  requireExplanation?: boolean;
  requireCategory?: boolean;
  requireDifficulty?: boolean;
  customRules?: ValidationRule[];
}

const DEFAULT_OPTIONS: Required<Omit<QuizValidationOptions, 'customRules'>> = {
  questionMinLength: 5,
  questionMaxLength: 500,
  optionMinLength: 1,
  optionMaxLength: 200,
  explanationMinLength: 10,
  explanationMaxLength: 1000,
  minOptions: 2,
  maxOptions: 10,
  requireExplanation: false,
  requireCategory: false,
  requireDifficulty: false,
};

/**
 * Validate a single field against a rule
 */
export function validateField(
  value: any,
  rule: ValidationRule
): ValidationError | null {
  // Required check
  if (rule.required && (value === undefined || value === null || value === '')) {
    return {
      field: rule.field,
      message: rule.errorMessage || `${rule.field} is required`,
      value,
      rule: 'required',
    };
  }

  // Skip other checks if value is empty and not required
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return null;
  }

  // String length checks
  if (typeof value === 'string') {
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      return {
        field: rule.field,
        message:
          rule.errorMessage ||
          `${rule.field} must be at least ${rule.minLength} characters (got ${value.length})`,
        value,
        rule: 'minLength',
      };
    }

    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      return {
        field: rule.field,
        message:
          rule.errorMessage ||
          `${rule.field} must be at most ${rule.maxLength} characters (got ${value.length})`,
        value,
        rule: 'maxLength',
      };
    }
  }

  // Pattern check
  if (rule.pattern && typeof value === 'string') {
    if (!rule.pattern.test(value)) {
      return {
        field: rule.field,
        message: rule.errorMessage || `${rule.field} does not match required pattern`,
        value,
        rule: 'pattern',
      };
    }
  }

  // Custom validator
  if (rule.customValidator && !rule.customValidator(value)) {
    return {
      field: rule.field,
      message: rule.errorMessage || `${rule.field} failed custom validation`,
      value,
      rule: 'custom',
    };
  }

  return null;
}

/**
 * Validate quiz question data
 */
export function validateQuizQuestion(
  question: QuizQuestion,
  options: QuizValidationOptions = {}
): ValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate question text
  const questionError = validateField(question.question, {
    field: 'question',
    required: true,
    minLength: opts.questionMinLength,
    maxLength: opts.questionMaxLength,
  });
  if (questionError) errors.push(questionError);

  // Validate options
  if (question.options) {
    if (question.options.length < opts.minOptions) {
      errors.push({
        field: 'options',
        message: `At least ${opts.minOptions} options required (got ${question.options.length})`,
        value: question.options.length,
        rule: 'minOptions',
      });
    }

    if (question.options.length > opts.maxOptions) {
      errors.push({
        field: 'options',
        message: `At most ${opts.maxOptions} options allowed (got ${question.options.length})`,
        value: question.options.length,
        rule: 'maxOptions',
      });
    }

    // Validate each option
    question.options.forEach((option, index) => {
      const optionError = validateField(option, {
        field: `options[${index}]`,
        required: true,
        minLength: opts.optionMinLength,
        maxLength: opts.optionMaxLength,
      });
      if (optionError) errors.push(optionError);
    });

    // Check for duplicate options
    const uniqueOptions = new Set(question.options);
    if (uniqueOptions.size !== question.options.length) {
      warnings.push({
        field: 'options',
        message: 'Duplicate options detected',
        rule: 'duplicates',
      });
    }
  }

  // Validate explanation
  if (opts.requireExplanation || question.explanation) {
    const explanationError = validateField(question.explanation, {
      field: 'explanation',
      required: opts.requireExplanation,
      minLength: opts.explanationMinLength,
      maxLength: opts.explanationMaxLength,
    });
    if (explanationError) errors.push(explanationError);
  }

  // Validate category
  if (opts.requireCategory) {
    const categoryError = validateField(question.category, {
      field: 'category',
      required: true,
    });
    if (categoryError) errors.push(categoryError);
  }

  // Validate difficulty
  if (opts.requireDifficulty) {
    const difficultyError = validateField(question.difficulty, {
      field: 'difficulty',
      required: true,
    });
    if (difficultyError) errors.push(difficultyError);
  }

  // Apply custom rules
  if (options.customRules) {
    for (const rule of options.customRules) {
      const value = question[rule.field];
      const error = validateField(value, rule);
      if (error) errors.push(error);
    }
  }

  // Calculate score (0-100)
  const totalChecks =
    4 + // base fields (question, options count, duplicates, correctAnswer)
    (question.options?.length || 0) + // individual options
    (opts.requireExplanation ? 1 : 0) +
    (opts.requireCategory ? 1 : 0) +
    (opts.requireDifficulty ? 1 : 0) +
    (options.customRules?.length || 0);

  const failedChecks = errors.length;
  const score = Math.max(0, Math.round(((totalChecks - failedChecks) / totalChecks) * 100));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

/**
 * Validate array of quiz questions
 */
export function validateQuizSet(
  questions: QuizQuestion[],
  options: QuizValidationOptions = {}
): {
  valid: boolean;
  results: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    averageScore: number;
  };
} {
  const results = questions.map((q) => validateQuizQuestion(q, options));

  const passed = results.filter((r) => r.valid).length;
  const failed = results.filter((r) => !r.valid).length;
  const averageScore =
    results.reduce((sum, r) => sum + r.score, 0) / Math.max(1, results.length);

  return {
    valid: failed === 0,
    results,
    summary: {
      total: questions.length,
      passed,
      failed,
      averageScore: Math.round(averageScore),
    },
  };
}

/**
 * Generate validation report
 */
export function generateReport(result: ValidationResult, questionId?: string | number): string {
  const lines: string[] = [];

  if (questionId !== undefined) {
    lines.push(`## Question ${questionId}`);
  }

  lines.push(`**Score**: ${result.score}/100`);
  lines.push(`**Status**: ${result.valid ? '✅ PASS' : '❌ FAIL'}`);
  lines.push('');

  if (result.errors.length > 0) {
    lines.push('### Errors');
    result.errors.forEach((error) => {
      lines.push(`- **${error.field}**: ${error.message}`);
    });
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push('### Warnings');
    result.warnings.forEach((warning) => {
      lines.push(`- **${warning.field}**: ${warning.message}`);
    });
    lines.push('');
  }

  if (result.valid) {
    lines.push('✅ All validation checks passed!');
  }

  return lines.join('\n');
}

/**
 * Batch validation report for multiple questions
 */
export function generateBatchReport(
  questions: QuizQuestion[],
  results: ValidationResult[]
): string {
  const lines: string[] = [];

  lines.push('# Quiz Validation Report');
  lines.push('');

  const passed = results.filter((r) => r.valid).length;
  const failed = results.filter((r) => !r.valid).length;
  const avgScore =
    results.reduce((sum, r) => sum + r.score, 0) / Math.max(1, results.length);

  lines.push('## Summary');
  lines.push(`- **Total Questions**: ${results.length}`);
  lines.push(`- **Passed**: ${passed} (${Math.round((passed / results.length) * 100)}%)`);
  lines.push(`- **Failed**: ${failed} (${Math.round((failed / results.length) * 100)}%)`);
  lines.push(`- **Average Score**: ${Math.round(avgScore)}/100`);
  lines.push('');

  // Failed questions
  if (failed > 0) {
    lines.push('## Failed Questions');
    results.forEach((result, index) => {
      if (!result.valid) {
        lines.push('');
        lines.push(generateReport(result, questions[index].id || index + 1));
      }
    });
  }

  return lines.join('\n');
}
