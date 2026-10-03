import answersLula from '@/data/answers-lula.json';
import answersFlavio from '@/data/answers-flavio.json';
import type { CandidateAnswer, CandidateId } from './types';

const ANSWERS: Record<CandidateId, Record<string, CandidateAnswer>> = {
  lula: answersLula as Record<string, CandidateAnswer>,
  flavio: answersFlavio as Record<string, CandidateAnswer>,
};

export function curatedAnswers(topicId: string): Record<CandidateId, CandidateAnswer> | null {
  const lula = ANSWERS.lula[topicId];
  const flavio = ANSWERS.flavio[topicId];

  if (!lula || !flavio) return null;

  return { lula, flavio };
}
