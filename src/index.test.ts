import {
  validateField,
  validateQuizQuestion,
  validateQuizSet,
  generateReport,
  generateBatchReport,
  ValidationRule,
  QuizQuestion,
} from './index';

describe('quiz-validator', () => {
  describe('validateField', () => {
    it('should pass valid required field', () => {
      const rule: ValidationRule = {
        field: 'test',
        required: true,
      };
      expect(validateField('value', rule)).toBeNull();
    });

    it('should fail missing required field', () => {
      const rule: ValidationRule = {
        field: 'test',
        required: true,
      };
      const error = validateField('', rule);
      expect(error).not.toBeNull();
      expect(error?.rule).toBe('required');
    });

    it('should validate minLength', () => {
      const rule: ValidationRule = {
        field: 'test',
        minLength: 5,
      };
      expect(validateField('abc', rule)).not.toBeNull();
      expect(validateField('abcdef', rule)).toBeNull();
    });

    it('should validate maxLength', () => {
      const rule: ValidationRule = {
        field: 'test',
        maxLength: 5,
      };
      expect(validateField('abcdef', rule)).not.toBeNull();
      expect(validateField('abc', rule)).toBeNull();
    });

    it('should validate pattern', () => {
      const rule: ValidationRule = {
        field: 'email',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      };
      expect(validateField('invalid', rule)).not.toBeNull();
      expect(validateField('test@example.com', rule)).toBeNull();
    });

    it('should use custom validator', () => {
      const rule: ValidationRule = {
        field: 'even',
        customValidator: (value) => value % 2 === 0,
      };
      expect(validateField(3, rule)).not.toBeNull();
      expect(validateField(4, rule)).toBeNull();
    });

    it('should use custom error message', () => {
      const rule: ValidationRule = {
        field: 'test',
        required: true,
        errorMessage: 'Custom error message',
      };
      const error = validateField('', rule);
      expect(error?.message).toBe('Custom error message');
    });

    it('should skip validation for optional empty field', () => {
      const rule: ValidationRule = {
        field: 'optional',
        minLength: 5,
      };
      expect(validateField('', rule)).toBeNull();
      expect(validateField(undefined, rule)).toBeNull();
    });
  });

  describe('validateQuizQuestion', () => {
    it('should validate a complete valid question', () => {
      const question: QuizQuestion = {
        id: 1,
        question: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctAnswer: 'Paris',
        explanation: 'Paris is the capital and largest city of France.',
        category: 'Geography',
        difficulty: 'easy',
      };

      const result = validateQuizQuestion(question);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(90);
    });

    it('should fail for missing question text', () => {
      const question: QuizQuestion = {
        question: '',
        options: ['A', 'B'],
      };

      const result = validateQuizQuestion(question);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'question')).toBe(true);
    });

    it('should fail for question too short', () => {
      const question: QuizQuestion = {
        question: 'Hi?',
        options: ['A', 'B'],
      };

      const result = validateQuizQuestion(question);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.rule === 'minLength')).toBe(true);
    });

    it('should fail for question too long', () => {
      const question: QuizQuestion = {
        question: 'A'.repeat(600),
        options: ['A', 'B'],
      };

      const result = validateQuizQuestion(question, {
        questionMaxLength: 500,
      });
      expect(result.valid).toBe(false);
    });

    it('should validate option count', () => {
      const question: QuizQuestion = {
        question: 'Test question?',
        options: ['A'],
      };

      const result = validateQuizQuestion(question, {
        minOptions: 2,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'options')).toBe(true);
    });

    it('should validate individual option length', () => {
      const question: QuizQuestion = {
        question: 'Test question?',
        options: ['A'.repeat(250), 'B'],
      };

      const result = validateQuizQuestion(question, {
        optionMaxLength: 200,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field.startsWith('options['))).toBe(true);
    });

    it('should detect duplicate options', () => {
      const question: QuizQuestion = {
        question: 'Test question?',
        options: ['Same', 'Different', 'Same'],
      };

      const result = validateQuizQuestion(question);
      expect(result.warnings.some((w) => w.rule === 'duplicates')).toBe(true);
    });

    it('should validate explanation when required', () => {
      const question: QuizQuestion = {
        question: 'Test question?',
        options: ['A', 'B'],
      };

      const result = validateQuizQuestion(question, {
        requireExplanation: true,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'explanation')).toBe(true);
    });

    it('should validate explanation length', () => {
      const question: QuizQuestion = {
        question: 'Test question?',
        options: ['A', 'B'],
        explanation: 'Short',
      };

      const result = validateQuizQuestion(question, {
        requireExplanation: true,
        explanationMinLength: 10,
      });
      expect(result.valid).toBe(false);
    });

    it('should validate category when required', () => {
      const question: QuizQuestion = {
        question: 'Test question?',
        options: ['A', 'B'],
      };

      const result = validateQuizQuestion(question, {
        requireCategory: true,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'category')).toBe(true);
    });

    it('should validate difficulty when required', () => {
      const question: QuizQuestion = {
        question: 'Test question?',
        options: ['A', 'B'],
      };

      const result = validateQuizQuestion(question, {
        requireDifficulty: true,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'difficulty')).toBe(true);
    });

    it('should apply custom rules', () => {
      const question: QuizQuestion = {
        question: 'Test question?',
        options: ['A', 'B'],
        points: 5,
      };

      const result = validateQuizQuestion(question, {
        customRules: [
          {
            field: 'points',
            customValidator: (value) => value >= 10,
            errorMessage: 'Points must be at least 10',
          },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'points')).toBe(true);
    });

    it('should calculate score correctly', () => {
      const question: QuizQuestion = {
        question: 'Test question?',
        options: ['A', 'B'],
      };

      const result = validateQuizQuestion(question);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('validateQuizSet', () => {
    it('should validate multiple questions', () => {
      const questions: QuizQuestion[] = [
        {
          question: 'Question 1?',
          options: ['A', 'B'],
        },
        {
          question: 'Question 2?',
          options: ['C', 'D'],
        },
      ];

      const result = validateQuizSet(questions);
      expect(result.results).toHaveLength(2);
      expect(result.summary.total).toBe(2);
    });

    it('should calculate summary correctly', () => {
      const questions: QuizQuestion[] = [
        {
          question: 'Valid question?',
          options: ['A', 'B'],
        },
        {
          question: '', // Invalid
          options: ['C'],
        },
      ];

      const result = validateQuizSet(questions);
      expect(result.summary.passed).toBe(1);
      expect(result.summary.failed).toBe(1);
      expect(result.valid).toBe(false);
    });

    it('should calculate average score', () => {
      const questions: QuizQuestion[] = [
        {
          question: 'Question 1?',
          options: ['A', 'B'],
        },
        {
          question: 'Question 2?',
          options: ['C', 'D'],
        },
      ];

      const result = validateQuizSet(questions);
      expect(result.summary.averageScore).toBeGreaterThan(0);
      expect(result.summary.averageScore).toBeLessThanOrEqual(100);
    });

    it('should handle empty array', () => {
      const result = validateQuizSet([]);
      expect(result.results).toHaveLength(0);
      expect(result.summary.total).toBe(0);
      expect(result.valid).toBe(true);
    });
  });

  describe('generateReport', () => {
    it('should generate report for valid question', () => {
      const question: QuizQuestion = {
        question: 'Test question?',
        options: ['A', 'B'],
      };

      const result = validateQuizQuestion(question);
      const report = generateReport(result, 1);

      expect(report).toContain('Question 1');
      expect(report).toContain('PASS');
      expect(report).toContain('Score');
    });

    it('should include errors in report', () => {
      const question: QuizQuestion = {
        question: '',
        options: ['A'],
      };

      const result = validateQuizQuestion(question);
      const report = generateReport(result);

      expect(report).toContain('FAIL');
      expect(report).toContain('Errors');
      expect(report).toContain('question');
    });

    it('should include warnings in report', () => {
      const question: QuizQuestion = {
        question: 'Test question?',
        options: ['Same', 'Same'],
      };

      const result = validateQuizQuestion(question);
      const report = generateReport(result);

      expect(report).toContain('Warnings');
      expect(report).toContain('Duplicate');
    });
  });

  describe('generateBatchReport', () => {
    it('should generate summary report', () => {
      const questions: QuizQuestion[] = [
        {
          id: 1,
          question: 'Question 1?',
          options: ['A', 'B'],
        },
        {
          id: 2,
          question: 'Question 2?',
          options: ['C', 'D'],
        },
      ];

      const results = questions.map((q) => validateQuizQuestion(q));
      const report = generateBatchReport(questions, results);

      expect(report).toContain('Quiz Validation Report');
      expect(report).toContain('Summary');
      expect(report).toContain('Total Questions');
      expect(report).toContain('Passed');
      expect(report).toContain('Average Score');
    });

    it('should include failed questions details', () => {
      const questions: QuizQuestion[] = [
        {
          id: 1,
          question: 'Valid question?',
          options: ['A', 'B'],
        },
        {
          id: 2,
          question: '', // Invalid
          options: ['C'],
        },
      ];

      const results = questions.map((q) => validateQuizQuestion(q));
      const report = generateBatchReport(questions, results);

      expect(report).toContain('Failed Questions');
      expect(report).toContain('Question 2');
    });
  });

  describe('Real-world scenarios', () => {
    it('should validate educational quiz', () => {
      const question: QuizQuestion = {
        id: 1,
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        explanation: 'Basic addition: 2 plus 2 equals 4.',
        category: 'Mathematics',
        difficulty: 1,
      };

      const result = validateQuizQuestion(question, {
        requireExplanation: true,
        requireCategory: true,
        requireDifficulty: true,
        explanationMinLength: 10,
      });

      expect(result.valid).toBe(true);
      expect(result.score).toBe(100);
    });

    it('should validate certification exam question', () => {
      const question: QuizQuestion = {
        id: 'CERT-001',
        question: 'Which protocol operates at the transport layer of the OSI model?',
        options: ['HTTP', 'TCP', 'IP', 'Ethernet'],
        correctAnswer: 'TCP',
        explanation:
          'TCP (Transmission Control Protocol) operates at Layer 4 (Transport Layer) of the OSI model.',
        category: 'Networking',
        difficulty: 'intermediate',
      };

      const result = validateQuizQuestion(question, {
        requireExplanation: true,
        questionMinLength: 10,
        explanationMinLength: 20,
      });

      expect(result.valid).toBe(true);
    });

    it('should detect common mistakes', () => {
      const question: QuizQuestion = {
        question: 'Q?', // Too short
        options: ['Same answer', 'Same answer'], // Duplicates
        explanation: 'Short', // Too short
      };

      const result = validateQuizQuestion(question, {
        requireExplanation: true,
        questionMinLength: 10,
        explanationMinLength: 20,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
