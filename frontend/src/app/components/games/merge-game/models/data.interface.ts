export interface Data {
  id: number;
  category: string;
  words: Word[];
}

export interface Word {
  word: string;
  questions: Question[];
}

export interface Question {
  question: string;
  answer: string;
  keywords: string[];
}

export interface WordCard {
  word: string;
  groupId: number;
}

export interface Row {
  slots: (WordCard | null)[];
  completed: boolean;
  theme?: string;
}
