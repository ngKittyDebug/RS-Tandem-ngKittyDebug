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
