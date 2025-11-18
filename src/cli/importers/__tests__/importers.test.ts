import { convertFromAnki } from '../anki';
import { convertFromCsv } from '../csv';
import { convertFromQuizlet } from '../quizlet';

describe('Importers', () => {
  describe('convertFromAnki', () => {
    it('should convert Anki TSV format to questions', () => {
      const ankiData = 'What is 2+2?\t4\tMath\nWhat is 3+3?\t6\tMath';
      const result = convertFromAnki(ankiData);

      expect(result).toHaveLength(2);
      expect(result[0].question).toBe('What is 2+2?');
      expect(result[0].explanation).toBe('4');
      expect(result[0].category).toBe('Math');
    });

    it('should handle tags in Anki format', () => {
      const ankiData = 'Term\tDefinition\tTag1\tTag2';
      const result = convertFromAnki(ankiData);

      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('Tag1');
      expect(result[0].tags).toContain('Tag2');
    });

    it('should skip incomplete lines', () => {
      const ankiData = 'Question only\nQuestion\tAnswer';
      const result = convertFromAnki(ankiData);

      expect(result).toHaveLength(1);
    });
  });

  describe('convertFromCsv', () => {
    it('should convert CSV format to questions', () => {
      const csvData = 'question,answer,option1,option2\n"What is 2+2?","4","3","5"';
      const result = convertFromCsv(csvData);

      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('What is 2+2?');
      expect(result[0].correctAnswer).toBe('4');
      expect(result[0].options).toContain('3');
      expect(result[0].options).toContain('5');
    });

    it('should handle quoted CSV values', () => {
      const csvData = 'question,answer\n"Question with, comma","Answer"';
      const result = convertFromCsv(csvData);

      expect(result).toHaveLength(1);
      expect(result[0].question).toContain('comma');
    });

    it('should handle up to 4 options', () => {
      const csvData = 'q,a,o1,o2,o3,o4,o5\n"Q","A","1","2","3","4","5"';
      const result = convertFromCsv(csvData);

      expect(result[0].options).toHaveLength(4);
    });
  });

  describe('convertFromQuizlet', () => {
    it('should convert Quizlet format to questions', () => {
      const quizletData = 'Term 1\nDefinition 1\nTerm 2\nDefinition 2';
      const result = convertFromQuizlet(quizletData);

      expect(result).toHaveLength(2);
      expect(result[0].question).toBe('Term 1');
      expect(result[0].explanation).toBe('Definition 1');
      expect(result[1].question).toBe('Term 2');
      expect(result[1].explanation).toBe('Definition 2');
    });

    it('should handle odd number of lines', () => {
      const quizletData = 'Term 1\nDefinition 1\nTerm 2';
      const result = convertFromQuizlet(quizletData);

      expect(result).toHaveLength(1);
    });

    it('should trim whitespace', () => {
      const quizletData = '  Term 1  \n  Definition 1  ';
      const result = convertFromQuizlet(quizletData);

      expect(result[0].question).toBe('Term 1');
      expect(result[0].explanation).toBe('Definition 1');
    });
  });
});
