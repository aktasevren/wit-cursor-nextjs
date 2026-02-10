'use client';

import Link from 'next/link';
import { IconMovieFilter } from '@/app/components/Icons';

const TITLE = 'where was it filmed';
/* Beyaz, gümüş, kırmızı, mavi — sinematik palet (koyu arka planda hepsi görünür) */
const CINEMA_COLORS = [
  { color: '#ffffff' },
  { color: '#a8a8a8' },
  { color: '#dc2626' },
  { color: '#2563eb' },
];

export default function LogoTitle() {
  let colorIndex = 0;
  return (
    <Link href="/" className="site-logo-title flex items-center gap-4" aria-label="Where Was It Filmed - Go to homepage">
      <div className="p-2 bg-[#1111d4] rounded-lg text-white" aria-hidden="true">
        <IconMovieFilter size={24} />
      </div>
      <span className="site-logo-title-text">
        {TITLE.split('').map((char, i) => {
          const isSpace = char === ' ';
          const style = isSpace ? {} : CINEMA_COLORS[colorIndex % CINEMA_COLORS.length];
          if (!isSpace) colorIndex += 1;
          return (
            <span
              key={i}
              className="site-logo-title-char"
              style={{
                ...(isSpace ? {} : { color: style.color, textShadow: style.stroke || 'none' }),
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    </Link>
  );
}
