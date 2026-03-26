export interface CheckAnswerAi {
  userAnswer: string;
  question: string;
  answer: string;
  personality: 'strict' | 'kind' | 'neutral';
}

export interface ResponseCheckAnswerAi {
  isCorrect: boolean;
  feedback: string;
}
