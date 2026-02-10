'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Searchbar from './components/Searchbar';
import AppHeader from './components/AppHeader';
import Footer from './components/Footer';
import { IconTrendingUp, IconLocationOn, IconVideocam } from './components/Icons';
import { encodeMovieId } from '@/lib/movieId';

const MAX_RECENT = 10;

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetch('/api/searches?type=popular&limit=8')
      .then((res) => res.ok ? res.json() : { popular: [] })
      .then((data) => {
        if (Array.isArray(data?.popular)) setPopular(data.popular);
      })
      .catch(() => setPopular([]));
  }, []);

  useEffect(() => {
    fetch(`/api/searches?type=recent&limit=${MAX_RECENT}`)
      .then((res) => res.ok ? res.json() : { recent: [] })
      .then((data) => {
        if (Array.isArray(data?.recent)) setRecent(data.recent.slice(0, MAX_RECENT));
      })
      .catch(() => setRecent([]));
  }, []);

  const trendingItems = (popular || []).map((item) => {
    const rawTitle = item.title?.trim();
    const displayTitle =
      rawTitle && rawTitle !== 'Unknown title' ? rawTitle : (item.movieId || '');
    return {
      title: displayTitle,
      href: `/movie/${encodeMovieId(item.movieId)}`,
    };
  });

  const recentItems = (recent || []).slice(0, MAX_RECENT).map((item) => {
    const rawTitle = item.title?.trim();
    const displayTitle =
      rawTitle && rawTitle !== 'Unknown title' ? rawTitle : (item.movieId || '');
    return {
      title: displayTitle,
      href: `/movie/${encodeMovieId(item.movieId)}`,
    };
  });

  return (
    <div className="home-page bg-background-dark text-white selection:bg-primary/30 min-h-screen flex flex-col">
      <AppHeader />

      <main className="pt-24 flex-1">
        <section className="relative min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 overflow-visible">
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          </div>
          <div className="text-center mb-12 max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-tight">
              Discover where the magic happened.
            </h1>
            <p className="text-white/40 text-lg md:text-xl font-light">
              Explore real-life filming locations from thousands of movies and TV shows across the globe.
            </p>
          </div>

          <Searchbar variant="hero" />

          {trendingItems.length > 0 && (
            <div className="w-full max-w-6xl px-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-accent-gold">
                  <IconTrendingUp size={22} className="text-xl" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Trending Searches</h3>
              </div>
              <div className="marquee-row py-3">
                <div className="marquee-inner">
                  {[...trendingItems, ...trendingItems].map((item, i) => (
                    <span key={`${item.href}-${item.title}-${i}`} className="marquee-item">
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full pl-3 pr-6 py-2 cursor-pointer transition-all chip-glow no-underline text-white text-sm font-medium whitespace-nowrap"
                      >
                        <IconLocationOn size={20} className="text-primary flex-shrink-0" />
                        {item.title}
                      </Link>
                      {i < trendingItems.length * 2 - 1 && (
                        <span className="marquee-sep text-white/40">◆</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {recentItems.length > 0 && (
            <div className="w-full max-w-6xl px-4 mt-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-white/60">
                  <IconLocationOn size={18} className="text-lg" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">Recent Searches</h3>
              </div>
              <div className="marquee-row py-2">
                <div className="marquee-inner" style={{ animationDuration: '50s' }}>
                  {[...recentItems, ...recentItems].map((item, i) => (
                    <span key={`${item.href}-${item.title}-${i}`} className="marquee-item">
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full pl-2.5 pr-5 py-1.5 cursor-pointer transition-all no-underline text-white/90 text-sm font-medium whitespace-nowrap"
                      >
                        {item.title}
                      </Link>
                      {i < recentItems.length * 2 - 1 && (
                        <span className="marquee-sep text-white/30">•</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16 md:py-20 border-t border-white/5">
          <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-center">
            <div className="md:col-span-5 order-2 md:order-1 space-y-4">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                Global Community
              </span>
              <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-md">
                Join 50k+ users who have discovered 12,000+ filming locations — from Tokyo to New Zealand, we’re mapping cinematic history together.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 bg-accent-gold/15 text-accent-gold border border-accent-gold/30 rounded-full px-3 py-1.5 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                  12k+ locations
                </span>
                <span className="inline-flex items-center gap-1.5 bg-primary/15 text-primary border border-primary/30 rounded-full px-3 py-1.5 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
                  50k+ explorers
                </span>
              </div>
            </div>
            <div className="md:col-span-7 order-1 md:order-2 relative">
              <div className="community-map-card relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">
                <div
                  className="aspect-[16/10] md:aspect-[2/1] bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200')",
                    filter: 'brightness(0.85) contrast(1.05) saturate(0.7)',
                  }}
                  aria-hidden
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent" />
                <div className="absolute inset-0 flex items-end justify-center pb-4 md:pb-6">
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-3">
                    {[
                      { label: 'Skyfall', place: 'London' },
                      { label: "King's Speech", place: 'UK' },
                      { label: 'Harry Potter', place: 'Scotland' },
                    ].map((pin) => (
                      <div
                        key={pin.label}
                        className="community-pin flex items-center gap-1.5 bg-black/70 backdrop-blur-sm border border-white/20 rounded-full pl-2 pr-2.5 py-1.5 shadow-lg"
                      >
                        <span className="text-accent-gold">
                          <IconVideocam size={14} />
                        </span>
                        <span className="text-[10px] md:text-xs font-semibold text-white whitespace-nowrap">
                          {pin.label}
                          <span className="text-white/50 font-normal ml-0.5">· {pin.place}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold rounded px-2 py-1 bg-black/30">
                    Live map
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" title="Active" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16 md:py-20 border-t border-white/5">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-10">
            How it works
          </p>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: 1,
                title: 'Search a movie or show',
                description: 'Type any film or series and pick from suggestions.',
              },
              {
                step: 2,
                title: 'Explore filming locations',
                description: 'See where each scene was shot on the map with pins and regions.',
              },
              {
                step: 3,
                title: 'Plan your visit',
                description: 'Use the list and map to plan trips to real-world locations.',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-1/2 h-px bg-gradient-to-r from-white/20 to-transparent pointer-events-none" style={{ marginLeft: '22px' }} aria-hidden />
                )}
                <div className="how-it-works-card h-full rounded-xl border border-white/10 bg-white/[0.02] p-6 md:p-7 text-center md:text-left">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 text-primary text-sm font-bold">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-white/50 text-xs leading-relaxed max-w-xs md:max-w-none">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
