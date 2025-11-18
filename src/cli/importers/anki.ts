interface AnkiCard {
  front: string;
  back: string;
  tags?: string[];
}

export function convertFromAnki(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  const questions: any[] = [];

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 2) continue;

    const [front, back, ...tags] = parts;

    questions.push({
      question: front.trim(),
      explanation: back.trim(),
      category: tags.length > 0 ? tags[0].trim() : undefined,
      tags: tags.map(t => t.trim()),
    });
  }

  return questions;
}
