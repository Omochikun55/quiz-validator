export function formatHtml(result: any, questions: any[]): string {
  const { summary, results } = result;

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz Validation Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .pass { color: green; }
    .fail { color: red; }
    .question { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
    canvas { max-width: 600px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Quiz Validation Report</h1>

  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Total Questions:</strong> ${summary.total}</p>
    <p class="pass"><strong>Passed:</strong> ${summary.passed}</p>
    <p class="fail"><strong>Failed:</strong> ${summary.failed}</p>
    <p><strong>Average Score:</strong> ${summary.averageScore.toFixed(1)}/100</p>
  </div>

  <canvas id="scoreChart"></canvas>

  <h2>Detailed Results</h2>`;

  results.forEach((r: any, i: number) => {
    const status = r.valid ? '<span class="pass">✓ PASS</span>' : '<span class="fail">✗ FAIL</span>';
    html += `
    <div class="question">
      <h3>Question ${i + 1} ${status}</h3>
      <p><strong>Score:</strong> ${r.score}/100</p>
      <p><strong>Question:</strong> ${questions[i].question}</p>`;

    if (r.errors.length > 0) {
      html += '<p><strong>Errors:</strong></p><ul>';
      r.errors.forEach((e: any) => {
        html += `<li>${e.field}: ${e.message}</li>`;
      });
      html += '</ul>';
    }

    html += '</div>';
  });

  html += `
  <script>
    const ctx = document.getElementById('scoreChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(results.map((_: any, i: number) => `Q${i + 1}`))},
        datasets: [{
          label: 'Score',
          data: ${JSON.stringify(results.map((r: any) => r.score))},
          backgroundColor: ${JSON.stringify(results.map((r: any) => r.valid ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'))},
        }]
      },
      options: {
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    });
  </script>
</body>
</html>`;

  return html;
}
