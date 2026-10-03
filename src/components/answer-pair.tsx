import { CANDIDATES, CANDIDATE_IDS } from '@/lib/candidates';
import type { AnswerMode, CandidateAnswer, CandidateId, Passage } from '@/lib/types';

const STATUS_LABEL: Record<CandidateAnswer['status'], string> = {
  covered: 'Tratado no plano',
  partial: 'Tratado em parte',
  not_found: 'Não consta no plano',
};

const MODE_LABEL: Record<AnswerMode, string> = {
  curated: 'Resumo revisado do plano, com páginas citadas',
  ai: 'Resposta gerada por IA a partir dos dois planos',
  passages: 'Busca por trechos — sem resumo',
};

function PageLink({ candidate, page }: { candidate: CandidateId; page: number }) {
  return (
    <a className="page-link" href={`${CANDIDATES[candidate].pdfUrl}#page=${page}`} target="_blank" rel="noreferrer">
      p. {page}
    </a>
  );
}

function AnswerColumn({
  candidate,
  answer,
  passages,
}: {
  candidate: CandidateId;
  answer: CandidateAnswer;
  passages: Passage[];
}) {
  const info = CANDIDATES[candidate];
  const showPassagesOpen = answer.points.length === 0 && answer.quotes.length === 0 && passages.length > 0;

  return (
    <article className={`answer answer-${candidate}`}>
      <header className="answer-head">
        <span className="avatar" aria-hidden>
          {info.number}
        </span>
        <div>
          <h3>{info.name}</h3>
          <p>
            {info.fullName} · {info.party}
          </p>
        </div>
        <span className={`status status-${answer.status}`}>{STATUS_LABEL[answer.status]}</span>
      </header>

      <p className="answer-text">{answer.answer}</p>

      {answer.points.length > 0 && (
        <ul className="points">
          {answer.points.map((point, i) => (
            <li key={i}>
              <span>{point.text}</span> <PageLink candidate={candidate} page={point.page} />
            </li>
          ))}
        </ul>
      )}

      {answer.quotes.map((quote, i) => (
        <blockquote key={i} className="quote">
          “{quote.text}” <PageLink candidate={candidate} page={quote.page} />
        </blockquote>
      ))}

      {passages.length > 0 && (
        <details className="passages" open={showPassagesOpen}>
          <summary>Trechos do plano relacionados ({passages.length})</summary>
          {passages.map((p) => (
            <div key={p.id} className="passage">
              <div className="passage-meta">
                <PageLink candidate={candidate} page={p.page} /> · {p.heading}
              </div>
              <p>{p.text}</p>
            </div>
          ))}
        </details>
      )}
    </article>
  );
}

export function AnswerPair({
  question,
  mode,
  answers,
  passages,
  matchedTopic,
}: {
  question: string;
  matchedTopic?: string;
  mode: AnswerMode;
  answers: Record<CandidateId, CandidateAnswer>;
  passages: Record<CandidateId, Passage[]>;
}) {
  return (
    <section className="pair">
      <div className="pair-question">
        <h2>{question}</h2>
        <span className={`mode mode-${mode}`}>
          {matchedTopic ? `Tema mais próximo: ${matchedTopic} · ` : ''}
          {MODE_LABEL[mode]}
        </span>
      </div>
      <div className="pair-grid">
        {CANDIDATE_IDS.map((id) => (
          <AnswerColumn key={id} candidate={id} answer={answers[id]} passages={passages[id]} />
        ))}
      </div>
    </section>
  );
}
