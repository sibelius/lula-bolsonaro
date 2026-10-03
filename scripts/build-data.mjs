// Extracts the official government plans (PDF) into page-cited passages.
// Requires poppler (pdftotext/pdfinfo). Output is committed to src/data so the
// deploy does not need poppler.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

const SOURCES = [
  { id: 'lula', file: 'data/raw/lula.pdf' },
  { id: 'flavio', file: 'data/raw/flavio.pdf' },
];

const MAX_WORDS = 170;

const LULA_SECTIONS = {
  1: 'Fortalecer a democracia, a participação social e modernizar o Estado',
  2: 'Combater as desigualdades',
  3: 'Proteger a vida com uma segurança pública mais eficiente e integrada',
  4: 'Garantir o direito à educação para transformar vidas e o país',
  5: 'Fortalecer a saúde com equidade, inovação e soberania',
  6: 'Ampliar o acesso à cultura e ao esporte como vetores de transformação social',
  7: 'Fortalecer o direito à cidade',
  8: 'Promover uma economia mais sustentável, produtiva e digital, para todas e todos',
  9: 'Segurança alimentar e produção agrícola',
  10: 'Ampliar a segurança energética e liderar a transição para uma economia de baixo carbono',
  11: 'Promover a sustentabilidade ambiental e climática',
  12: 'Valorizar o trabalho em suas múltiplas formas',
  13: 'Defender a soberania nacional e o protagonismo internacional do Brasil',
};

function pageCount(file) {
  const info = execFileSync('pdfinfo', [file], { encoding: 'utf8' });

  return Number(info.match(/Pages:\s+(\d+)/)[1]);
}

function pageText(file, page) {
  return execFileSync('pdftotext', ['-q', '-f', String(page), '-l', String(page), '-enc', 'UTF-8', file, '-'], {
    encoding: 'utf8',
  });
}

function clean(text) {
  return text
    .replace(/\f/g, '')
    .replace(/-\n(?=[a-zà-ú])/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
}

function paragraphs(text) {
  return text
    .replace(/\n2\. Combater as desigualdades\n/, '\n2.\n\nCombater as desigualdades\n\n')
    .replace(/(^|\n)(\d{1,2})\.\n+((?:[^\n]+\n)*?[^\n]+)(?=\n\n|$)/g, '$1\n§§$2. $3\n\n')
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 2 && !/^\d+$/.test(p) && !/^(P R O G R A M A|G OV E R N O|D E G OV)/.test(p))
    .flatMap((p) => splitLong(p));
}

function splitLong(p) {
  const sentences = p.split(/(?<=[.;!?])\s+(?=[A-ZÀ-Ú“"])/);
  const out = [];
  let current = '';

  for (const s of sentences) {
    if (current && (current + ' ' + s).split(' ').length > MAX_WORDS) {
      out.push(current);
      current = s;
    } else {
      current = current ? current + ' ' + s : s;
    }
  }

  if (current) out.push(current);

  return out;
}

function isHeading(p) {
  const letters = p.replace(/[^A-Za-zÀ-ú]/g, '');

  return p.length < 110 && letters.length > 3 && letters === letters.toUpperCase();
}

for (const source of SOURCES) {
  const file = join(ROOT, source.file);
  const total = pageCount(file);
  const pages = [];
  const passages = [];
  let heading = source.id === 'lula' ? 'Compromisso com o projeto de nação' : '';
  let pendingNumber = '';

  for (let page = 1; page <= total; page++) {
    const text = clean(pageText(file, page));

    pages.push({ page, text });

    let buffer = [];
    let words = 0;

    const flush = () => {
      if (buffer.length === 0) return;

      const body = buffer.join('\n');

      if (body.split(' ').length >= 8) {
        passages.push({ id: `${source.id}-${passages.length + 1}`, page, heading, text: body });
      }

      buffer = [];
      words = 0;
    };

    for (const p of paragraphs(text)) {
      if (/\.{6,}/.test(p)) continue;

      if (p.startsWith('§§')) {
        flush();
        const number = Number(p.slice(2).split('.')[0]);

        heading = `${number}. ${LULA_SECTIONS[number]}`;
        continue;
      }

      if (/^\d{1,2}\.$/.test(p)) {
        flush();
        pendingNumber = p;
        continue;
      }

      if (pendingNumber) {
        heading = `${pendingNumber} ${p}`;
        pendingNumber = '';
        continue;
      }

      if (/^(DIRETRIZES PROGRAMÁTICAS|BRASIL:)/.test(p)) continue;

      if (isHeading(p) && source.id === 'flavio') {
        flush();
        heading = p.replace(/\s+/g, ' ');
        continue;
      }

      const count = p.split(' ').length;

      if (words + count > MAX_WORDS) flush();

      buffer.push(p);
      words += count;
    }

    flush();
  }

  mkdirSync(join(ROOT, 'src/data'), { recursive: true });
  writeFileSync(join(ROOT, `src/data/${source.id}-passages.json`), JSON.stringify(passages));
  writeFileSync(join(ROOT, `data/${source.id}-pages.json`), JSON.stringify(pages, null, 1));
  console.log(source.id, total, 'pages', passages.length, 'passages');
}
