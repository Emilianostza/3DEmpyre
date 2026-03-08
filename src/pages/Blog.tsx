import React, { useState } from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { placeholder } from '@/config/site';
import { BLOG_POSTS, type BlogPost } from '@/data/blog-posts';
import { i18nToLocale } from '@/utils/formatters';

const CATEGORIES = ['All', 'Industry Trends', 'Case Studies', 'Guides', 'Product Updates'] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_HUES: Record<BlogPost['category'], number> = {
  'Industry Trends': 220,
  'Case Studies': 270,
  Guides: 160,
  'Product Updates': 30,
};

const CATEGORY_KEYS: Record<string, string> = {
  All: 'blog.categories.all',
  'Industry Trends': 'blog.categories.industryTrends',
  'Case Studies': 'blog.categories.caseStudies',
  Guides: 'blog.categories.guides',
  'Product Updates': 'blog.categories.productUpdates',
};

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation();

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString(i18nToLocale(i18n.language), {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filtered =
    activeCategory === 'All' ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === activeCategory);

  return (
    <div
      className="min-h-screen bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'Blog',
        'data-file': 'src/pages/Blog.tsx',
      })}
    >
      <SEO title={t('blog.seo.title')} description={t('blog.seo.desc')} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section data-section="hero" className="relative bg-zinc-950 overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-brand-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="reveal relative container mx-auto px-4 max-w-3xl text-center">
          <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            {t('blog.hero.badge')}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('blog.hero.heading')}
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {t('blog.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ── Category Filters ─────────────────────────────── */}
      <section data-section="category-filters" className="reveal bg-zinc-950 pb-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                {t(CATEGORY_KEYS[cat])}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Card Grid ────────────────────────────────────── */}
      <section data-section="card-grid" className="reveal bg-zinc-950 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {filtered.length === 0 ? (
            <p className="text-center text-zinc-500 py-20 text-lg">{t('blog.empty')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-hover"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={placeholder(800, 450, post.category, CATEGORY_HUES[post.category])}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      width={800}
                      height={450}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-6">
                    {/* Category pill */}
                    <span className="self-start text-xs font-bold uppercase tracking-widest text-brand-300 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-3">
                      {t(CATEGORY_KEYS[post.category] ?? post.category)}
                    </span>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-brand-400 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t('blog.minRead', { minutes: post.readingTime })}</span>
                      </div>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>

                    {/* Read more */}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-400 group-hover:text-brand-300 transition-colors">
                      {t('blog.readMore')}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section data-section="cta" className="relative py-24 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />

        <div className="reveal relative container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('blog.cta.heading')}
          </h2>
          <p className="text-zinc-400 text-lg mb-10">{t('blog.cta.desc')}</p>
          <Link
            to="/request"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all hover:-translate-y-px hover:shadow-glow"
          >
            {t('cta.getQuote')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-zinc-500 mt-6">{t('cta.reassurance')}</p>
        </div>
      </section>
    </div>
  );
};

export default Blog;
