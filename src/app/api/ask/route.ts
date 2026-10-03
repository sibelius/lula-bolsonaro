import { askModel, hasModel } from '@/lib/ai';
import { curatedAnswers } from '@/lib/answers';
import { getTopic, matchTopic, searchPassages } from '@/lib/search';
import type { AskResponse, CandidateAnswer, CandidateId, Passage } from '@/lib/types';

export const maxDuration = 60;

function passagesAnswer(candidate: CandidateId, passages: Passage[]): CandidateAnswer {
  const name = candidate === 'lula' ? 'Lula' : 'Flávio';

  if (passages.length === 0) {
    return {
      status: 'not_found',
      answer: `Não encontramos trechos do plano de governo de ${name} sobre essa pergunta. Tente reformular ou escolha um dos temas.`,
      points: [],
      quotes: [],
    };
  }

  return {
    status: 'partial',
    answer: `Trechos do plano de governo de ${name} mais relacionados à pergunta:`,
    points: [],
    quotes: [],
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { question?: string; topicId?: string };
  const question = (body.question ?? '').trim().slice(0, 500);
  const explicitTopic = body.topicId ? getTopic(body.topicId) : null;

  if (!question && !explicitTopic) {
    return Response.json({ error: 'Faça uma pergunta.' }, { status: 400 });
  }

  const asked = question || explicitTopic!.question;
  const topic = explicitTopic ?? matchTopic(asked);
  const passages = {
    lula: searchPassages('lula', asked),
    flavio: searchPassages('flavio', asked),
  };

  // Free-form questions go to the model when one is configured; topic chips and
  // questions without a model use the curated, page-cited answers.
  if (!explicitTopic && hasModel()) {
    try {
      const answers = await askModel(asked);

      return Response.json({ question: asked, mode: 'ai', topic, answers, passages } satisfies AskResponse);
    } catch (error) {
      console.error('askModel failed', error);
    }
  }

  const curated = topic ? curatedAnswers(topic.id) : null;

  if (curated) {
    return Response.json({ question: asked, mode: 'curated', topic, answers: curated, passages } satisfies AskResponse);
  }

  return Response.json({
    question: asked,
    mode: 'passages',
    topic: null,
    answers: {
      lula: passagesAnswer('lula', passages.lula),
      flavio: passagesAnswer('flavio', passages.flavio),
    },
    passages,
  } satisfies AskResponse);
}
