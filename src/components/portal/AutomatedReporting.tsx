import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Project, Asset } from '@/types';
import {
  FileBarChart,
  Calendar,
  Mail,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Settings,
  Send,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AutomatedReportingProps {
  projects: Project[];
  assets: Asset[];
}

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  frequency: 'Weekly' | 'Monthly';
  lastGenerated: string;
}

interface ScheduleEntry {
  reportId: string;
  enabled: boolean;
}

interface ReportHistoryRow {
  id: string;
  reportType: string;
  generatedDate: string;
  period: string;
  status: 'Sent' | 'Pending' | 'Failed';
  size: string;
}

interface GeneratedReport {
  templateId: string;
  title: string;
  generatedDate: string;
  periodCovered: string;
  highlights: string[];
  stats: { label: string; value: string }[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'weekly-performance',
    title: 'Weekly Performance Summary',
    description: 'Project status changes, asset uploads, views summary',
    icon: TrendingUp,
    frequency: 'Weekly',
    lastGenerated: '2d ago',
  },
  {
    id: 'monthly-revenue',
    title: 'Monthly Revenue Report',
    description: 'Revenue by client, by market, growth trends',
    icon: BarChart3,
    frequency: 'Monthly',
    lastGenerated: '1w ago',
  },
  {
    id: 'client-health',
    title: 'Client Health Report',
    description: 'At-risk clients, engagement metrics, churn indicators',
    icon: Users,
    frequency: 'Monthly',
    lastGenerated: '1w ago',
  },
  {
    id: 'asset-analytics',
    title: 'Asset Analytics Report',
    description: 'Top performing assets, view trends, device breakdown',
    icon: Activity,
    frequency: 'Weekly',
    lastGenerated: '2d ago',
  },
];

const MOCK_HISTORY: ReportHistoryRow[] = [
  {
    id: 'h1',
    reportType: 'Weekly Performance Summary',
    generatedDate: 'Feb 17, 2026',
    period: 'Feb 10 - Feb 16',
    status: 'Sent',
    size: '1.2 MB',
  },
  {
    id: 'h2',
    reportType: 'Monthly Revenue Report',
    generatedDate: 'Feb 1, 2026',
    period: 'January 2026',
    status: 'Sent',
    size: '2.4 MB',
  },
  {
    id: 'h3',
    reportType: 'Client Health Report',
    generatedDate: 'Feb 1, 2026',
    period: 'January 2026',
    status: 'Pending',
    size: '1.8 MB',
  },
  {
    id: 'h4',
    reportType: 'Asset Analytics Report',
    generatedDate: 'Feb 10, 2026',
    period: 'Feb 3 - Feb 9',
    status: 'Sent',
    size: '980 KB',
  },
  {
    id: 'h5',
    reportType: 'Weekly Performance Summary',
    generatedDate: 'Feb 10, 2026',
    period: 'Feb 3 - Feb 9',
    status: 'Failed',
    size: '--',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeNextDate(frequency: 'Weekly' | 'Monthly'): string {
  const now = new Date();
  if (frequency === 'Weekly') {
    const dayOfWeek = now.getDay(); // 0=Sun..6=Sat
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek;
    const next = new Date(now);
    next.setDate(now.getDate() + daysUntilMonday);
    return next.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  // Monthly: 1st of next month
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusBadgeClasses(status: 'Sent' | 'Pending' | 'Failed'): string {
  switch (status) {
    case 'Sent':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'Pending':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'Failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AutomatedReporting: React.FC<AutomatedReportingProps> = ({ projects, assets }) => {
  const { t } = useTranslation();

  // ---- State ----
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [emailingSent, setEmailingSent] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(
    REPORT_TEMPLATES.map((tmpl) => ({ reportId: tmpl.id, enabled: tmpl.frequency === 'Weekly' }))
  );
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // ---- Computed data from props ----
  const reportData = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status !== 'archived').length;
    const publishedAssets = assets.filter((a) => a.status === 'Published').length;
    const totalViews = assets.reduce((sum, a) => sum + (a.viewCount ?? 0), 0);
    const deliveredProjects = projects.filter((p) => p.status === 'delivered').length;
    const completionRate =
      totalProjects > 0 ? Math.round((deliveredProjects / totalProjects) * 100) : 0;

    // Top client: client with most projects
    const clientCounts: Record<string, number> = {};
    for (const p of projects) {
      const client = p.client ?? 'Unknown';
      clientCounts[client] = (clientCounts[client] ?? 0) + 1;
    }
    let topClient = 'N/A';
    let topClientCount = 0;
    for (const [client, count] of Object.entries(clientCounts)) {
      if (count > topClientCount) {
        topClient = client;
        topClientCount = count;
      }
    }

    return {
      totalProjects,
      activeProjects,
      publishedAssets,
      totalViews,
      deliveredProjects,
      completionRate,
      topClient,
      topClientCount,
    };
  }, [projects, assets]);

  const enabledScheduleCount = useMemo(
    () => schedules.filter((s) => s.enabled).length,
    [schedules]
  );

  // ---- Handlers ----
  const handleGenerateReport = useCallback(
    (template: ReportTemplate) => {
      setGeneratingId(template.id);
      setGeneratedReport(null);

      const timer = setTimeout(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);

        const generated: GeneratedReport = {
          templateId: template.id,
          title: template.title,
          generatedDate: now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          periodCovered: `${oneWeekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          highlights: [
            `${reportData.activeProjects} projects active`,
            `${reportData.publishedAssets} assets published`,
            `${reportData.totalViews.toLocaleString()} total views`,
            `Top client: ${reportData.topClient} (${reportData.topClientCount} projects)`,
          ],
          stats: [
            { label: t('portal.reporting.totalProjects'), value: String(reportData.totalProjects) },
            {
              label: t('portal.reporting.activeProjects'),
              value: String(reportData.activeProjects),
            },
            {
              label: t('portal.reporting.publishedAssets'),
              value: String(reportData.publishedAssets),
            },
            {
              label: t('portal.reporting.totalViews'),
              value: reportData.totalViews.toLocaleString(),
            },
            { label: t('portal.reporting.completionRate'), value: `${reportData.completionRate}%` },
            { label: t('portal.reporting.delivered'), value: String(reportData.deliveredProjects) },
          ],
        };

        setGeneratedReport(generated);
        setGeneratingId(null);
      }, 2000);

      return () => clearTimeout(timer);
    },
    [reportData, t]
  );

  const handleDownloadPdf = useCallback(() => {
    setDownloadingPdf(true);
    const timer = setTimeout(() => setDownloadingPdf(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleEmailReport = useCallback(() => {
    setEmailingSent(true);
    const timer = setTimeout(() => setEmailingSent(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleSchedule = useCallback((reportId: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.reportId === reportId ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  const handleSaveSchedule = useCallback(() => {
    setSavingSchedule(true);
    setScheduleSaved(false);
    const timer = setTimeout(() => {
      setSavingSchedule(false);
      setScheduleSaved(true);
      const resetTimer = setTimeout(() => setScheduleSaved(false), 2000);
      return () => clearTimeout(resetTimer);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleResend = useCallback((rowId: string) => {
    setResendingId(rowId);
    const timer = setTimeout(() => {
      setResendingId(null);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // ---- Render ----
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      {/* Header */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {t('portal.reporting.title')}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t('portal.reporting.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
            {t('portal.reporting.reportsThisMonth')}
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">12</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
            {t('portal.reporting.scheduledReports')}
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{enabledScheduleCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
            {t('portal.reporting.lastReportSent')}
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">2 days ago</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
            {t('portal.reporting.emailDeliveryRate')}
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">99.2%</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* ================================================================= */}
        {/* Section 1: Report Templates                                       */}
        {/* ================================================================= */}
        <section>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
            {t('portal.reporting.reportTemplates')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REPORT_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isGenerating = generatingId === template.id;

              return (
                <div
                  key={template.id}
                  className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">
                          {template.title}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          template.frequency === 'Weekly'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        }`}
                      >
                        {template.frequency}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {template.lastGenerated}
                      </span>
                    </div>

                    <button
                      onClick={() => handleGenerateReport(template)}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {t('portal.reporting.compilingReport')}
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          {t('portal.reporting.generateNow')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* Section 2: Generated Report Preview                               */}
        {/* ================================================================= */}
        {generatedReport && (
          <section className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {generatedReport.title}
              </h3>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t('portal.reporting.generated')}: {generatedReport.generatedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t('portal.reporting.period')}: {generatedReport.periodCovered}
              </span>
            </div>

            {/* Highlights */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                {t('portal.reporting.keyHighlights')}
              </h4>
              <ul className="space-y-1.5">
                {generatedReport.highlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-5">
              {generatedReport.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center"
                >
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                {downloadingPdf
                  ? t('portal.reporting.downloaded')
                  : t('portal.reporting.downloadPdf')}
              </button>
              <button
                onClick={handleEmailReport}
                disabled={emailingSent}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-60 text-zinc-900 dark:text-white text-sm font-semibold transition-colors"
              >
                <Mail className="w-4 h-4" />
                {emailingSent ? t('portal.reporting.sent') : t('portal.reporting.emailReport')}
              </button>
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* Section 3: Schedule Configuration                                 */}
        {/* ================================================================= */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {t('portal.reporting.scheduleConfiguration')}
            </h3>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {REPORT_TEMPLATES.map((template, idx) => {
              const schedule = schedules.find((s) => s.reportId === template.id);
              const isEnabled = schedule?.enabled ?? false;
              const isLast = idx === REPORT_TEMPLATES.length - 1;

              return (
                <div
                  key={template.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 ${
                    !isLast ? 'border-b border-zinc-100 dark:border-zinc-800' : ''
                  } ${isEnabled ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleSchedule(template.id)}
                      className="flex-shrink-0 focus:outline-none"
                      aria-label={`Toggle ${template.title}`}
                    >
                      {isEnabled ? (
                        <ToggleRight className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isEnabled
                            ? 'text-zinc-900 dark:text-white'
                            : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      >
                        {template.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {template.frequency === 'Weekly'
                          ? t('portal.reporting.everyMonday')
                          : t('portal.reporting.firstOfMonth')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 sm:flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      admin@3dempyre.com
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t('portal.reporting.next')}: {computeNextDate(template.frequency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSaveSchedule}
              disabled={savingSchedule}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              {savingSchedule ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('portal.reporting.saving')}
                </>
              ) : scheduleSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t('portal.reporting.saved')}
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  {t('portal.reporting.saveSchedule')}
                </>
              )}
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* Section 4: Report History                                         */}
        {/* ================================================================= */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {t('portal.reporting.reportHistory')}
            </h3>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {t('portal.reporting.reportType')}
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {t('portal.reporting.generatedDate')}
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {t('portal.reporting.periodHeader')}
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {t('portal.reporting.status')}
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {t('portal.reporting.size')}
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {t('portal.reporting.action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {MOCK_HISTORY.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-zinc-900 dark:text-white">
                      {row.reportType}
                    </td>
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">
                      {row.generatedDate}
                    </td>
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">{row.period}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses(row.status)}`}
                      >
                        {row.status === 'Sent' && <CheckCircle2 className="w-3 h-3" />}
                        {row.status === 'Pending' && <RefreshCw className="w-3 h-3" />}
                        {row.status === 'Failed' && <AlertTriangle className="w-3 h-3" />}
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">{row.size}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleResend(row.id)}
                        disabled={resendingId === row.id}
                        className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 disabled:opacity-60 text-sm font-semibold transition-colors"
                      >
                        {resendingId === row.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {t('portal.reporting.sending')}
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            {t('portal.reporting.resend')}
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
