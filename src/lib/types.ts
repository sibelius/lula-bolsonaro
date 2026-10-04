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
  group: 'geral' | 'polemico' | 'fato';
  question: string;
  keywords: string[];
};

/** One claim copied from a single article. `text` is our sentence; the link is the source. */
export type PressItem = {
  text: string;
  outlet: string;
  date: string;
  url: string;
};

/** Words the article puts in quotation marks, copied without edits. */
export type PressQuote = PressItem & {
  who: string;
};

export type ReportedFacts = {
  items: PressItem[];
  quotes: PressQuote[];
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
  /** Set only for topics the plans do not cover. Null on plan answers. */
  reported: ReportedFacts | null;
};
