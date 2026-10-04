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
        . Não usamos entrevistas, discursos, notícias ou votações anteriores para dizer o que o plano propõe. Se um plano
        não trata de um tema, isso aparece como <strong>“Não consta no plano”</strong>, mesmo que o candidato já tenha
        falado sobre ele em outro lugar.
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
      <h2>Três temas fora dos planos</h2>
      <p>
        Vorcaro e o filme Dark Horse, o vice Alfredo Gaspar e a rachadinha não estão nos PDFs. Nesses três, as colunas
        continuam dizendo que o plano não trata do assunto. Embaixo, um bloco separado repete só o que as reportagens
        publicaram. Cada frase e cada citação entre aspas leva o link da matéria. Onde dois veículos divergem — a data
        da primeira prisão de Vorcaro, o motivo da anulação no STJ — as duas versões ficam. Nada nesse bloco é sentença
        nem posição de plano.
      </p>
      <ul className="source-list">
        <li className="source">
          <strong>g1</strong>
          <span>13 de maio de 2026</span>
          <a
            href="https://g1.globo.com/politica/noticia/2026/05/13/flavio-bolsonaro-pediu-dinheiro-de-vorcaro-para-filme-sobre-o-pai-mostram-mensagens-divulgadas-por-site.ghtml"
            target="_blank"
            rel="noreferrer"
          >
            Pedido de dinheiro a Vorcaro para o filme
          </a>
        </li>
        <li className="source">
          <strong>piauí</strong>
          <span>23 de setembro de 2026</span>
          <a href="https://piaui.uol.com.br/web/flavio-bolsonaro-viajou-em-jato-de-vorcaro/" target="_blank" rel="noreferrer">
            Voo no jato e parcelas do Dark Horse
          </a>
        </li>
        <li className="source">
          <strong>UOL</strong>
          <span>24 de setembro de 2026, com base no Estadão</span>
          <a
            href="https://noticias.uol.com.br/politica/ultimas-noticias/2026/09/24/flavio-bolsonaro-tentou-ligar-para-vorcaro-nos-4-dias-antes-da-prisao-do-banqueiro-pode-atender.ghtm"
            target="_blank"
            rel="noreferrer"
          >
            Ligações nos quatro dias anteriores à prisão
          </a>
        </li>
        <li className="source">
          <strong>BBC News Brasil</strong>
          <span>19 de maio de 2026</span>
          <a href="https://www.bbc.com/portuguese/articles/cvgzj45p5qdo" target="_blank" rel="noreferrer">
            O que Flávio disse sobre o encontro com Vorcaro
          </a>
        </li>
        <li className="source">
          <strong>Aos Fatos</strong>
          <span>24 de setembro de 2026</span>
          <a
            href="https://www.aosfatos.org/noticias/flavio-mentiu-ao-menos-43-vezes-sobre-envolvimento-com-vorcaro/"
            target="_blank"
            rel="noreferrer"
          >
            43 declarações classificadas como enganosas
          </a>
        </li>
        <li className="source">
          <strong>Brasil de Fato</strong>
          <span>5 de agosto de 2026</span>
          <a
            href="https://www.brasildefato.com.br/2026/08/05/alfredo-gaspar-vice-de-flavio-bolsonaro-e-acusado-de-estupro-em-processo-que-esta-parado-no-stf-aguardando-manifestacao-da-pgr/"
            target="_blank"
            rel="noreferrer"
          >
            Acusação contra Alfredo Gaspar
          </a>
        </li>
        <li className="source">
          <strong>Valor Econômico</strong>
          <span>1º de setembro de 2026</span>
          <a
            href="https://valor.globo.com/politica/eleicoes-2026/noticia/2026/09/01/flavio-bolsonaro-relembre-o-processo-da-rachadinha.ghtml"
            target="_blank"
            rel="noreferrer"
          >
            Processo da rachadinha
          </a>
        </li>
        <li className="source">
          <strong>BBC News Brasil</strong>
          <span>14 de maio de 2026</span>
          <a href="https://www.bbc.com/portuguese/articles/crmpv9r7mz9o" target="_blank" rel="noreferrer">
            Rachadinha, Queiroz e a versão de Flávio
          </a>
        </li>
      </ul>
    </article>
  );
}
