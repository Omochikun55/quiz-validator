import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { validateQuizSet } from '../../index';
import { formatJson } from '../formatters/json';
import { formatHtml } from '../formatters/html';
import { formatMarkdown } from '../formatters/markdown';

interface ValidateOptions {
  format: 'json' | 'html' | 'markdown';
  output?: string;
  strict?: boolean;
}

export async function validateCommand(file: string, options: ValidateOptions) {
  const spinner = ora(`Loading ${file}...`).start();

  try {
    // ファイル読み込み
    const content = fs.readFileSync(file, 'utf-8');
    const questions = JSON.parse(content);
    spinner.text = 'Validating questions...';

    // バリデーション実行
    const result = validateQuizSet(questions, {
      requireExplanation: options.strict,
      requireCategory: options.strict,
      requireDifficulty: options.strict,
    });

    spinner.succeed('Validation complete');

    // 結果フォーマット
    let output: string;
    switch (options.format) {
      case 'json':
        output = formatJson(result);
        break;
      case 'html':
        output = formatHtml(result, questions);
        break;
      case 'markdown':
      default:
        output = formatMarkdown(result, questions);
        break;
    }

    // 出力
    if (options.output) {
      fs.writeFileSync(options.output, output);
      console.log(chalk.green(`✓ Report saved to ${options.output}`));
    } else {
      console.log(output);
    }

    // サマリー表示
    console.log(chalk.bold('\n📊 Summary:'));
    console.log(`Total: ${result.summary.total}`);
    console.log(chalk.green(`Passed: ${result.summary.passed}`));
    console.log(chalk.red(`Failed: ${result.summary.failed}`));
    console.log(`Average Score: ${result.summary.averageScore.toFixed(1)}/100`);

    process.exit(result.valid ? 0 : 1);
  } catch (error) {
    spinner.fail('Validation failed');
    console.error(chalk.red('Error:'), (error as Error).message);
    process.exit(1);
  }
}
