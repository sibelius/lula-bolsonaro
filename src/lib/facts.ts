import reported from '@/data/reported-facts.json';
import topics from '@/data/topics.json';
import type { ReportedFacts, Topic } from './types';

/**
 * Press record for topics the TSE plans do not cover.
 * Each item and quote points at the article it came from. Add a claim only with that link.
 */
const FACTS = reported as Record<string, ReportedFacts>;

for (const topic of topics as Topic[]) {
  const hasFacts = topic.id in FACTS;

  if (topic.group === 'fato' && !hasFacts) {
    throw new Error(`Tema fora do plano sem reportagens: ${topic.id}`);
  }

  if (topic.group !== 'fato' && hasFacts) {
    throw new Error(`Reportagem presa a tema de plano: ${topic.id}`);
  }
}

export function reportedFacts(topicId: string): ReportedFacts | null {
  return FACTS[topicId] ?? null;
}
