import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnswerPair } from '@/components/answer-pair';
import { curatedAnswers } from '@/lib/answers';
import { getTopic, searchPassages, TOPICS } from '@/lib/search';

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ id: topic.id }));
}

export async function generateMetadata({ params }: PageProps<'/tema/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const topic = getTopic(id);

  if (!topic) return {};

  const title = `${topic.label}: o que dizem Lula e Flávio`;

  return {
    title: `${title} — Lula × Flávio`,
    description: topic.question,
    openGraph: { title, description: `${topic.question} Veja lado a lado, com a página do plano de governo.` },
    twitter: { card: 'summary_large_image', title },
  };
}

export default async function TopicPage({ params }: PageProps<'/tema/[id]'>) {
  const { id } = await params;
  const topic = getTopic(id);
  const answers = topic ? curatedAnswers(topic.id) : null;

  if (!topic || !answers) notFound();

  return (
    <div className="topic-page">
      <p className="eyebrow">
        <Link href="/#temas">Temas</Link> · {topic.group === 'polemico' ? 'Tema polêmico' : 'Tema do dia a dia'}
      </p>
      <AnswerPair
        question={topic.question}
        mode="curated"
        answers={answers}
        passages={{ lula: searchPassages('lula', topic.question), flavio: searchPassages('flavio', topic.question) }}
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
