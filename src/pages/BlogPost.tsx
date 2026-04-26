import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { BlogPostingSchema } from '@/components/common/StructuredData';
import { placeholder } from '@/config/site';
import { BLOG_POSTS } from '@/data/blog-posts';
import { i18nToLocale } from '@/utils/formatters';

const CATEGORY_HUES: Record<string, number> = {
  'Industry Trends': 220,
  'Case Studies': 270,
  Guides: 160,
  'Product Updates': 30,
};

const BlogPost: React.FC = () => {
  const { t, i18n } = useTranslation();

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString(i18nToLocale(i18n.language), {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  const { slug } = useParams<{ slug: string }>();

  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 4);
  const paragraphs = post.body.split('\n\n').filter(Boolean);

  return (
    <div
      className="min-h-screen bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'BlogPost',
        'data-file': 'src/pages/BlogPost.tsx',
      })}
    >
      <SEO title={post.title} description={post.excerpt} />
      <BlogPostingSchema
        headline={post.title}
        description={post.excerpt}
        datePublished={post.publishedAt}
        authorName={post.author.name}
      />

      {/* ── Article ───────────────────────────────────────── */}
      <article className="relative bg-zinc-950 pt-24 pb-20">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

        <div className="reveal relative container mx-auto px-4 max-w-3xl">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-zinc-500 mb-8"
          >
            <Link to="/blog" className="hover:text-zinc-300 transition-colors">
              {t('blogPost.breadcrumbBlog')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-400 truncate max-w-[300px]">{post.title}</span>
          </nav>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-300 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{t('blogPost.minRead', { minutes: post.readingTime })}</span>
            </div>
            <span className="text-sm text-zinc-500">{formatDate(post.publishedAt)}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-10">
            {post.title}
          </h1>

          {/* Body paragraphs */}
          <div className="space-y-6">
            {paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-zinc-300 leading-relaxed text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Author info */}
          <div className="mt-14 pt-8 border-t border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-brand-400 font-bold text-sm">
                {post.author.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
              </div>
              <div>
                <p className="text-white font-semibold">{post.author.name}</p>
                <p className="text-sm text-zinc-500">{post.author.role}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* ── Related Posts ─────────────────────────────────── */}
      <section
        data-section="related-posts"
        className="reveal bg-zinc-950 py-16 border-t border-zinc-800/40"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-white mb-8">{t('blogPost.relatedHeading')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                to={`/blog/${related.slug}`}
                className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-hover"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={placeholder(
                      800,
                      450,
                      related.category,
                      CATEGORY_HUES[related.category] ?? 270
                    )}
                    alt={related.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={800}
                    height={450}
                  />
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-300 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
                    {related.category}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-3 mb-2 leading-snug group-hover:text-brand-400 transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                    {related.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-400 group-hover:text-brand-300 transition-colors">
                    {t('blogPost.readMore')}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section data-section="cta" className="relative py-24 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />

        <div className="reveal relative container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('blogPost.cta.heading')}
          </h2>
          <p className="text-zinc-400 text-lg mb-10">{t('blogPost.cta.desc')}</p>
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

export default BlogPost;
