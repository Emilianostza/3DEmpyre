/**
 * ProcessingStatus - Enhanced real-time photogrammetry job status tracker
 *
 * Displays processing steps timeline, PBR texture channel previews,
 * mesh quality metrics (triangle count, texel density), and validation summary.
 *
 * Based on food-specific photogrammetry research document.
 */
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  X,
  Clock,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Box,
  Layers,
  Palette,
  Grid3X3,
  BarChart3,
  Eye,
  Shield,
  Download,
} from 'lucide-react';
import type { PhotogrammetryJobDTO, ProcessingStepDTO, PBRChannelInfo as _PBRChannelInfo } from '@/types/photogrammetry';
import { PhotogrammetryJobStatus, CaptureMode } from '@/types/domain';

// ============================================================================
// TYPES
// ============================================================================

interface ProcessingStatusProps {
  job: PhotogrammetryJobDTO;
  steps: ProcessingStepDTO[];
}

// ============================================================================
// HELPERS
// ============================================================================

function formatTriangleCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return String(count);
}

function getPBRChannelColor(channel: string): string {
  switch (channel) {
    case 'base_color': return 'text-rose-400';
    case 'roughness': return 'text-zinc-300';
    case 'normal': return 'text-blue-400';
    case 'ao': return 'text-amber-400';
    case 'metallic': return 'text-slate-400';
    case 'height': return 'text-emerald-400';
    default: return 'text-zinc-400';
  }
}

function getPBRChannelBg(channel: string): string {
  switch (channel) {
    case 'base_color': return 'bg-rose-500/10 border-rose-500/20';
    case 'roughness': return 'bg-zinc-500/10 border-zinc-500/20';
    case 'normal': return 'bg-blue-500/10 border-blue-500/20';
    case 'ao': return 'bg-amber-500/10 border-amber-500/20';
    case 'metallic': return 'bg-slate-500/10 border-slate-500/20';
    case 'height': return 'bg-emerald-500/10 border-emerald-500/20';
    default: return 'bg-zinc-500/10 border-zinc-500/20';
  }
}

function formatChannelName(channel: string): string {
  switch (channel) {
    case 'base_color': return 'BaseColor';
    case 'roughness': return 'Roughness';
    case 'normal': return 'Normal';
    case 'ao': return 'Ambient Occlusion';
    case 'metallic': return 'Metallic';
    case 'height': return 'Height';
    default: return channel;
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  job,
  steps,
}) => {
  const { t } = useTranslation();

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (steps.length === 0) return 0;
    const completed = steps.filter((s) => s.status === 'completed').length;
    return Math.round((completed / steps.length) * 100);
  }, [steps]);

  // Estimate remaining time
  const estimatedTimeRemaining = useMemo(() => {
    if (job.estimated_duration_seconds && job.processing_started_at) {
      const startedAt = new Date(job.processing_started_at).getTime();
      if (Number.isNaN(startedAt)) return null;
      const elapsed = (Date.now() - startedAt) / 1000;
      const remaining = job.estimated_duration_seconds - elapsed;
      if (remaining > 0) {
        return Math.ceil(remaining / 60);
      }
    }
    return null;
  }, [job.estimated_duration_seconds, job.processing_started_at]);

  const isActiveProcessing =
    job.status !== PhotogrammetryJobStatus.Completed &&
    job.status !== PhotogrammetryJobStatus.Failed &&
    job.status !== PhotogrammetryJobStatus.Cancelled &&
    job.status !== PhotogrammetryJobStatus.Queued &&
    job.status !== PhotogrammetryJobStatus.QAPending;

  const handleRetry = () => {
    if (import.meta.env.DEV) console.warn('[ProcessingStatus] Retry job:', job.id);
  };

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* Header with Job Info */}
      {/* ================================================================ */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              Job #{job.id.slice(0, 8)}
            </h3>
            <p className="text-sm text-zinc-400">
              {t('photogrammetry.processingJob', 'Processing photogrammetry job')} &middot; {t('pipeline.photos', { count: job.total_photos })}
            </p>
          </div>
          {/* Capture mode badge */}
          {job.capture_mode && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
              job.capture_mode === CaptureMode.TwoPass
                ? 'bg-purple-500/20 text-purple-400'
                : job.capture_mode === CaptureMode.CrossPolarized
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-zinc-500/20 text-zinc-400'
            }`}>
              {job.capture_mode === CaptureMode.TwoPass
                ? t('photogrammetry.captureMode.twoPass', '2-Pass PBR')
                : job.capture_mode === CaptureMode.CrossPolarized
                  ? t('photogrammetry.captureMode.crossPolarized', 'Cross-Polarized')
                  : t('photogrammetry.captureMode.normal', 'Normal Capture')}
            </span>
          )}
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              {t('photogrammetry.overallProgress', 'Overall Progress')}
            </span>
            <span className="text-sm font-bold text-brand-400">{overallProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {estimatedTimeRemaining !== null && isActiveProcessing && (
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-400">
                {t('photogrammetry.estimatedTime', 'Estimated time remaining')}: ~{estimatedTimeRemaining}m
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* Mesh & Quality Metrics (shown when completed or has data) */}
      {/* ================================================================ */}
      {(job.mesh_triangle_count !== null && job.mesh_triangle_count !== undefined) ||
       (job.texel_density_ppmm !== null && job.texel_density_ppmm !== undefined) ||
       job.texture_resolution ? (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" />
            {t('photogrammetry.meshQuality', 'Mesh & Quality Metrics')}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Triangle Count */}
            {job.mesh_triangle_count !== null && job.mesh_triangle_count !== undefined && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Grid3X3 className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500">{t('photogrammetry.triangles', 'Triangles')}</span>
                </div>
                <p className="text-lg font-bold text-white">
                  {formatTriangleCount(job.mesh_triangle_count)}
                </p>
              </div>
            )}

            {/* Texel Density */}
            {job.texel_density_ppmm !== null && job.texel_density_ppmm !== undefined && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Eye className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500">{t('photogrammetry.texelDensity', 'Texel Density')}</span>
                </div>
                <p className="text-lg font-bold text-white">
                  {job.texel_density_ppmm.toFixed(1)} <span className="text-xs text-zinc-500">px/mm</span>
                </p>
              </div>
            )}

            {/* Texture Resolution */}
            {job.texture_resolution && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Palette className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500">{t('photogrammetry.textureRes', 'Texture Res')}</span>
                </div>
                <p className="text-lg font-bold text-white font-mono">
                  {job.texture_resolution}
                </p>
              </div>
            )}

            {/* Quality Score */}
            {job.quality_score !== null && job.quality_score !== undefined && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500">{t('photogrammetry.qaScore', 'QA Score')}</span>
                </div>
                <p className={`text-lg font-bold ${
                  job.quality_score >= 80
                    ? 'text-emerald-400'
                    : job.quality_score >= 60
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}>
                  {job.quality_score}<span className="text-xs text-zinc-500">/100</span>
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ================================================================ */}
      {/* PBR Texture Channels (shown when available) */}
      {/* ================================================================ */}
      {job.pbr_channels && job.pbr_channels.length > 0 && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            {t('photogrammetry.pbrChannels', 'PBR Material Channels')}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {job.pbr_channels.map((channel) => (
              <div
                key={channel.channel}
                className={`rounded-xl border p-3 ${getPBRChannelBg(channel.channel)}`}
              >
                {/* Channel preview placeholder */}
                <div className="w-full aspect-square rounded-lg bg-zinc-800/50 mb-2 flex items-center justify-center">
                  <Box className={`w-8 h-8 ${getPBRChannelColor(channel.channel)} opacity-50`} />
                </div>
                <div>
                  <p className={`text-xs font-semibold ${getPBRChannelColor(channel.channel)}`}>
                    {formatChannelName(channel.channel)}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-mono text-zinc-500">
                      {channel.resolution}
                    </span>
                    <span className="text-[10px] text-zinc-600 uppercase">
                      {channel.color_space}
                    </span>
                  </div>
                  {channel.file_size_bytes !== null && channel.file_size_bytes !== undefined && (
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      {formatBytes(channel.file_size_bytes)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* Validation Summary (if available) */}
      {/* ================================================================ */}
      {job.validation_summary && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            {t('photogrammetry.validationSummary', 'Input Validation Summary')}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <p className="text-lg font-bold text-emerald-400">{job.validation_summary.passed}</p>
              <p className="text-[10px] text-zinc-500">{t('photogrammetry.passed', 'Passed')}</p>
            </div>
            <div className="rounded-lg bg-red-500/10 p-3">
              <p className="text-lg font-bold text-red-400">{job.validation_summary.failed}</p>
              <p className="text-[10px] text-zinc-500">{t('photogrammetry.failed', 'Failed')}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-lg font-bold text-zinc-300">{job.validation_summary.avg_blur_score.toFixed(0)}</p>
              <p className="text-[10px] text-zinc-500">{t('photogrammetry.avgBlur', 'Avg Blur')}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-lg font-bold text-zinc-300">{job.validation_summary.avg_feature_count.toFixed(0)}</p>
              <p className="text-[10px] text-zinc-500">{t('photogrammetry.avgFeatures', 'Avg Features')}</p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* Processing Steps Timeline */}
      {/* ================================================================ */}
      {steps.length > 0 && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            {t('photogrammetry.processingSteps', 'Processing Steps')}
          </h4>

          <div className="relative pl-8 space-y-4">
            {steps.map((step, index) => {
              const isPending = step.status === 'pending';
              const isRunning = step.status === 'running';
              const isCompleted = step.status === 'completed';
              const isFailed = step.status === 'failed';

              let durationStr: string | null = null;
              if (step.started_at && step.completed_at) {
                const dur = (new Date(step.completed_at).getTime() - new Date(step.started_at).getTime()) / 1000;
                durationStr = dur < 60 ? `${Math.round(dur)}s` : `${Math.round(dur / 60)}m`;
              }

              return (
                <div key={step.id} className="relative">
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-0 top-6 w-0.5 h-12 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isFailed
                            ? 'bg-red-500'
                            : 'bg-zinc-700'
                      }`}
                    />
                  )}

                  <div className="absolute left-0 top-0 w-5 h-5 rounded-full flex items-center justify-center transform -translate-x-2.5 bg-zinc-900 border-2 border-white/[0.06]">
                    {isPending && <div className="w-2 h-2 rounded-full bg-zinc-600" />}
                    {isRunning && <Loader2 className="w-3 h-3 text-brand-400 animate-spin" />}
                    {isCompleted && <Check className="w-3 h-3 text-emerald-500" />}
                    {isFailed && <X className="w-3 h-3 text-red-500" />}
                  </div>

                  <div
                    className={`rounded-lg p-3 backdrop-blur-sm border ${
                      isRunning
                        ? 'bg-brand-500/10 border-brand-500/30 shadow-sm shadow-brand-500/20'
                        : isCompleted
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : isFailed
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-white/[0.02] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-white">
                          {step.step_name}
                        </h5>
                        {step.log_message && (
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                            {step.log_message}
                          </p>
                        )}
                      </div>
                      {durationStr && (
                        <div className="text-xs font-medium text-zinc-500 whitespace-nowrap">
                          {durationStr}
                        </div>
                      )}
                    </div>

                    {isRunning && step.progress_pct > 0 && (
                      <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-300"
                          style={{ width: `${step.progress_pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* Error State */}
      {/* ================================================================ */}
      {job.status === PhotogrammetryJobStatus.Failed && job.processing_error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-300 mb-1">
                {t('photogrammetry.processingFailed', 'Processing Failed')}
              </h4>
              <p className="text-xs text-red-300/80">{job.processing_error}</p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {t('photogrammetry.retryJob', 'Retry Job')}
          </button>
        </div>
      )}

      {/* ================================================================ */}
      {/* Success State */}
      {/* ================================================================ */}
      {job.status === PhotogrammetryJobStatus.Completed && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-300">
                  {t('photogrammetry.processingComplete', 'Processing Complete')}
                </h4>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  {t('photogrammetry.modelReady', 'Your 3D model is ready for download')}
                  {job.quality_score !== null && job.quality_score !== undefined && ` \u2014 Quality: ${job.quality_score}/100`}
                </p>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors">
              <Download className="w-3 h-3" />
              {t('photogrammetry.download', 'Download')}
            </button>
          </div>

          {/* Output formats */}
          {job.output_formats.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.output_formats.map((format) => (
                <span
                  key={format}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold uppercase"
                >
                  {format}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
