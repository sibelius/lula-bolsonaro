import lulaPassages from '@/data/lula-passages.json';
import flavioPassages from '@/data/flavio-passages.json';
import type { CandidateId, Passage } from './types';

const PASSAGES: Record<CandidateId, Passage[]> = {
  lula: lulaPassages as Passage[],
  flavio: flavioPassages as Passage[],
};

// The whole plan as page-tagged text, used as the grounding document for the model.
export function planText(candidate: CandidateId): string {
  let currentPage = 0;
  let out = '';

  for (const p of PASSAGES[candidate]) {
    if (p.page !== currentPage) {
      currentPage = p.page;
      out += `\n\n[página ${p.page}] (${p.heading})\n`;
    }

    out += `${p.text}\n`;
  }

  return out.trim();
}
