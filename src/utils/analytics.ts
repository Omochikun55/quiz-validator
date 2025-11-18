/**
 * Quiz Analytics Utilities
 * Statistical analysis and insights for quiz data
 */

import { QuizQuestion, ValidationResult } from '../index';

export interface QuizAnalytics {
  totalQuestions: number;
  averageQuestionLength: number;
  averageExplanationLength: number;
  averageOptionCount: number;
  difficultyDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  qualityScore: number;
  recommendations: string[];
}

/**
 * Analyze quiz set and generate insights
 */
export function analyzeQuizSet(questions: QuizQuestion[]): QuizAnalytics {
  if (questions.length === 0) {
    return {
      totalQuestions: 0,
      averageQuestionLength: 0,
      averageExplanationLength: 0,
      averageOptionCount: 0,
      difficultyDistribution: {},
      categoryDistribution: {},
      qualityScore: 0,
      recommendations: ['No questions to analyze'],
    };
  }

  // Calculate averages
  const totalQuestionLength = questions.reduce(
    (sum, q) => sum + q.question.length,
    0
  );
  const averageQuestionLength = totalQuestionLength / questions.length;

  const questionsWithExplanation = questions.filter((q) => q.explanation);
  const totalExplanationLength = questionsWithExplanation.reduce(
    (sum, q) => sum + (q.explanation?.length || 0),
    0
  );
  const averageExplanationLength =
    questionsWithExplanation.length > 0
      ? totalExplanationLength / questionsWithExplanation.length
      : 0;

  const totalOptionCount = questions.reduce(
    (sum, q) => sum + (q.options?.length || 0),
    0
  );
  const averageOptionCount = totalOptionCount / questions.length;

  // Calculate distributions
  const difficultyDistribution: Record<string, number> = {};
  const categoryDistribution: Record<string, number> = {};

  questions.forEach((q) => {
    if (q.difficulty) {
      const key = String(q.difficulty);
      difficultyDistribution[key] = (difficultyDistribution[key] || 0) + 1;
    }

    if (q.category) {
      categoryDistribution[q.category] = (categoryDistribution[q.category] || 0) + 1;
    }
  });

  // Calculate quality score
  let qualityScore = 100;
  const recommendations: string[] = [];

  // Check question length
  if (averageQuestionLength < 20) {
    qualityScore -= 10;
    recommendations.push('Questions are too short on average');
  }

  // Check explanation coverage
  const explanationCoverage =
    (questionsWithExplanation.length / questions.length) * 100;
  if (explanationCoverage < 80) {
    qualityScore -= 15;
    recommendations.push(
      `Only ${explanationCoverage.toFixed(0)}% of questions have explanations`
    );
  }

  // Check explanation length
  if (averageExplanationLength < 50 && questionsWithExplanation.length > 0) {
    qualityScore -= 10;
    recommendations.push('Explanations are too short on average');
  }

  // Check option count
  if (averageOptionCount < 3) {
    qualityScore -= 10;
    recommendations.push('Too few options per question on average');
  }

  // Check difficulty distribution
  const difficultyKeys = Object.keys(difficultyDistribution);
  if (difficultyKeys.length === 1) {
    qualityScore -= 10;
    recommendations.push('All questions have the same difficulty level');
  }

  // Check category distribution
  const categoryKeys = Object.keys(categoryDistribution);
  if (categoryKeys.length === 0) {
    qualityScore -= 5;
    recommendations.push('No categories assigned to questions');
  }

  if (recommendations.length === 0) {
    recommendations.push('Quiz set is well-balanced and high quality');
  }

  return {
    totalQuestions: questions.length,
    averageQuestionLength,
    averageExplanationLength,
    averageOptionCount,
    difficultyDistribution,
    categoryDistribution,
    qualityScore: Math.max(0, qualityScore),
    recommendations,
  };
}

/**
 * Find duplicate questions
 */
export function findDuplicates(questions: QuizQuestion[]): Array<{
  question1: QuizQuestion;
  question2: QuizQuestion;
  similarity: number;
}> {
  const duplicates: Array<{
    question1: QuizQuestion;
    question2: QuizQuestion;
    similarity: number;
  }> = [];

  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const similarity = calculateSimilarity(
        questions[i].question,
        questions[j].question
      );

      if (similarity > 0.8) {
        // 80% similarity threshold
        duplicates.push({
          question1: questions[i],
          question2: questions[j],
          similarity,
        });
      }
    }
  }

  return duplicates;
}

/**
 * Calculate text similarity (simple Jaccard similarity)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Generate difficulty distribution report
 */
export function analyzeDifficultyDistribution(
  questions: QuizQuestion[]
): {
  distribution: Record<string, number>;
  balanced: boolean;
  recommendation: string;
} {
  const distribution: Record<string, number> = {};

  questions.forEach((q) => {
    if (q.difficulty) {
      const key = String(q.difficulty);
      distribution[key] = (distribution[key] || 0) + 1;
    }
  });

  // Check balance (ideally, each difficulty should have similar count)
  const counts = Object.values(distribution);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);
  const balanced = maxCount / minCount < 2; // Less than 2x difference

  let recommendation = '';
  if (!balanced) {
    recommendation = 'Consider adding more questions to underrepresented difficulty levels';
  } else {
    recommendation = 'Difficulty distribution is well-balanced';
  }

  return {
    distribution,
    balanced,
    recommendation,
  };
}

/**
 * Analyze category coverage
 */
export function analyzeCategoryC overage(
  questions: QuizQuestion[]
): {
  coverage: Record<string, number>;
  averagePerCategory: number;
  recommendation: string;
} {
  const coverage: Record<string, number> = {};

  questions.forEach((q) => {
    if (q.category) {
      coverage[q.category] = (coverage[q.category] || 0) + 1;
    }
  });

  const categories = Object.keys(coverage);
  const averagePerCategory =
    categories.length > 0
      ? Object.values(coverage).reduce((a, b) => a + b, 0) / categories.length
      : 0;

  let recommendation = '';
  if (categories.length === 0) {
    recommendation = 'Add categories to improve quiz organization';
  } else if (categories.length < 3) {
    recommendation = 'Consider adding more categories for better coverage';
  } else {
    recommendation = `Good category coverage with ${categories.length} categories`;
  }

  return {
    coverage,
    averagePerCategory,
    recommendation,
  };
}

/**
 * Calculate quiz completion time estimate
 */
export function estimateCompletionTime(
  questions: QuizQuestion[],
  secondsPerQuestion: number = 30
): {
  totalMinutes: number;
  totalSeconds: number;
  formatted: string;
} {
  const totalSeconds = questions.length * secondsPerQuestion;
  const totalMinutes = Math.ceil(totalSeconds / 60);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const formatted =
    hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;

  return {
    totalMinutes,
    totalSeconds,
    formatted,
  };
}

/**
 * Identify problematic questions
 */
export function identifyProblematicQuestions(
  questions: QuizQuestion[],
  validationResults: ValidationResult[]
): {
  problematic: Array<{
    question: QuizQuestion;
    issues: string[];
    score: number;
  }>;
  count: number;
} {
  const problematic: Array<{
    question: QuizQuestion;
    issues: string[];
    score: number;
  }> = [];

  validationResults.forEach((result, index) => {
    if (!result.valid || result.score < 70) {
      problematic.push({
        question: questions[index],
        issues: result.errors.map((e) => e.message),
        score: result.score,
      });
    }
  });

  return {
    problematic,
    count: problematic.length,
  };
}

/**
 * Generate improvement suggestions
 */
export function generateImprovementSuggestions(
  analytics: QuizAnalytics
): string[] {
  const suggestions: string[] = [];

  if (analytics.averageQuestionLength < 30) {
    suggestions.push(
      'Add more context to questions to make them clearer (target: 30-100 characters)'
    );
  }

  if (analytics.averageExplanationLength < 100) {
    suggestions.push(
      'Provide more detailed explanations (target: 100-200 characters)'
    );
  }

  if (analytics.averageOptionCount < 4) {
    suggestions.push('Add more options per question (recommended: 4 options)');
  }

  const difficultyKeys = Object.keys(analytics.difficultyDistribution);
  if (difficultyKeys.length < 3) {
    suggestions.push(
      'Add questions with varied difficulty levels (easy, medium, hard)'
    );
  }

  const categoryKeys = Object.keys(analytics.categoryDistribution);
  if (categoryKeys.length < 5) {
    suggestions.push(
      'Expand category coverage to provide more diverse content'
    );
  }

  if (analytics.qualityScore < 70) {
    suggestions.push(
      'Overall quality needs improvement - review individual question feedback'
    );
  }

  return suggestions;
}
