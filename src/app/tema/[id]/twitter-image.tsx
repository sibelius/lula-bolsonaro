import { curatedAnswers } from '@/lib/answers';
import { OG_SIZE, topicImage } from '@/lib/og';
import { getTopic, TOPICS } from '@/lib/search';

export const alt = 'O que dizem os planos de governo de Lula e Flávio';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ id: topic.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getTopic(id)!;
  const answers = curatedAnswers(id)!;

  return topicImage(topic.question, answers.lula, answers.flavio);
}
