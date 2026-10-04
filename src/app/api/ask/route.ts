import { askModel, hasModel } from '@/lib/ai';
import { curatedAnswers } from '@/lib/answers';
import { reportedFacts } from '@/lib/facts';
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
  const reported = topic?.group === 'fato' ? reportedFacts(topic.id) : null;
  // Press topics must not drag unrelated plan excerpts into the record.
  const passages = reported
    ? { lula: [], flavio: [] }
    : {
        lula: searchPassages('lula', asked),
        flavio: searchPassages('flavio', asked),
      };

  // Free-form questions go to the model when one is configured. A matched press
  // topic stays on the sourced record: the model is forbidden to use the news.
  if (!explicitTopic && hasModel() && !reported) {
    try {
      const answers = await askModel(asked);

      return Response.json({
        question: asked,
        mode: 'ai',
        topic,
        answers,
        passages,
        reported: null,
      } satisfies AskResponse);
    } catch (error) {
      console.error('askModel failed', error);
    }
  }

  const curated = topic ? curatedAnswers(topic.id) : null;

  if (curated) {
    return Response.json({
      question: asked,
      mode: 'curated',
      topic,
      answers: curated,
      passages,
      reported,
    } satisfies AskResponse);
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
    reported: null,
  } satisfies AskResponse);
}
