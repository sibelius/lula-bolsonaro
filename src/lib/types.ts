export type CandidateId = 'lula' | 'flavio';

export type Passage = {
  id: string;
  page: number;
  heading: string;
  text: string;
};

export type Topic = {
  id: string;
  label: string;
  group: 'geral' | 'polemico';
  question: string;
  keywords: string[];
};

export type Citation = {
  text: string;
  page: number;
};

export type CandidateAnswer = {
  status: 'covered' | 'partial' | 'not_found';
  answer: string;
  points: Citation[];
  quotes: Citation[];
};

export type AnswerMode = 'curated' | 'ai' | 'passages';

export type AskResponse = {
  question: string;
  mode: AnswerMode;
  topic: Topic | null;
  answers: Record<CandidateId, CandidateAnswer>;
  passages: Record<CandidateId, Passage[]>;
};
