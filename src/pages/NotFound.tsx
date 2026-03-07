import React from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/Button';
import { SEO } from '@/components/common/SEO';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 px-4">
      <SEO title={t('notFound.seo.title')} description={t('notFound.seo.desc')} />
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-[80px] sm:text-[120px] md:text-[180px] font-bold leading-none bg-gradient-to-br from-brand-400 via-purple-400 to-brand-600 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-4xl font-bold text-white mb-4">{t('notFound.heading')}</h2>
        <p className="text-lg text-zinc-400 mb-8 max-w-md mx-auto">{t('notFound.desc')}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link to="/">
            <Button variant="primary" size="lg">
              {t('notFound.goHome')} <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/library">
            <Button variant="secondary" size="lg">
              {t('notFound.viewLibrary')}
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="border-t border-zinc-700 pt-8">
          <p className="text-sm text-zinc-500 mb-4">{t('notFound.lookingFor')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              to="/industries/restaurants"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              {t('notFound.restaurants')}
            </Link>
            <span className="text-zinc-700">•</span>
            <Link to="/request" className="text-brand-400 hover:text-brand-300 font-medium">
              {t('cta.getQuote')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
