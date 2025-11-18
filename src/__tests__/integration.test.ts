import fs from 'fs';
import path from 'path';
import { validateQuizSet } from '../index';
import { formatJson } from '../cli/formatters/json';
import { formatHtml } from '../cli/formatters/html';
import { formatMarkdown } from '../cli/formatters/markdown';
import { convertFromAnki } from '../cli/importers/anki';
import { convertFromCsv } from '../cli/importers/csv';
import { convertFromQuizlet } from '../cli/importers/quizlet';

describe('Integration Tests', () => {
  const sampleQuestions = [
    {
      question: 'What is the capital of France?',
      options: ['London', 'Paris', 'Berlin', 'Madrid'],
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital and most populous city of France.',
      category: 'Geography',
      difficulty: 'easy',
    },
    {
      question: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      explanation: 'The sum of 2 and 2 is 4.',
      category: 'Math',
      difficulty: 'easy',
    },
  ];

  describe('Validation and Formatting Pipeline', () => {
    it('should validate questions and format as JSON', () => {
      const result = validateQuizSet(sampleQuestions);
      const formatted = formatJson(result);

      expect(() => JSON.parse(formatted)).not.toThrow();
      expect(formatted).toContain('valid');
      expect(formatted).toContain('summary');
    });

    it('should validate questions and format as HTML', () => {
      const result = validateQuizSet(sampleQuestions);
      const formatted = formatHtml(result, sampleQuestions);

      expect(formatted).toContain('<!DOCTYPE html>');
      expect(formatted).toContain('Quiz Validation Report');
      expect(formatted).toContain('Paris');
    });

    it('should validate questions and format as Markdown', () => {
      const result = validateQuizSet(sampleQuestions);
      const formatted = formatMarkdown(result, sampleQuestions);

      expect(formatted).toContain('# Quiz Validation Report');
      expect(formatted).toContain('Paris');
      expect(formatted).toContain('✅ PASS');
    });
  });

  describe('Import and Validation Pipeline', () => {
    it('should import from Anki and validate', () => {
      const ankiData = 'Paris\tCapital of France\tGeography\nBerlin\tCapital of Germany\tGeography';
      const questions = convertFromAnki(ankiData);
      const result = validateQuizSet(questions);

      expect(result.summary.total).toBe(2);
      expect(result.valid).toBe(true);
    });

    it('should import from CSV and validate', () => {
      const csvData = 'question,answer,opt1,opt2\n"What?","A","B","C"';
      const questions = convertFromCsv(csvData);
      const result = validateQuizSet(questions);

      expect(result.summary.total).toBe(1);
    });

    it('should import from Quizlet and validate', () => {
      const quizletData = 'Term 1\nDef 1\nTerm 2\nDef 2';
      const questions = convertFromQuizlet(quizletData);
      const result = validateQuizSet(questions);

      expect(result.summary.total).toBe(2);
    });
  });

  describe('End-to-End Workflow', () => {
    it('should handle complete validation workflow', () => {
      // 1. Validate questions
      const validationResult = validateQuizSet(sampleQuestions);
      expect(validationResult.valid).toBe(true);
      expect(validationResult.summary.passed).toBe(2);

      // 2. Format in multiple formats
      const jsonOutput = formatJson(validationResult);
      const htmlOutput = formatHtml(validationResult, sampleQuestions);
      const markdownOutput = formatMarkdown(validationResult, sampleQuestions);

      // 3. Verify all formats are valid
      expect(() => JSON.parse(jsonOutput)).not.toThrow();
      expect(htmlOutput).toContain('<!DOCTYPE html>');
      expect(markdownOutput).toContain('# Quiz Validation Report');
    });

    it('should handle import and validation workflow', () => {
      // 1. Import from Anki
      const ankiData = 'Q1\tA1\nQ2\tA2';
      const importedQuestions = convertFromAnki(ankiData);

      // 2. Validate imported questions
      const result = validateQuizSet(importedQuestions);

      // 3. Format result
      const formatted = formatMarkdown(result, importedQuestions);

      expect(formatted).toContain('Q1');
      expect(formatted).toContain('Q2');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid questions gracefully', () => {
      const invalidQuestions = [
        {
          // Missing required fields
          question: 'Test?',
        },
      ];

      const result = validateQuizSet(invalidQuestions);
      expect(result.valid).toBe(false);
      expect(result.summary.failed).toBe(1);
    });

    it('should handle empty question arrays', () => {
      const result = validateQuizSet([]);
      expect(result.summary.total).toBe(0);
      expect(result.valid).toBe(true);
    });
  });
});
