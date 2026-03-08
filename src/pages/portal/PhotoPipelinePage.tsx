/**
 * PhotoPipelinePage - Full pipeline management page with capture guide
 *
 * Integrates CaptureGuide, PhotoUploadWizard, and ProcessingStatus.
 * Supports all 5 pipeline engines including NeRF and Gaussian Splatting.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Camera,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  RefreshCw,
  ChevronRight,
  Layers,
  Zap,
  Box,
  Sparkles,
  Eye,
  BookOpen,
} from 'lucide-react';

import { usePhotogrammetryPipeline } from '@/hooks/usePhotogrammetryPipeline';
import { PhotoUploadWizard } from '@/components/portal/PhotoUploadWizard';
import { ProcessingStatus } from '@/components/portal/ProcessingStatus';
import { CaptureGuide } from '@/components/portal/CaptureGuide';
import type { PhotogrammetryJobDTO } from '@/types/photogrammetry';
import { PhotogrammetryJobStatus, PipelineEngine } from '@/types/domain';

// ============================================================================
// HELPERS
// ============================================================================

function getStatusColor(status: PhotogrammetryJobStatus) {
  switch (status) {
    case PhotogrammetryJobStatus.Completed:
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
        border: 'border-emerald-500/20',
      };
    case PhotogrammetryJobStatus.Failed:
    case PhotogrammetryJobStatus.Cancelled:
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        dot: 'bg-red-500',
        border: 'border-red-500/20',
      };
    case PhotogrammetryJobStatus.QAPending:
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
        border: 'border-amber-500/20',
      };
    case PhotogrammetryJobStatus.Queued:
      return {
        bg: 'bg-zinc-500/10',
        text: 'text-zinc-400',
        dot: 'bg-zinc-500',
        border: 'border-zinc-500/20',
      };
    default:
      return {
        bg: 'bg-brand-500/10',
        text: 'text-brand-400',
        dot: 'bg-brand-500 animate-pulse',
        border: 'border-brand-500/20',
      };
  }
}

function getEngineIcon(engine: PipelineEngine) {
  switch (engine) {
    case PipelineEngine.COLMAP_OpenMVS: return Cpu;
    case PipelineEngine.MetaSAM3D: return Zap;
    case PipelineEngine.NeRF: return Sparkles;
    case PipelineEngine.GaussianSplatting: return Layers;
    case PipelineEngine.Polycam: return Eye;
    default: return Cpu;
  }
}

function getEngineLabel(engine: PipelineEngine): string {
  switch (engine) {
    case PipelineEngine.COLMAP_OpenMVS: return 'COLMAP + OpenMVS';
    case PipelineEngine.MetaSAM3D: return 'Meta SAM 3D';
    case PipelineEngine.NeRF: return 'NeRF';
    case PipelineEngine.GaussianSplatting: return 'Gaussian Splatting';
    case PipelineEngine.Polycam: return 'Polycam Cloud';
    default: return engine;
  }
}

const isProcessing = (s: PhotogrammetryJobStatus) =>
  ![
    PhotogrammetryJobStatus.Completed,
    PhotogrammetryJobStatus.Failed,
    PhotogrammetryJobStatus.Cancelled,
    PhotogrammetryJobStatus.Queued,
    PhotogrammetryJobStatus.QAPending,
  ].includes(s);

// ============================================================================
// COMPONENT
// ============================================================================

const PhotoPipelinePage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project') || '';

  const { jobs, activeJob, isLoading, error, fetchJobs, selectJob, addJob } =
    usePhotogrammetryPipeline();

  const [showWizard, setShowWizard] = useState(false);
  const [showCaptureGuide, setShowCaptureGuide] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'failed'>(
    'all'
  );

  useEffect(() => {
    if (projectId) fetchJobs(projectId);
  }, [projectId, fetchJobs]);

  const handleJobCreated = useCallback(
    (job: PhotogrammetryJobDTO) => {
      setShowWizard(false);
      addJob(job);
    },
    [addJob]
  );

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return isProcessing(j.status);
    if (statusFilter === 'completed') return j.status === PhotogrammetryJobStatus.Completed;
    if (statusFilter === 'failed')
      return (
        j.status === PhotogrammetryJobStatus.Failed ||
        j.status === PhotogrammetryJobStatus.Cancelled
      );
    return true;
  });

  // Stats
  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => isProcessing(j.status)).length,
    completed: jobs.filter((j) => j.status === PhotogrammetryJobStatus.Completed).length,
    failed: jobs.filter(
      (j) =>
        j.status === PhotogrammetryJobStatus.Failed ||
        j.status === PhotogrammetryJobStatus.Cancelled
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {t('pipeline.title', '3D Processing Pipeline')}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {t('pipeline.subtitle', 'Upload photos and convert them to 3D models with PBR materials')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCaptureGuide(!showCaptureGuide)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              showCaptureGuide
                ? 'border-brand-500/40 bg-brand-500/10 text-brand-400'
                : 'border-white/[0.06] hover:bg-white/[0.04] text-zinc-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {t('pipeline.captureGuide', 'Capture Guide')}
          </button>
          <button
            onClick={() => setShowWizard(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('pipeline.newJob', 'New 3D Job')}
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: t('pipeline.totalJobs', 'Total Jobs'),
            value: stats.total,
            icon: Layers,
            color: 'text-zinc-300',
          },
          {
            label: t('pipeline.active', 'Processing'),
            value: stats.active,
            icon: Cpu,
            color: 'text-brand-400',
          },
          {
            label: t('pipeline.completed', 'Completed'),
            value: stats.completed,
            icon: CheckCircle2,
            color: 'text-emerald-400',
          },
          {
            label: t('pipeline.failed', 'Failed'),
            value: stats.failed,
            icon: AlertTriangle,
            color: 'text-red-400',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card rounded-xl p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center ${stat.color}`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Capture Guide (toggleable) */}
      {showCaptureGuide && (
        <CaptureGuide variant="full" />
      )}

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <PhotoUploadWizard
              projectId={projectId}
              onJobCreated={handleJobCreated}
              onCancel={() => setShowWizard(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 glass-card rounded-xl p-1">
            {(
              [
                { key: 'all', label: t('pipeline.all', 'All') },
                { key: 'active', label: t('pipeline.active', 'Active') },
                { key: 'completed', label: t('pipeline.done', 'Done') },
                { key: 'failed', label: t('pipeline.failed', 'Failed') },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === tab.key
                    ? 'bg-white/[0.08] text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Job Cards */}
          {isLoading ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-zinc-500">
                {t('common.loading', 'Loading...')}
              </p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-400 mb-1">
                {t('pipeline.noJobs', 'No processing jobs yet')}
              </p>
              <p className="text-xs text-zinc-600">
                {t('pipeline.noJobsHint', 'Upload photos to start your first 3D reconstruction')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredJobs.map((job) => {
                const statusColor = getStatusColor(job.status);
                const isActive = activeJob?.id === job.id;
                const EngineIcon = getEngineIcon(job.engine);

                return (
                  <button
                    key={job.id}
                    onClick={() => selectJob(job.id)}
                    className={`w-full text-left glass-card rounded-xl p-4 transition-all hover:bg-white/[0.04] ${
                      isActive
                        ? 'ring-1 ring-brand-500/40 bg-white/[0.04]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`}
                        />
                        {t(`pipeline.status.${job.status}`, job.status.replace(/_/g, ' '))}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-zinc-600 transition-transform ${
                          isActive ? 'rotate-90 text-brand-400' : ''
                        }`}
                      />
                    </div>
                    <p className="text-sm font-semibold text-white truncate">
                      Job #{job.id.slice(0, 8)}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {t('pipeline.photos', { count: job.total_photos })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <EngineIcon className="w-3 h-3" />
                        {getEngineLabel(job.engine)}
                      </span>
                    </div>
                    {job.processing_started_at && (
                      <p className="text-xs text-zinc-600 mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(job.processing_started_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Job Detail / Processing Status */}
        <div className="lg:col-span-2">
          {activeJob ? (
            <ProcessingStatus
              job={activeJob}
              steps={[]}
            />
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Box className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">
                {t('pipeline.selectJob', 'Select a job to view details')}
              </h3>
              <p className="text-sm text-zinc-600 max-w-sm mx-auto">
                {t(
                  'pipeline.selectJobHint',
                  'Choose a processing job from the list or create a new one to get started'
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 glass-card rounded-xl p-4 border border-red-500/20 max-w-sm">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">
                {t('pipeline.error', 'Pipeline Error')}
              </p>
              <p className="text-xs text-zinc-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoPipelinePage;
