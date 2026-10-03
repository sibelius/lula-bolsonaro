import Anthropic from '@anthropic-ai/sdk';
import lulaPassages from '@/data/lula-passages.json';
import flavioPassages from '@/data/flavio-passages.json';
import { planText } from './plans';
import type { CandidateAnswer, CandidateId, Citation, Passage } from './types';

const MODEL = 'claude-opus-5-5';

const SYSTEM_INSTRUCTIONS = `Você é um assistente neutro que compara os planos de governo oficiais registrados no TSE pelos candidatos à Presidência do Brasil em 2026: Lula (PT) e Flávio Bolsonaro (PL).

Regras:
- Responda SOMENTE com base nos dois documentos abaixo. Não use conhecimento externo, declarações públicas, notícias ou histórico dos candidatos.
- Escreva em português do Brasil, em terceira pessoa ("O plano de Lula propõe…", "O plano de Flávio propõe…"), com tom neutro e factual, sem adjetivos de elogio ou crítica e sem tomar partido.
- Se um plano não trata do assunto perguntado, diga isso claramente (status "not_found"). Se trata só de forma indireta, use "partial" e explique o que existe. Nunca invente ou deduza uma posição.
- Cada item de "points" e "quotes" deve indicar a página ([página N]) em que aparece.
- "quotes" devem ser trechos copiados LITERALMENTE do documento (10 a 45 palavras), sem alterar nenhuma palavra.
- Trate os dois candidatos com o mesmo nível de detalhe.
- Se a pergunta não tiver relação com propostas de governo, responda nos dois lados que os planos não tratam do tema.`;

const CITATION_SCHEMA = {
  type: 'object',
  properties: { text: { type: 'string' }, page: { type: 'integer' } },
  required: ['text', 'page'],
  additionalProperties: false,
};

const ANSWER_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['covered', 'partial', 'not_found'] },
    answer: { type: 'string' },
    points: { type: 'array', items: CITATION_SCHEMA },
    quotes: { type: 'array', items: CITATION_SCHEMA },
  },
  required: ['status', 'answer', 'points', 'quotes'],
  additionalProperties: false,
};

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: { lula: ANSWER_SCHEMA, flavio: ANSWER_SCHEMA },
  required: ['lula', 'flavio'],
  additionalProperties: false,
};

const PAGE_TEXT: Record<CandidateId, Map<number, string>> = {
  lula: pageText(lulaPassages as Passage[]),
  flavio: pageText(flavioPassages as Passage[]),
};

function pageText(passages: Passage[]) {
  const pages = new Map<number, string>();

  for (const p of passages) pages.set(p.page, `${pages.get(p.page) ?? ''} ${p.text}`);

  for (const [page, text] of pages) pages.set(page, collapse(text));

  return pages;
}

function collapse(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

// Drops any "quote" the model did not copy verbatim from the cited page (or a neighbour,
// since passages can straddle a page break).
function verifiedQuotes(candidate: CandidateId, quotes: Citation[]): Citation[] {
  const pages = PAGE_TEXT[candidate];

  return quotes.filter((quote) => {
    const text = collapse(quote.text).replace(/^["“]|["”]$/g, '');

    return [quote.page - 1, quote.page, quote.page + 1].some((page) => pages.get(page)?.includes(text));
  });
}

export function hasModel(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;

export async function askModel(question: string): Promise<Record<CandidateId, CandidateAnswer>> {
  client ??= new Anthropic();

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: {
      effort: 'low',
      format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
    },
    system: [
      { type: 'text', text: SYSTEM_INSTRUCTIONS },
      {
        type: 'text',
        text: `<plano_lula>\n${planText('lula')}\n</plano_lula>\n\n<plano_flavio>\n${planText('flavio')}\n</plano_flavio>`,
        cache_control: { type: 'ephemeral', ttl: '1h' },
      },
    ],
    messages: [{ role: 'user', content: question.slice(0, 500) }],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('O modelo não respondeu a esta pergunta.');
  }

  const text = response.content.find((block) => block.type === 'text');

  if (!text || text.type !== 'text') throw new Error('Resposta vazia do modelo.');

  const parsed = JSON.parse(text.text) as Record<CandidateId, CandidateAnswer>;

  for (const candidate of ['lula', 'flavio'] as CandidateId[]) {
    parsed[candidate].quotes = verifiedQuotes(candidate, parsed[candidate].quotes);
  }

  return parsed;
}
