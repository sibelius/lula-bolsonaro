import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnswerPair } from '@/components/answer-pair';
import { curatedAnswers } from '@/lib/answers';
import { reportedFacts } from '@/lib/facts';
import { getTopic, searchPassages, TOPICS } from '@/lib/search';

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ id: topic.id }));
}

export async function generateMetadata({ params }: PageProps<'/tema/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const topic = getTopic(id);

  if (!topic) return {};

  const title = `${topic.label}: o que dizem Lula e Flávio`;
  const description =
    topic.group === 'fato'
      ? `${topic.question} Cada frase aponta a reportagem.`
      : `${topic.question} Veja lado a lado, com a página do plano de governo.`;

  return {
    title: `${title} — Lula × Flávio`,
    description: topic.question,
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title },
  };
}

export default async function TopicPage({ params }: PageProps<'/tema/[id]'>) {
  const { id } = await params;
  const topic = getTopic(id);
  const answers = topic ? curatedAnswers(topic.id) : null;
  const reported = topic?.group === 'fato' ? reportedFacts(topic.id) : null;

  if (!topic || !answers) notFound();

  const groupLabel =
    topic.group === 'polemico' ? 'Tema polêmico' : topic.group === 'fato' ? 'Fora dos planos' : 'Tema do dia a dia';

  return (
    <div className="topic-page">
      <p className="eyebrow">
        <Link href="/#temas">Temas</Link> · {groupLabel}
      </p>
      <AnswerPair
        question={topic.question}
        mode="curated"
        answers={answers}
        reported={reported}
        passages={
          reported
            ? { lula: [], flavio: [] }
            : { lula: searchPassages('lula', topic.question), flavio: searchPassages('flavio', topic.question) }
        }
      />
      <nav className="topic-index">
        {TOPICS.map((t) => (
          <Link key={t.id} href={`/tema/${t.id}`} className={t.id === topic.id ? 'active' : ''}>
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
