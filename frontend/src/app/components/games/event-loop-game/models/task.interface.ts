export type DifficultyType = 'easy' | 'medium' | 'hard';
export type ExecutionStepType = 'stack' | 'microtask' | 'macrotask';

export interface Task {
  id: number;
  difficulty: string;
  code: string;
  output: string[];
  hint: {
    en: string;
    ru: string;
  };
  executionSteps: ExecutionStep[];
}

export interface ExecutionStep {
  type: string;
  label: string;
  output: string;
}

export interface AnswerItem {
  id: string;
  value: string;
  status: 'idle' | 'checking' | 'correct' | 'incorrect';
}
