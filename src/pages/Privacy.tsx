import React from 'react';
import { Shield, Lock, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema } from '@/components/common/StructuredData';

const Privacy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16 selection:bg-brand-500/30">
      <SEO title={t('privacy.seo.title')} description={t('privacy.seo.description')} />
      <BreadcrumbSchema
        items={[
          { name: t('privacy.breadcrumb.home'), path: '/' },
          { name: t('privacy.breadcrumb.current'), path: '/privacy' },
        ]}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-bold tracking-widest uppercase mb-4">
            {t('privacy.breadcrumb.current', 'Privacy')}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 tracking-tighter drop-shadow-sm pb-2">
            {t('privacy.heading')}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
            {t('privacy.subtitle')}
          </p>
        </div>

        <div className="relative mt-12 bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-14 space-y-12 border border-white/5 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Subtle glowing orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 space-y-12">
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-inner">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('privacy.section1.title')}</h2>
              </div>
              <p className="text-zinc-300 leading-relaxed mb-4">{t('privacy.section1.body')}</p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li>{t('privacy.section1.item1')}</li>
                <li>{t('privacy.section1.item2')}</li>
                <li>{t('privacy.section1.item3')}</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-inner">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('privacy.section2.title')}</h2>
              </div>
              <p className="text-zinc-300 leading-relaxed">{t('privacy.section2.body')}</p>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('privacy.section3.title')}</h2>
              </div>
              <p className="text-zinc-300 leading-relaxed">{t('privacy.section3.body')}</p>
            </section>

            <div className="pt-8 border-t border-white/5 flex items-center justify-between opacity-80">
              <p className="text-sm font-medium text-zinc-500">{t('privacy.lastUpdated')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
