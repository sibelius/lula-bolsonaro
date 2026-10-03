import { Ask } from '@/components/ask';
import { TOPICS } from '@/lib/search';

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Eleições 2026 · Planos de governo registrados no TSE</p>
        <h1>
          Uma pergunta. <em>Duas respostas.</em>
        </h1>
        <p className="lede">
          Pergunte sobre qualquer tema — economia, segurança, PCC, pena de morte, programas sociais — e veja lado a lado
          o que dizem os planos de governo de <strong className="c-lula">Lula</strong> e{' '}
          <strong className="c-flavio">Flávio Bolsonaro</strong>, sempre com a página do documento.
        </p>
      </section>
      <Ask topics={TOPICS} />
    </>
  );
}
