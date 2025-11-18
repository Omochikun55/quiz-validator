export function formatMarkdown(result: any, questions: any[]): string {
  const { summary, results } = result;

  let report = '# Quiz Validation Report\n\n';
  report += '## Summary\n\n';
  report += `- **Total Questions**: ${summary.total}\n`;
  report += `- **Passed**: ✅ ${summary.passed}\n`;
  report += `- **Failed**: ❌ ${summary.failed}\n`;
  report += `- **Average Score**: ${summary.averageScore.toFixed(1)}/100\n\n`;

  report += '---\n\n';
  report += '## Detailed Results\n\n';

  results.forEach((r: any, i: number) => {
    const status = r.valid ? '✅ PASS' : '❌ FAIL';
    report += `### Question ${i + 1} ${status}\n\n`;
    report += `**Score**: ${r.score}/100\n\n`;
    report += `**Question**: ${questions[i].question}\n\n`;

    if (r.errors.length > 0) {
      report += '**Errors**:\n';
      r.errors.forEach((e: any) => {
        report += `- \`${e.field}\`: ${e.message}\n`;
      });
      report += '\n';
    }

    if (r.warnings.length > 0) {
      report += '**Warnings**:\n';
      r.warnings.forEach((w: any) => {
        report += `- \`${w.field}\`: ${w.message}\n`;
      });
      report += '\n';
    }

    report += '---\n\n';
  });

  return report;
}
