import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { validateQuizSet } from '../../index';

interface BatchOptions {
  recursive?: boolean;
  output?: string;
}

interface FileResult {
  file: string;
  total: number;
  passed: number;
  failed: number;
  averageScore: number;
}

export async function batchCommand(directory: string, options: BatchOptions) {
  const spinner = ora('Scanning directory...').start();

  try {
    const files = findJsonFiles(directory, options.recursive || false);
    spinner.succeed(`Found ${files.length} JSON files`);

    const results: FileResult[] = [];
    let totalQuestions = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    for (const file of files) {
      const spinner2 = ora(`Validating ${path.basename(file)}...`).start();

      const content = fs.readFileSync(file, 'utf-8');
      const questions = JSON.parse(content);
      const result = validateQuizSet(questions);

      totalQuestions += result.summary.total;
      totalPassed += result.summary.passed;
      totalFailed += result.summary.failed;

      results.push({
        file: path.relative(directory, file),
        ...result.summary,
      });

      spinner2.succeed();
    }

    // サマリーレポート生成
    const report = generateBatchSummary(results, {
      totalFiles: files.length,
      totalQuestions,
      totalPassed,
      totalFailed,
    });

    if (options.output) {
      fs.writeFileSync(options.output, report);
      console.log(chalk.green(`✓ Summary saved to ${options.output}`));
    } else {
      console.log(report);
    }
  } catch (error) {
    spinner.fail('Batch validation failed');
    console.error(chalk.red('Error:'), (error as Error).message);
    process.exit(1);
  }
}

function findJsonFiles(dir: string, recursive: boolean): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && recursive) {
      files.push(...findJsonFiles(fullPath, recursive));
    } else if (stat.isFile() && item.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

function generateBatchSummary(results: FileResult[], totals: any): string {
  let report = '# Batch Validation Summary\n\n';
  report += `📁 Total Files: ${totals.totalFiles}\n`;
  report += `📝 Total Questions: ${totals.totalQuestions}\n`;
  report += `✅ Passed: ${totals.totalPassed}\n`;
  report += `❌ Failed: ${totals.totalFailed}\n\n`;
  report += '## File Results\n\n';

  for (const result of results) {
    const status = result.failed === 0 ? '✅' : '⚠️';
    report += `${status} **${result.file}**: ${result.passed}/${result.total} passed\n`;
  }

  return report;
}
