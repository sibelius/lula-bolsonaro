import { homeImage, OG_SIZE } from '@/lib/og';

export const alt = 'Lula × Flávio — uma pergunta, duas respostas dos planos de governo';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return homeImage();
}
