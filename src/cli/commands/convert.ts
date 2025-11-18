import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { convertFromAnki } from '../importers/anki';
import { convertFromCsv } from '../importers/csv';
import { convertFromQuizlet } from '../importers/quizlet';

interface ConvertOptions {
  type: 'anki' | 'csv' | 'quizlet';
  output?: string;
}

export async function convertCommand(input: string, options: ConvertOptions) {
  const spinner = ora(`Converting from ${options.type} format...`).start();

  try {
    const content = fs.readFileSync(input, 'utf-8');
    let questions: any[];

    switch (options.type) {
      case 'anki':
        questions = convertFromAnki(content);
        break;
      case 'csv':
        questions = convertFromCsv(content);
        break;
      case 'quizlet':
        questions = convertFromQuizlet(content);
        break;
      default:
        throw new Error(`Unknown format: ${options.type}`);
    }

    spinner.succeed(`Converted ${questions.length} questions`);

    const output = JSON.stringify(questions, null, 2);

    if (options.output) {
      fs.writeFileSync(options.output, output);
      console.log(chalk.green(`✓ Saved to ${options.output}`));
    } else {
      console.log(output);
    }
  } catch (error) {
    spinner.fail('Conversion failed');
    console.error(chalk.red('Error:'), (error as Error).message);
    process.exit(1);
  }
}
