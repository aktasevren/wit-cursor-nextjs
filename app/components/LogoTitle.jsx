'use client';

import Link from 'next/link';
import { IconMovieFilter } from '@/app/components/Icons';

const TITLE = 'WHERE WAS IT FILMED';

export default function LogoTitle() {
  return (
    <Link href="/" className="site-logo-title flex items-center gap-4 no-underline" aria-label="Where Was It Filmed - Go to homepage">
      <div className="p-2 bg-[#1111d4] rounded-lg text-white" aria-hidden="true">
        <IconMovieFilter size={24} />
      </div>
      <span className="site-logo-title-text">{TITLE}</span>
    </Link>
  );
}
