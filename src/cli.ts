#!/usr/bin/env node
import { Command } from 'commander';
import { validateCommand } from './cli/commands/validate';
import { batchCommand } from './cli/commands/batch';
import { convertCommand } from './cli/commands/convert';

const program = new Command();

program
  .name('quiz-validator')
  .description('Quiz validation CLI tool')
  .version('1.1.0');

program
  .command('validate <file>')
  .description('Validate a quiz JSON file')
  .option('-f, --format <type>', 'Output format (json|html|markdown)', 'markdown')
  .option('-o, --output <file>', 'Output file path')
  .option('--strict', 'Enable strict validation mode')
  .action(validateCommand);

program
  .command('batch <directory>')
  .description('Validate multiple quiz files in a directory')
  .option('-r, --recursive', 'Scan subdirectories')
  .option('-o, --output <file>', 'Summary report output file')
  .action(batchCommand);

program
  .command('convert <input>')
  .description('Convert quiz data from other formats')
  .option('-t, --type <format>', 'Source format (anki|csv|quizlet)', 'anki')
  .option('-o, --output <file>', 'Output JSON file')
  .action(convertCommand);

program.parse(process.argv);
