import { formatJson } from '../json';
import { formatHtml } from '../html';
import { formatMarkdown } from '../markdown';

describe('Formatters', () => {
  const mockResult = {
    valid: true,
    results: [
      {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
      },
      {
        valid: false,
        errors: [{ field: 'question', message: 'Required field' }],
        warnings: [],
        score: 50,
      },
    ],
    summary: {
      total: 2,
      passed: 1,
      failed: 1,
      averageScore: 75,
    },
  };

  const mockQuestions = [
    { question: 'What is 2+2?' },
    { question: 'What is 3+3?' },
  ];

  describe('formatJson', () => {
    it('should format result as JSON', () => {
      const output = formatJson(mockResult);
      const parsed = JSON.parse(output);

      expect(parsed.valid).toBe(true);
      expect(parsed.summary.total).toBe(2);
      expect(parsed.summary.passed).toBe(1);
    });

    it('should be valid JSON', () => {
      const output = formatJson(mockResult);
      expect(() => JSON.parse(output)).not.toThrow();
    });
  });

  describe('formatHtml', () => {
    it('should format result as HTML', () => {
      const output = formatHtml(mockResult, mockQuestions);

      expect(output).toContain('<!DOCTYPE html>');
      expect(output).toContain('Quiz Validation Report');
      expect(output).toContain('Total Questions');
    });

    it('should include summary information', () => {
      const output = formatHtml(mockResult, mockQuestions);

      expect(output).toContain('2');
      expect(output).toContain('1');
      expect(output).toContain('75');
    });

    it('should include Chart.js', () => {
      const output = formatHtml(mockResult, mockQuestions);
      expect(output).toContain('chart.js');
    });
  });

  describe('formatMarkdown', () => {
    it('should format result as Markdown', () => {
      const output = formatMarkdown(mockResult, mockQuestions);

      expect(output).toContain('# Quiz Validation Report');
      expect(output).toContain('## Summary');
      expect(output).toContain('## Detailed Results');
    });

    it('should include all questions', () => {
      const output = formatMarkdown(mockResult, mockQuestions);

      expect(output).toContain('Question 1');
      expect(output).toContain('Question 2');
    });

    it('should show pass/fail status', () => {
      const output = formatMarkdown(mockResult, mockQuestions);

      expect(output).toContain('✅ PASS');
      expect(output).toContain('❌ FAIL');
    });

    it('should include error details', () => {
      const output = formatMarkdown(mockResult, mockQuestions);

      expect(output).toContain('**Errors**');
      expect(output).toContain('Required field');
    });
  });
});
