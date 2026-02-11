'use client';

import Link from 'next/link';
import AppHeader from '@/app/components/AppHeader';
import Footer from '@/app/components/Footer';
import { getAllBlogPosts } from './posts';

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="home-page bg-background-dark text-white min-h-screen flex flex-col">
      <AppHeader />
      <main className="pt-24 flex-1">
        <section className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <header className="mb-10 text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80 mb-3">
              Blog
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Film Locations &amp; Movie Travel Guides
            </h1>
            <p className="text-white/60 text-sm sm:text-base max-w-2xl mx-auto">
              Deep dives into iconic filming locations, set‑jetting tips and behind‑the‑scenes stories
              from the world of movie geography.
            </p>
          </header>

          <section aria-label="Blog articles" className="grid gap-6 md:gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border border-white/10 rounded-xl px-5 py-5 md:px-6 md:py-6 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <header className="mb-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/40 mb-1">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                    })}{' '}
                    · {post.readingTime}
                  </p>
                  <h2 className="text-xl md:text-2xl font-semibold mb-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-primary transition-colors no-underline"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-white/60 text-sm md:text-base">
                    {post.description}
                  </p>
                </header>
                {post.tags?.length > 0 && (
                  <ul className="flex flex-wrap gap-2 mt-3 text-[11px] uppercase tracking-[0.18em] text-white/35">
                    {post.tags.slice(0, 4).map((tag) => (
                      <li key={tag} className="px-2 py-1 border border-white/10 rounded-full">
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

