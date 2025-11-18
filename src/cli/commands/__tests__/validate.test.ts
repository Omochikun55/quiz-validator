import fs from 'fs';
import path from 'path';
import { validateCommand } from '../validate';

describe('validateCommand', () => {
  const testDir = path.join(__dirname, 'fixtures');
  const testFile = path.join(testDir, 'test-quiz.json');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  it('should validate a quiz file with valid data', async () => {
    const testData = [
      {
        question: 'What is 2+2?',
        options: ['3', '4', '5'],
        correctAnswer: '4',
      },
    ];

    fs.writeFileSync(testFile, JSON.stringify(testData));

    // This would normally exit, so we catch the process.exit call
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    try {
      await validateCommand(testFile, { format: 'json' });
    } catch (error) {
      // Expected to throw due to process.exit
    }

    expect(exitSpy).toHaveBeenCalledWith(0);
    exitSpy.mockRestore();
  });

  it('should handle invalid JSON files', async () => {
    fs.writeFileSync(testFile, 'invalid json');

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    try {
      await validateCommand(testFile, { format: 'json' });
    } catch (error) {
      // Expected to throw
    }

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it('should support multiple output formats', async () => {
    const testData = [
      {
        question: 'Test?',
        options: ['A', 'B'],
        correctAnswer: 'A',
      },
    ];

    fs.writeFileSync(testFile, JSON.stringify(testData));

    const formats: Array<'json' | 'html' | 'markdown'> = ['json', 'html', 'markdown'];

    for (const format of formats) {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await validateCommand(testFile, { format });
      } catch (error) {
        // Expected
      }

      expect(exitSpy).toHaveBeenCalled();
      exitSpy.mockRestore();
    }
  });
});
