import React from 'react';
import { ShieldCheck, Server, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema } from '@/components/common/StructuredData';

const Security: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16 selection:bg-brand-500/30">
      <SEO title={t('security.seo.title')} description={t('security.seo.description')} />
      <BreadcrumbSchema
        items={[
          { name: t('security.breadcrumb.home'), path: '/' },
          { name: t('security.breadcrumb.current'), path: '/security' },
        ]}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-bold tracking-widest uppercase mb-4">
            {t('security.breadcrumb.current', 'Security')}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 tracking-tighter drop-shadow-sm pb-2">
            {t('security.heading')}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
            {t('security.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative">
          {/* Glow backdrop for cards component */}
          <div className="absolute inset-0 bg-brand-500/5 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-xl shadow-black/20 border border-white/5 text-center hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-bold text-xl text-white mb-3">{t('security.card1.title')}</h3>
            <p className="text-zinc-400 text-base">{t('security.card1.body')}</p>
          </div>
          <div className="relative bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-xl shadow-black/20 border border-white/5 text-center hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="font-bold text-xl text-white mb-3">{t('security.card2.title')}</h3>
            <p className="text-zinc-400 text-base">{t('security.card2.body')}</p>
          </div>
          <div className="relative bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-xl shadow-black/20 border border-white/5 text-center hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Server className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="font-bold text-xl text-white mb-3">{t('security.card3.title')}</h3>
            <p className="text-zinc-400 text-base">{t('security.card3.body')}</p>
          </div>
        </div>

        <div className="relative mt-12 bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-14 border border-white/5 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Subtle glowing orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight">
              {t('security.dataProtection.title')}
            </h2>
            <div className="space-y-6 text-zinc-300 leading-relaxed text-lg">
              <p>{t('security.dataProtection.p1')}</p>
              <p>{t('security.dataProtection.p2')}</p>
              <h3 className="text-2xl font-bold text-white mt-10 mb-4 tracking-tight">
                {t('security.vulnerability.title')}
              </h3>
              <p>{t('security.vulnerability.body')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
