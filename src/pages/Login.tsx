import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useLocale } from '@/contexts/LocaleContext';
import { Box, ArrowRight, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { PortalRole } from '@/types';
import { SEO } from '@/components/common/SEO';
import { useLoginRateLimiter } from '@/hooks/useRateLimiter';
import { sanitizeEmail } from '@/utils/sanitize';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'employee'>('employee');
  const navigate = useNavigate();
  const { localePath } = useLocale();
  const { login, loading, error, user } = useAuth();
  const rateLimiter = useLoginRateLimiter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const roleType = user?.role?.type as PortalRole | undefined;
      if (!roleType) {
        navigate(localePath('/'));
        return;
      }
      if (roleType === PortalRole.SuperAdmin) {
        navigate('/app/super-admin');
      } else if ([PortalRole.CustomerOwner, PortalRole.CustomerViewer].includes(roleType)) {
        navigate('/portal/dashboard');
      } else {
        navigate('/app/dashboard');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rateLimiter.canAttempt) {
      return; // Rate limited — UI shows lockout message
    }

    try {
      await login(sanitizeEmail(email), password);
      rateLimiter.recordSuccess();
    } catch {
      rateLimiter.recordFailure();
    }
  };

  // Mock user suggestions for demo — only in development
  const mockUsers = import.meta.env.DEV
    ? [
        { email: 'superadmin@example.com', role: 'employee', name: 'Super Admin' },
        { email: 'admin@company.com', role: 'employee', name: 'Admin' },
        { email: 'approver@company.com', role: 'employee', name: 'Approver' },
        { email: 'tech@company.com', role: 'employee', name: 'Technician' },
        { email: 'client@bistro.com', role: 'customer', name: 'Restaurant Owner' },
        { email: 'client@grandhotel.com', role: 'customer', name: 'Hotel Manager' },
        { email: 'client@fashionstore.com', role: 'customer', name: 'Retail Store Owner' },
        { email: 'client@luxuryproperties.com', role: 'customer', name: 'Real Estate Agent' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <SEO title={t('login.seo.title')} description={t('login.seo.description')} />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/20 p-8 border border-white/[0.08] animated-border">
          <div className="flex justify-center mb-8">
            <Link
              to="/"
              className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white hover:from-brand-400 hover:to-brand-600 transition-all shadow-glow"
            >
              <Box className="w-8 h-8" />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">{t('login.heading')}</h1>
          <p className="text-center text-zinc-400 mb-8">{t('login.subtitle')}</p>

          {/* Role Toggle with Descriptions */}
          <div className="space-y-2 mb-8">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">
              {t('login.roleLabel')}
            </label>
            <div
              className="bg-white/[0.04] p-1 rounded-lg flex"
              role="group"
              aria-label={t('login.roleLabel')}
            >
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${selectedRole === 'customer' ? 'bg-brand-600/20 text-brand-300 ring-1 ring-brand-500/40' : 'text-zinc-400 hover:text-zinc-300'}`}
                aria-pressed={selectedRole === 'customer'}
              >
                {t('login.roleCustomer')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('employee')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${selectedRole === 'employee' ? 'bg-brand-600/20 text-brand-300 ring-1 ring-brand-500/40' : 'text-zinc-400 hover:text-zinc-300'}`}
                aria-pressed={selectedRole === 'employee'}
              >
                {t('login.roleEmployee')}
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              {selectedRole === 'customer'
                ? t('login.roleDescCustomer')
                : t('login.roleDescEmployee')}
            </p>
          </div>

          {/* Rate Limit Warning */}
          {!rateLimiter.canAttempt && (
            <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4 mb-6 flex gap-3" role="alert">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300">
                {t('login.rateLimited', {
                  seconds: Math.ceil(rateLimiter.remainingLockoutMs / 1000),
                })}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && rateLimiter.canAttempt && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6 flex gap-3" role="alert">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                {t('login.emailLabel')}
              </label>
              <input
                type="email"
                required
                disabled={loading}
                className="w-full p-3 border border-white/[0.08] rounded-xl focus:border-brand-500 focus:ring-0 outline-none bg-white/[0.04] focus:bg-white/[0.06] text-white placeholder-zinc-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                {t('login.passwordLabel')}
              </label>
              <input
                type="password"
                required
                disabled={loading}
                className="w-full p-3 border border-white/[0.08] rounded-xl focus:border-brand-500 focus:ring-0 outline-none bg-white/[0.04] focus:bg-white/[0.06] text-white placeholder-zinc-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !rateLimiter.canAttempt}
              className="group w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white py-3.5 rounded-xl font-bold hover:from-brand-500 hover:to-brand-400 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:scale-105 active:scale-100 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('login.signingIn')}
                </>
              ) : (
                <>
                  {t('login.signIn')}{' '}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo User Quick Links — DEV only */}
          {import.meta.env.DEV && mockUsers.length > 0 && (
            <div className="mt-6 p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <p className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">
                {t('login.demoUsers')}
              </p>
              <div className="space-y-2">
                {mockUsers
                  .filter((u) => u.role === selectedRole)
                  .map((user, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEmail(user.email);
                        setPassword('demo');
                      }}
                      disabled={loading}
                      className="w-full text-left p-2 text-sm rounded bg-white/[0.04] border border-white/[0.06] hover:border-brand-500/40 hover:bg-white/[0.06] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-xs text-zinc-400">{user.email}</div>
                    </button>
                  ))}
              </div>
              <p className="text-xs text-zinc-400 mt-3">{t('login.demoHint')}</p>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-zinc-400">
            {selectedRole === 'customer' ? (
              <p>{t('login.noAccountCustomer')}</p>
            ) : (
              <p>{t('login.noAccountEmployee')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
