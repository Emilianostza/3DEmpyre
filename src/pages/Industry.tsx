import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { INDUSTRIES } from '@/constants';
import { Check, Shield, ArrowRight, Eye } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema } from '@/components/common/StructuredData';

const Industry: React.FC = () => {
  const { t } = useTranslation();
  const { type } = useParams<{ type: string }>();
  const config = type ? INDUSTRIES[type] : null;

  if (!config) {
    return <Navigate to="/industries" replace />;
  }

  const faq1q = t(`industry.${config.id}.faq1.q`, { defaultValue: '' }) || t('industry.faq1.q');
  const faq1a = t(`industry.${config.id}.faq1.a`, { defaultValue: '' }) || t('industry.faq1.a');
  const faq2q = t(`industry.${config.id}.faq2.q`, { defaultValue: '' }) || t('industry.faq2.q');
  const faq2a = t(`industry.${config.id}.faq2.a`, { defaultValue: '' }) || t('industry.faq2.a');

  return (
    <div
      {...(import.meta.env.DEV && {
        'data-component': 'Industry',
        'data-file': 'src/pages/Industry.tsx',
      })}
    >
      <SEO title={config.title} description={config.subtitle} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: config.title, path: `/industries/${type}` },
        ]}
      />
      {/* Industry Hero */}
      <section data-section="hero" className="bg-zinc-900 text-white py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-brand-900/50 text-brand-200 text-sm font-semibold mb-6 border border-brand-700">
              {t('industry.badge', { title: config.title })}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{config.title}</h1>
            <p className="text-lg text-zinc-300 mb-8">{config.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={`/request?industry=${config.id}`}
                className="px-6 py-3 rounded-lg bg-brand-600 font-bold hover:bg-brand-500 transition-colors text-center"
              >
                {t('cta.getQuote')}
              </Link>
              <button
                onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 rounded-lg bg-white/10 border border-white/20 font-bold hover:bg-white/20 transition-colors text-center"
              >
                {t('industry.seeExamples')}
              </button>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-700">
            <img
              src={config.heroImage}
              alt={config.title}
              className="w-full h-auto object-cover"
              width={600}
              height={400}
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section data-section="outcomes" className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">{t('industry.whyManaged')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {config.outcomes.map((outcome, idx) => (
              <div key={idx} className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Check className="w-5 h-5" />
                </div>
                <p className="font-semibold text-zinc-200 text-lg">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asset Gallery */}
      <section
        data-section="gallery"
        id="gallery"
        className="py-20 bg-zinc-900 border-t border-zinc-800"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-900/40 text-brand-300 text-xs font-bold uppercase tracking-widest mb-4">
              {t('industry.sampleWork')}
            </span>
            <h2 className="text-3xl font-bold text-white">{t('industry.modelsDelivered')}</h2>
            <p className="text-zinc-400 mt-3 max-w-xl mx-auto">
              {t('industry.sampleBrowse', { id: config.id })}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {config.samples.map((sample, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={sample.thumb}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    width={200}
                    height={200}
                  />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/40 transition-colors duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Eye className="w-4 h-4 text-zinc-800" />
                  </div>
                </div>
                {/* Caption */}
                <div className="px-3 py-2.5">
                  <div className="text-xs font-semibold text-zinc-100 truncate">{sample.name}</div>
                  <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-brand-900/30 text-brand-300">
                    {sample.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to={`/request?industry=${config.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >
              {t('cta.getQuote')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Permissions / Features */}
      <section data-section="features" className="py-20 bg-zinc-950 border-t border-zinc-800">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <img
              src={config.demoImage}
              alt="Demo 3D Model"
              className="rounded-xl shadow-lg"
              width={600}
              height={400}
              loading="lazy"
            />
            <div className="absolute -bottom-6 -right-6 bg-zinc-800 p-4 rounded-lg shadow-xl border border-zinc-700 max-w-xs">
              <div className="text-sm font-bold text-white mb-1">
                {t('industry.interactiveViewer')}
              </div>
              <div className="text-xs text-zinc-400">{t('industry.interactiveViewerDesc')}</div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold text-white mb-6">{t('industry.teamCanDo')}</h2>
            <p className="text-zinc-400 mb-8">{t('industry.teamCanDoDesc', { id: config.id })}</p>
            <ul className="space-y-4">
              {config.permissions.map((perm, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-brand-600 mt-1 flex-shrink-0" />
                  <span className="text-zinc-300">{perm}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link
                to="/request"
                className="text-brand-600 font-bold hover:text-brand-700 flex items-center gap-2"
              >
                {t('industry.getFreeQuote')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section data-section="faq" className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t('industry.faq')}</h2>
          <div className="space-y-4">
            <details className="group border border-zinc-800 rounded-lg open:bg-zinc-900">
              <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-white">
                {faq1q}
              </summary>
              <div className="p-4 pt-0 text-zinc-400">{faq1a}</div>
            </details>
            <details className="group border border-zinc-800 rounded-lg open:bg-zinc-900">
              <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-white">
                {faq2q}
              </summary>
              <div className="p-4 pt-0 text-zinc-400">{faq2a}</div>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Industry;
