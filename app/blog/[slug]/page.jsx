import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppHeader from '@/app/components/AppHeader';
import Footer from '@/app/components/Footer';
import { getAllBlogPosts, getBlogPostBySlug } from '../posts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wherewasfilmed.com';

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Film Locations Blog | Where Was It Filmed',
      description: 'Articles about movie filming locations, set‑jetting and film‑inspired travel.',
      alternates: {
        canonical: `${siteUrl}/blog`,
      },
    };
  }

  const url = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | Where Was It Filmed`,
    description: post.description.substring(0, 160),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${post.title} | Where Was It Filmed`,
      description: post.description.substring(0, 200),
      url,
      siteName: 'Where Was It Filmed',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Where Was It Filmed`,
      description: post.description.substring(0, 200),
    },
  };
}

export default function BlogPostPage({ params }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const isoDate = post.date;
  const readableDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: isoDate,
    dateModified: isoDate,
    author: {
      '@type': 'Person',
      name: 'Where Was It Filmed',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Where Was It Filmed',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/assets/film.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };

  return (
    <div className="home-page bg-background-dark text-white min-h-screen flex flex-col">
      <AppHeader />
      <main className="pt-24 flex-1">
        <section className="max-w-3xl mx-auto px-6 py-10 md:py-14">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <header className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40 mb-2">
              {readableDate} · {post.readingTime}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              {post.title}
            </h1>
            <p className="text-white/60 text-sm sm:text-base">
              {post.description}
            </p>
          </header>

          <article className="prose prose-invert max-w-none text-white/80 text-sm sm:text-base leading-relaxed">
            {post.body.map((paragraph, idx) => (
              <p key={idx} className="mb-4">
                {paragraph}
              </p>
            ))}
          </article>

          <footer className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-white/40 uppercase tracking-[0.18em]">
              {post.tags?.length ? post.tags.join(' · ') : null}
            </div>
            <div className="flex gap-4 text-sm">
              <Link href="/blog" className="text-white/60 hover:text-primary transition-colors">
                ← Back to blog
              </Link>
              <Link href="/" className="text-white/60 hover:text-primary transition-colors">
                Go to homepage
              </Link>
            </div>
          </footer>
        </section>
      </main>
      <Footer />
    </div>
  );
}

