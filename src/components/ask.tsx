'use client';

import { useEffect, useRef, useState } from 'react';
import { AnswerPair } from './answer-pair';
import type { AskResponse, Topic } from '@/lib/types';

type Entry = { key: number; question: string; result: AskResponse | null; error: string | null };

const EXAMPLES = [
  'O que vão fazer contra o PCC e o Comando Vermelho?',
  'São a favor da pena de morte?',
  'Vão manter o Bolsa Família?',
  'Como baixar o preço da comida?',
];

export function Ask({ topics }: { topics: Topic[] }) {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const counter = useRef(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function ask(question: string, topicId?: string) {
    const key = ++counter.current;
    const label = question.trim();

    if (!label) return;

    setEntries((prev) => [{ key, question: label, result: null, error: null }, ...prev].slice(0, 12));
    setInput('');
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

    const url = new URL(window.location.href);

    // Topic answers get their own page so shared links carry that topic's preview card.
    url.pathname = topicId ? `/tema/${topicId}` : '/';
    url.search = topicId ? '' : `?q=${encodeURIComponent(label)}`;
    window.history.replaceState(null, '', url);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: label, topicId }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? 'Erro ao responder.');

      setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, result: data } : e)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao responder.';

      setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, error: message } : e)));
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topic = topics.find((t) => t.id === params.get('tema'));
    const q = params.get('q');

    if (topic) ask(topic.question, topic.id);
    else if (q) ask(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const general = topics.filter((t) => t.group === 'geral');
  const polemic = topics.filter((t) => t.group === 'polemico');

  return (
    <>
      <form
        className="ask"
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Pergunte sobre economia, segurança, PCC, aborto, impostos…"
          aria-label="Sua pergunta"
          maxLength={500}
        />
        <button type="submit" disabled={!input.trim()}>
          Perguntar
        </button>
      </form>

      <div className="examples">
        {EXAMPLES.map((example) => (
          <button key={example} type="button" onClick={() => ask(example)}>
            {example}
          </button>
        ))}
      </div>

      <div ref={resultsRef} className="results">
        {entries.map((entry) => (
          <div key={entry.key}>
            {entry.result ? (
              <AnswerPair
                question={entry.question}
                mode={entry.result.mode}
                matchedTopic={
                  entry.result.mode === 'curated' && entry.result.topic?.question !== entry.question
                    ? entry.result.topic?.label
                    : undefined
                }
                answers={entry.result.answers}
                passages={entry.result.passages}
              />
            ) : (
              <section className="pair pair-loading">
                <div className="pair-question">
                  <h2>{entry.question}</h2>
                  <span className="mode">{entry.error ?? 'Lendo os dois planos…'}</span>
                </div>
                {!entry.error && (
                  <div className="pair-grid">
                    <div className="answer skeleton" />
                    <div className="answer skeleton" />
                  </div>
                )}
              </section>
            )}
          </div>
        ))}
      </div>

      <section className="topics" id="temas">
        <TopicGroup title="Temas do dia a dia" topics={general} onPick={(t) => ask(t.question, t.id)} />
        <TopicGroup title="Temas polêmicos" topics={polemic} onPick={(t) => ask(t.question, t.id)} />
      </section>
    </>
  );
}

function TopicGroup({ title, topics, onPick }: { title: string; topics: Topic[]; onPick: (t: Topic) => void }) {
  return (
    <div className="topic-group">
      <h2>{title}</h2>
      <div className="topic-list">
        {topics.map((topic) => (
          <button key={topic.id} type="button" className="topic" onClick={() => onPick(topic)}>
            {topic.label}
          </button>
        ))}
      </div>
    </div>
  );
}
