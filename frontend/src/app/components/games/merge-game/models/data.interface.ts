export interface ResponseData {
  data: Data[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Data {
  id: number;
  category: string;
  words: Word[];
}

export interface Word {
  id?: number;
  dataId?: number;
  word: string;
  questions: Question[];
}

export interface Question {
  id?: number;
  wordId?: number;
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
