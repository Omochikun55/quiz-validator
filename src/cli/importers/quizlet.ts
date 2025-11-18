export function convertFromQuizlet(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  const questions: any[] = [];

  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 >= lines.length) break;

    const term = lines[i].trim();
    const definition = lines[i + 1].trim();

    questions.push({
      question: term,
      explanation: definition,
    });
  }

  return questions;
}
