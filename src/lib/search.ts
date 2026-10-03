import lulaPassages from '@/data/lula-passages.json';
import flavioPassages from '@/data/flavio-passages.json';
import topics from '@/data/topics.json';
import type { CandidateId, Passage, Topic } from './types';

const STOPWORDS = new Set(
  'a o as os de da do das dos e em no na nos nas um uma uns umas para por com sem que qual quais como sobre ser sera vai vao voce eh e ou se ao aos the sua seu suas seus isso esse essa este esta mais menos muito ja nao sim pelo pela pelos pelas entre ate tem ter quer acha pensa posicao proposta propostas plano governo candidato lula flavio bolsonaro favor contra defende'.split(
    ' ',
  ),
);

const SYNONYMS: Record<string, string[]> = {
  pcc: ['faccoes', 'faccao', 'crime', 'organizado', 'narcoterroristas'],
  cv: ['faccoes', 'faccao', 'crime', 'organizado'],
  pv: ['faccoes', 'faccao', 'crime', 'organizado'],
  comando: ['faccoes', 'faccao'],
  vermelho: ['faccoes', 'faccao'],
  faccoes: ['faccao', 'narcoterroristas', 'crime', 'organizado'],
  milicia: ['milicias', 'faccoes', 'crime'],
  milicias: ['milicia', 'faccoes', 'crime'],
  bandido: ['crime', 'criminosos', 'presidios'],
  bandidos: ['crime', 'criminosos', 'presidios'],
  morte: ['pena', 'perpetua', 'punicao'],
  perpetua: ['pena', 'prisao'],
  maioridade: ['menor', 'adolescentes', 'penal'],
  aborto: ['vida', 'gestacao', 'nascituro'],
  armas: ['arma', 'porte', 'posse', 'fuzis'],
  arma: ['armas', 'porte', 'posse'],
  bolsa: ['familia', 'transferencia', 'renda'],
  economia: ['crescimento', 'investimento', 'pib', 'desenvolvimento'],
  impostos: ['imposto', 'tributaria', 'tributos', 'renda'],
  imposto: ['impostos', 'tributaria', 'tributos'],
  inflacao: ['precos', 'custo', 'juros'],
  emprego: ['empregos', 'trabalho', 'trabalhadores'],
  empregos: ['emprego', 'trabalho'],
  escola: ['educacao', 'escolas', 'ensino'],
  educacao: ['escola', 'ensino', 'alfabetizacao'],
  saude: ['sus', 'medicos', 'hospitais'],
  sus: ['saude'],
  corrupcao: ['transparencia', 'integridade', 'controle'],
  stf: ['supremo', 'judiciario', 'poderes'],
  supremo: ['stf', 'judiciario'],
  amazonia: ['desmatamento', 'floresta', 'ambiental'],
  clima: ['climatica', 'climaticas', 'ambiental', 'carbono'],
  privatizar: ['privatizacao', 'estatais', 'concessoes'],
  privatizacao: ['privatizar', 'estatais', 'concessoes'],
  petrobras: ['petroleo', 'estatais', 'combustiveis'],
  gasolina: ['combustiveis', 'combustivel', 'petroleo'],
  luz: ['energia', 'eletrica', 'conta'],
  drogas: ['droga', 'cocaina', 'trafico'],
  mulher: ['mulheres', 'feminicidio'],
  mulheres: ['mulher', 'feminicidio'],
  aposentadoria: ['previdencia', 'inss', 'aposentados'],
  inss: ['previdencia', 'aposentados'],
  casa: ['moradia', 'habitacao'],
  moradia: ['habitacao', 'casa'],
  agro: ['agropecuaria', 'agricultura', 'produtor', 'rural'],
  ia: ['inteligencia', 'artificial', 'digital'],
  internet: ['digital', 'conectividade'],
  '6x1': ['jornada', 'escala', 'horas'],
  escala: ['jornada', '6x1'],
  jornada: ['escala', '6x1', 'horas'],
  indigenas: ['indigena', 'demarcacao', 'povos'],
  venezuela: ['politica', 'externa', 'internacional'],
  china: ['politica', 'externa', 'internacional'],
  eua: ['estados', 'unidos', 'internacional'],
  censura: ['liberdade', 'expressao', 'plataformas'],
  redes: ['plataformas', 'digitais', 'liberdade'],
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ');
}

function stem(token: string): string {
  if (token.length <= 4) return token;

  return token.replace(/(oes|aes|ais|eis|res|mente|s)$/, '');
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[\s-]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

type Index = {
  passages: Passage[];
  docs: Map<string, number>[];
  lengths: number[];
  avgLength: number;
  df: Map<string, number>;
};

function buildIndex(passages: Passage[]): Index {
  const docs = passages.map((p) => {
    const terms = new Map<string, number>();

    for (const token of tokenize(`${p.heading} ${p.text}`)) {
      const s = stem(token);

      terms.set(s, (terms.get(s) ?? 0) + 1);
    }

    return terms;
  });

  const lengths = docs.map((d) => [...d.values()].reduce((a, b) => a + b, 0));
  const df = new Map<string, number>();

  for (const d of docs) {
    for (const term of d.keys()) df.set(term, (df.get(term) ?? 0) + 1);
  }

  return {
    passages,
    docs,
    lengths,
    avgLength: lengths.reduce((a, b) => a + b, 0) / lengths.length,
    df,
  };
}

const INDEXES: Record<CandidateId, Index> = {
  lula: buildIndex(lulaPassages as Passage[]),
  flavio: buildIndex(flavioPassages as Passage[]),
};

function expandQuery(question: string): Map<string, number> {
  const weights = new Map<string, number>();

  for (const token of tokenize(question)) {
    weights.set(stem(token), Math.max(weights.get(stem(token)) ?? 0, 1));

    for (const synonym of SYNONYMS[token] ?? []) {
      const s = stem(synonym);

      weights.set(s, Math.max(weights.get(s) ?? 0, 0.5));
    }
  }

  return weights;
}

export function searchPassages(candidate: CandidateId, question: string, limit = 4) {
  const index = INDEXES[candidate];
  const query = expandQuery(question);
  const n = index.passages.length;
  const k1 = 1.4;
  const b = 0.75;

  const scored = index.docs.map((doc, i) => {
    let score = 0;

    for (const [term, weight] of query) {
      const tf = doc.get(term);

      if (!tf) continue;

      const df = index.df.get(term) ?? 0;
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));

      score += weight * idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * index.lengths[i]) / index.avgLength)));
    }

    return { passage: index.passages[i], score };
  });

  return scored
    .filter((s) => s.score > 1.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.passage);
}

export const TOPICS = topics as Topic[];

export function getTopic(id: string): Topic | null {
  return TOPICS.find((t) => t.id === id) ?? null;
}

// Picks the curated topic that best matches a free-form question, or null when
// nothing matches clearly enough to reuse a curated answer.
export function matchTopic(question: string): Topic | null {
  const q = ` ${normalize(question).replace(/\s+/g, ' ')} `;
  const tokens = new Set(tokenize(question).map(stem));
  let best: Topic | null = null;
  let bestScore = 0;

  for (const topic of TOPICS) {
    let score = 0;

    for (const keyword of topic.keywords) {
      const k = normalize(keyword).trim();

      if (k.includes(' ') ? q.includes(` ${k} `) || q.includes(` ${k}`) : tokens.has(stem(k))) {
        score += k.includes(' ') ? 3 : 2;
      }
    }

    for (const token of tokenize(topic.label)) {
      if (tokens.has(stem(token))) score += 1;
    }

    if (normalize(topic.question).trim() === normalize(question).trim()) score += 100;

    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }

  return bestScore >= 2 ? best : null;
}
