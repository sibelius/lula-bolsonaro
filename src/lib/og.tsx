import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const OG_SIZE = { width: 1200, height: 630 };

const COLORS = {
  ink: '#14161a',
  ink2: '#4b515c',
  ink3: '#8a909a',
  bg: '#faf8f4',
  line: '#e7e3da',
  lula: '#c8102e',
  lulaSoft: '#fbecee',
  flavio: '#1c4fa0',
  flavioSoft: '#eaf0fa',
};

async function fonts() {
  const dir = join(process.cwd(), 'assets');
  const [serif, serifItalic, sans, sansBold] = await Promise.all([
    readFile(join(dir, 'Newsreader-SemiBold.ttf')),
    readFile(join(dir, 'Newsreader-Italic.ttf')),
    readFile(join(dir, 'InterTight-Medium.ttf')),
    readFile(join(dir, 'InterTight-Bold.ttf')),
  ]);

  return [
    { name: 'Newsreader', data: serif, style: 'normal' as const, weight: 600 as const },
    { name: 'Newsreader', data: serifItalic, style: 'italic' as const, weight: 500 as const },
    { name: 'Inter Tight', data: sans, style: 'normal' as const, weight: 500 as const },
    { name: 'Inter Tight', data: sansBold, style: 'normal' as const, weight: 700 as const },
  ];
}

function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: 'Newsreader', fontSize: 40 }}>
      <span style={{ color: COLORS.lula, fontWeight: 600 }}>Lula</span>
      <span style={{ color: COLORS.ink3, fontStyle: 'italic', fontWeight: 500 }}>×</span>
      <span style={{ color: COLORS.flavio, fontWeight: 600 }}>Flávio</span>
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'Inter Tight',
        fontSize: 22,
        color: COLORS.ink3,
      }}
    >
      <span>Planos de governo 2026 registrados no TSE</span>
      <span>lula-bolsonaro.vercel.app</span>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: COLORS.bg,
        padding: '56px 72px',
        borderTop: `14px solid ${COLORS.lula}`,
        borderBottom: `14px solid ${COLORS.flavio}`,
      }}
    >
      {children}
    </div>
  );
}

export async function homeImage() {
  return new ImageResponse(
    (
      <Frame>
        <Brand />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontFamily: 'Newsreader', fontWeight: 600, fontSize: 96, lineHeight: 1.05, color: COLORS.ink }}>
            Uma pergunta.
          </div>
          <div style={{ display: 'flex', fontFamily: 'Newsreader', fontWeight: 500, fontSize: 96, lineHeight: 1.05, fontStyle: 'italic' }}>
            <span style={{ color: COLORS.lula }}>Duas</span>
            <span style={{ color: COLORS.flavio, marginLeft: 24 }}>respostas.</span>
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontFamily: 'Inter Tight',
              fontSize: 30,
              color: COLORS.ink2,
              maxWidth: 960,
            }}
          >
            Economia, segurança, PCC, pena de morte, programas sociais: o que dizem os planos de Lula e Flávio
            Bolsonaro, com a página citada.
          </div>
        </div>
        <Footer />
      </Frame>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}

const STATUS_LABEL = {
  covered: 'Tratado no plano',
  partial: 'Tratado em parte',
  not_found: 'Não consta no plano',
};

type Side = { status: keyof typeof STATUS_LABEL; answer: string };

function clip(text: string, max: number) {
  if (text.length <= max) return text;

  return `${text.slice(0, text.lastIndexOf(' ', max))}…`;
}

function Card({ name, color, soft, side }: { name: string; color: string; soft: string; side: Side }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        border: `1px solid ${COLORS.line}`,
        borderTop: `8px solid ${color}`,
        borderRadius: 20,
        padding: '22px 26px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Newsreader', fontWeight: 600, fontSize: 36, color: color }}>{name}</span>
        <span
          style={{
            fontFamily: 'Inter Tight',
            fontWeight: 700,
            fontSize: 18,
            color,
            background: soft,
            borderRadius: 999,
            padding: '6px 14px',
          }}
        >
          {STATUS_LABEL[side.status]}
        </span>
      </div>
      <div style={{ display: 'flex', marginTop: 14, fontFamily: 'Inter Tight', fontSize: 22, lineHeight: 1.4, color: COLORS.ink2 }}>
        {clip(side.answer, 170)}
      </div>
    </div>
  );
}

export async function topicImage(question: string, lula: Side, flavio: Side) {
  return new ImageResponse(
    (
      <Frame>
        <Brand />
        <div style={{ display: 'flex', fontFamily: 'Newsreader', fontWeight: 600, fontSize: 52, lineHeight: 1.1, color: COLORS.ink }}>
          {question}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Card name="Lula" color={COLORS.lula} soft={COLORS.lulaSoft} side={lula} />
          <Card name="Flávio" color={COLORS.flavio} soft={COLORS.flavioSoft} side={flavio} />
        </div>
        <Footer />
      </Frame>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}

export async function appleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${COLORS.lula} 50%, ${COLORS.flavio} 50%)`,
        }}
      >
        <svg width="96" height="96" viewBox="0 0 64 64">
          <path d="M14 14L50 50M50 14L14 50" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: 180, height: 180 },
  );
}
