import type { Metadata } from 'next';
import { CANDIDATES, CANDIDATE_IDS, TSE_URL } from '@/lib/candidates';

export const metadata: Metadata = { title: 'Fontes e metodologia — Lula × Flávio' };

export default function Sources() {
  return (
    <article className="prose">
      <p className="eyebrow">Fontes e metodologia</p>
      <h1>De onde vêm as respostas</h1>
      <p>
        Todas as respostas usam somente os planos de governo que as candidaturas registraram no{' '}
        <a href={TSE_URL} target="_blank" rel="noreferrer">
          Tribunal Superior Eleitoral
        </a>
        . Não usamos entrevistas, discursos, notícias ou votações anteriores. Se um plano não trata de um tema, isso
        aparece como <strong>“Não consta no plano”</strong>, mesmo que o candidato já tenha falado sobre ele em outro
        lugar.
      </p>
      <ul className="source-list">
        {CANDIDATE_IDS.map((id) => {
          const c = CANDIDATES[id];

          return (
            <li key={id} className={`source source-${id}`}>
              <strong>
                {c.fullName} ({c.party})
              </strong>
              <span>{c.plan}</span>
              <span>{c.pages} páginas</span>
              <a href={c.pdfUrl} target="_blank" rel="noreferrer">
                Abrir PDF
              </a>
            </li>
          );
        })}
      </ul>
      <h2>Como funciona</h2>
      <ol>
        <li>Os dois PDFs são convertidos em texto, separados em trechos e marcados com o número da página.</li>
        <li>
          Para os temas da lista, cada resposta foi escrita a partir do documento inteiro, com tom neutro, e cada citação
          literal é verificada automaticamente contra o texto da página.
        </li>
        <li>
          Para perguntas livres, um modelo de IA (Claude) lê os dois planos completos e responde só com base neles. As
          citações que não aparecem literalmente no documento são descartadas antes de chegar à tela.
        </li>
        <li>Abaixo de cada resposta, os trechos mais relacionados do plano aparecem na íntegra, para conferência.</li>
      </ol>
      <p>
        A IA pode errar ao resumir. Antes de formar opinião ou compartilhar, clique no número da página e leia o trecho
        original.
      </p>
    </article>
  );
}
