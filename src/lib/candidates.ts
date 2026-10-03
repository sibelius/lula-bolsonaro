import type { CandidateId } from './types';

export type Candidate = {
  id: CandidateId;
  name: string;
  fullName: string;
  party: string;
  number: number;
  initials: string;
  plan: string;
  pages: number;
  pdfUrl: string;
};

export const CANDIDATES: Record<CandidateId, Candidate> = {
  lula: {
    id: 'lula',
    name: 'Lula',
    fullName: 'Luiz Inácio Lula da Silva',
    party: 'PT',
    number: 13,
    initials: 'L',
    plan: 'Diretrizes para o Programa de Transformação do Brasil',
    pages: 84,
    pdfUrl: '/planos/lula.pdf',
  },
  flavio: {
    id: 'flavio',
    name: 'Flávio',
    fullName: 'Flávio Bolsonaro',
    party: 'PL',
    number: 22,
    initials: 'F',
    plan: 'Para o Brasil Vencer o Atraso — Diretrizes 2027–2030',
    pages: 76,
    pdfUrl: '/planos/flavio.pdf',
  },
};

export const CANDIDATE_IDS: CandidateId[] = ['lula', 'flavio'];

export const TSE_URL =
  'https://www.tse.jus.br/eleicoes/eleicoes-2026-content/propostas-de-governo-dos-candidatos-ao-cargo-de-presidente-da-republica-eleicoes-2026';
