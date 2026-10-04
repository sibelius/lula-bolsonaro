# Lula × Flávio

Ask any question and see, side by side, what the 2026 government plans of Lula (PT) and Flávio Bolsonaro (PL) say about it, with the cited page from the official documents registered at the TSE.

## How it works

- `data/raw/*.pdf` are the official plans. `node scripts/build-data.mjs` (needs poppler) extracts them into page-cited passages in `src/data/*-passages.json`.
- `src/data/topics.json` lists 45 topics (everyday, controversial, and three press records the plans do not cover). `src/data/answers-{lula,flavio}.json` hold neutral, page-cited summaries per topic; every plan quote is verified verbatim against the page text.
- `src/data/reported-facts.json` holds the press record for Vorcaro / Dark Horse, Alfredo Gaspar, and the rachadinha case. Each sentence and each quotation links to the article it came from. Those three topics still say the plans do not cover them.
- `POST /api/ask`:
  - topic chips → curated answers;
  - free-form questions → Claude (`claude-opus-5-5`) reads both full plans (prompt-cached) and answers with structured output when `ANTHROPIC_API_KEY` is set; quotes that are not verbatim in the cited page are dropped;
  - without a key → closest curated topic, or BM25 passage search over both plans.
- `/tema/[id]` static pages per topic, `/fontes` methodology.

## Development

```sh
pnpm install
pnpm dev
```

Set `ANTHROPIC_API_KEY` (locally in `.env.local`, on Vercel with `vercel env add ANTHROPIC_API_KEY`) to enable AI answers for free-form questions.
