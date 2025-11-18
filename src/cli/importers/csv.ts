export function convertFromCsv(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  const questions: any[] = [];

  // ヘッダー行をスキップ
  const headers = lines[0].split(',').map(h => h.trim());

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length < 2) continue;

    const question: any = {
      question: values[0],
      options: [],
      correctAnswer: values[1],
    };

    // オプション列がある場合
    for (let j = 2; j < values.length && j < 6; j++) {
      if (values[j]) {
        question.options.push(values[j]);
      }
    }

    questions.push(question);
  }

  return questions;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
