export interface Question {
  id: number;
  question: string;
  type: string;
  answers: Answer[];
}

export interface Answer {
  id: number;
  text: string;
  points: number;
}

export interface State {
  questions: Question[];
  answers: UserAnswers;
  maxScore: number;
  incompleteQuiz: boolean;
  processing: boolean;
  scoreModalOpen: boolean;
  score: number;
}
export interface UserAnswers {
  multi: MultiUserAnswer;
  single: Array<Answer>;
}
export interface MultiUserAnswer {
  [key: string]: Answer[];
}
