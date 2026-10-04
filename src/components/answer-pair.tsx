import { CANDIDATES, CANDIDATE_IDS } from '@/lib/candidates';
import type { AnswerMode, CandidateAnswer, CandidateId, Passage, ReportedFacts } from '@/lib/types';

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

function SourceLink({ outlet, date, url }: { outlet: string; date: string; url: string }) {
  return (
    <a className="page-link" href={url} target="_blank" rel="noreferrer">
      {outlet}, {date}
    </a>
  );
}

function ReportedRecord({ facts }: { facts: ReportedFacts }) {
  return (
    <section className="reported">
      <h3>Fora dos planos, segundo as reportagens</h3>
      <p className="reported-note">
        Nenhuma frase deste bloco está nos PDFs do TSE. Cada uma aponta a matéria de onde saiu. Onde os veículos
        divergem, as duas versões ficam. Acusação e investigação não são condenação.
      </p>
      <ul className="points">
        {facts.items.map((item) => (
          <li key={`${item.url}-${item.text}`}>
            <span>{item.text}</span> <SourceLink outlet={item.outlet} date={item.date} url={item.url} />
          </li>
        ))}
      </ul>
      {facts.quotes.map((quote) => (
        <blockquote key={`${quote.url}-${quote.text}`} className="quote">
          “{quote.text}” <span className="quote-who">{quote.who}.</span>{' '}
          <SourceLink outlet={quote.outlet} date={quote.date} url={quote.url} />
        </blockquote>
      ))}
    </section>
  );
}

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
  reported,
}: {
  question: string;
  matchedTopic?: string;
  mode: AnswerMode;
  answers: Record<CandidateId, CandidateAnswer>;
  passages: Record<CandidateId, Passage[]>;
  reported?: ReportedFacts | null;
}) {
  return (
    <section className="pair">
      <div className="pair-question">
        <h2>{question}</h2>
        <span className={`mode mode-${mode}`}>
          {matchedTopic ? `Tema mais próximo: ${matchedTopic} · ` : ''}
          {reported ? 'Não está nos planos. Abaixo, só o que as reportagens publicaram.' : MODE_LABEL[mode]}
        </span>
      </div>
      <div className="pair-grid">
        {CANDIDATE_IDS.map((id) => (
          <AnswerColumn key={id} candidate={id} answer={answers[id]} passages={passages[id]} />
        ))}
      </div>
      {reported ? <ReportedRecord facts={reported} /> : null}
    </section>
  );
}
