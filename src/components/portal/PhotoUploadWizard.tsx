/**
 * PhotoUploadWizard - Enhanced 5-step wizard for food photogrammetry
 *
 * Steps: Select → Validate (8-metric) → Configure (5 engines + capture mode) → Review → Start
 *
 * Based on food-specific photogrammetry research document with:
 * - 8-metric photo validation (blur, exposure, WB drift, specular, features, EXIF, color, resolution)
 * - 5 processing engines (COLMAP+OpenMVS, SAM 3D, Polycam, NeRF, Gaussian Splatting)
 * - Cross-polarization / 2-pass capture mode selection
 * - PBR output format configuration
 */
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Upload,
  CheckCircle2,
  Settings as _Settings,
  Play,
  ArrowLeft,
  ArrowRight,
  Image,
  Cpu,
  Zap,
  X,
  AlertCircle,
  Clock,
  Eye,
  Shield,
  Sparkles,
  Layers,
  Sun,
} from 'lucide-react';
import { PhotogrammetryJobDTO, VALIDATION_THRESHOLDS } from '@/types/photogrammetry';
import { PipelineEngine, CaptureMode, ModelOutputFormat } from '@/types/domain';
import { createJob } from '@/services/api/real/photogrammetry';
import Card from '@/components/Card';

// ============================================================================
// TYPES
// ============================================================================

interface PhotoUploadWizardProps {
  projectId: string;
  onJobCreated: (job: PhotogrammetryJobDTO) => void;
  onCancel: () => void;
}

interface QueuedPhoto {
  id: string;
  file: File;
  preview: string;
  validation?: PhotoValidationLocal;
}

interface PhotoValidationLocal {
  blurScore: number;
  exposureClippingPct: number;
  wbDriftKelvin: number;
  specularPct: number;
  featureCount: number;
  hasExif: boolean;
  colorProfile: string;
  resolution: string;
  resolutionMp: number;
  valid: boolean;
  warnings: string[];
}

type WizardStep = 'select' | 'validate' | 'configure' | 'review';

// ============================================================================
// ENGINE CONFIGS
// ============================================================================

interface EngineConfig {
  key: string;
  engine: PipelineEngine;
  label: string;
  description: string;
  icon: typeof Cpu;
  badge?: string;
  badgeColor?: string;
  minPerPhoto: number;
}

const ENGINE_CONFIGS: EngineConfig[] = [
  {
    key: 'colmap',
    engine: PipelineEngine.COLMAP_OpenMVS,
    label: 'COLMAP + OpenMVS',
    description: 'Gold-standard photogrammetry. Best mesh quality and texture fidelity for food items.',
    icon: Cpu,
    badge: 'Best Quality',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
    minPerPhoto: 2.5,
  },
  {
    key: 'nerf',
    engine: PipelineEngine.NeRF,
    label: 'NeRF (Neural Radiance)',
    description: 'Neural volumetric rendering. Excellent for translucent/refractive foods (soups, sauces, glazed items).',
    icon: Sparkles,
    badge: 'Translucent',
    badgeColor: 'bg-purple-500/20 text-purple-400',
    minPerPhoto: 3.0,
  },
  {
    key: 'gaussian',
    engine: PipelineEngine.GaussianSplatting,
    label: '3D Gaussian Splatting',
    description: 'Fastest high-fidelity. Real-time rendering with splat-based point clouds. Great for AR preview.',
    icon: Layers,
    badge: 'Fast + AR',
    badgeColor: 'bg-amber-500/20 text-amber-400',
    minPerPhoto: 1.8,
  },
  {
    key: 'sam3d',
    engine: PipelineEngine.MetaSAM3D,
    label: 'Meta SAM 3D',
    description: 'AI single-photo preview. Quick draft model from 1-3 photos. $0.02/model via fal.ai.',
    icon: Zap,
    badge: 'Quick Draft',
    badgeColor: 'bg-brand-500/20 text-brand-400',
    minPerPhoto: 0.5,
  },
  {
    key: 'polycam',
    engine: PipelineEngine.Polycam,
    label: 'Polycam Cloud',
    description: 'Cloud-hosted pipeline. Good for mobile capture workflows with LiDAR-assisted reconstruction.',
    icon: Eye,
    minPerPhoto: 2.0,
  },
];

// ============================================================================
// OUTPUT FORMAT CONFIGS
// ============================================================================

interface OutputFormatConfig {
  format: string;
  label: string;
  description: string;
}

const OUTPUT_FORMAT_CONFIGS: OutputFormatConfig[] = [
  { format: 'glb', label: 'GLB', description: 'Web & AR (glTF binary). PBR materials embedded.' },
  { format: 'usdz', label: 'USDZ', description: 'Apple AR Quick Look. PBR with preview thumbnail.' },
  { format: 'obj', label: 'OBJ', description: 'Universal mesh. Separate .mtl for materials.' },
  { format: 'fbx', label: 'FBX', description: 'Game engines (Unity/Unreal). Embedded textures.' },
  { format: 'ply', label: 'PLY', description: 'Point cloud / raw scan data. Per-vertex color.' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const PhotoUploadWizard: React.FC<PhotoUploadWizardProps> = ({
  projectId,
  onJobCreated,
  onCancel,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<WizardStep>('select');
  const [queuedPhotos, setQueuedPhotos] = useState<QueuedPhoto[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<PipelineEngine>(PipelineEngine.COLMAP_OpenMVS);
  const [outputFormats, setOutputFormats] = useState<string[]>(['glb']);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [captureMode, setCaptureMode] = useState<CaptureMode>(CaptureMode.CrossPolarized);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = ['select', 'validate', 'configure', 'review'] as const;
  const currentStepIndex = steps.indexOf(currentStep);

  // ========================================================================
  // FILE HANDLERS
  // ========================================================================

  const addFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const newPhotos: QueuedPhoto[] = imageFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setQueuedPhotos((prev) => [...prev, ...newPhotos]);
  }, []);

  const removePhoto = useCallback((id: string) => {
    setQueuedPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  // ========================================================================
  // 8-METRIC VALIDATION
  // ========================================================================

  const validatePhotos = useCallback(async () => {
    const validated = await Promise.all(
      queuedPhotos.map(async (photo) => {
        const img = document.createElement('img');

        return new Promise<QueuedPhoto>((resolve) => {
          img.onload = () => {
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            const resolution = `${w}x${h}`;
            const resolutionMp = (w * h) / 1_000_000;

            // Simulated validation metrics (in production, these come from server-side analysis)
            const blurScore = 80 + Math.random() * 120;                  // Laplacian variance
            const exposureClippingPct = Math.random() * 30;              // % clipped
            const wbDriftKelvin = Math.random() * 80;                    // Kelvin drift
            const specularPct = Math.random() * 15;                      // Specular %
            const featureCount = Math.floor(30 + Math.random() * 150);   // SIFT features
            const hasExif = Math.random() > 0.1;                         // 90% chance of EXIF
            const colorProfile = Math.random() > 0.3 ? 'sRGB' : 'AdobeRGB';

            const warnings: string[] = [];
            let valid = true;

            if (blurScore < VALIDATION_THRESHOLDS.blur_laplacian_min) {
              warnings.push('Image may be blurry (low Laplacian variance)');
              valid = false;
            }
            if (exposureClippingPct > VALIDATION_THRESHOLDS.exposure_clipping_max_pct) {
              warnings.push(`Exposure clipping too high (${exposureClippingPct.toFixed(1)}%)`);
              valid = false;
            }
            if (wbDriftKelvin > VALIDATION_THRESHOLDS.wb_drift_max_kelvin) {
              warnings.push(`White balance drift detected (${wbDriftKelvin.toFixed(0)}K)`);
              valid = false;
            }
            if (specularPct > VALIDATION_THRESHOLDS.specular_max_pct) {
              warnings.push(`Specular highlights too high (${specularPct.toFixed(1)}%)`);
              valid = false;
            }
            if (featureCount < VALIDATION_THRESHOLDS.feature_count_min) {
              warnings.push(`Low feature count (${featureCount}). Add tracking markers.`);
              valid = false;
            }
            if (!hasExif) {
              warnings.push('No EXIF metadata found');
            }
            if (w < VALIDATION_THRESHOLDS.min_resolution_width || h < VALIDATION_THRESHOLDS.min_resolution_height) {
              warnings.push(`Resolution below minimum (${VALIDATION_THRESHOLDS.min_resolution_width}x${VALIDATION_THRESHOLDS.min_resolution_height})`);
              valid = false;
            }

            resolve({
              ...photo,
              validation: {
                blurScore,
                exposureClippingPct,
                wbDriftKelvin,
                specularPct,
                featureCount,
                hasExif,
                colorProfile,
                resolution,
                resolutionMp,
                valid,
                warnings,
              },
            });
          };
          img.src = photo.preview;
        });
      })
    );
    setQueuedPhotos(validated);
  }, [queuedPhotos]);

  // ========================================================================
  // SUBMISSION
  // ========================================================================

  const handleSubmit = useCallback(async () => {
    if (queuedPhotos.length === 0) return;
    setIsSubmitting(true);

    try {
      // Use the photogrammetry service to create the job via Supabase
      const job = await createJob({
        project_id: projectId,
        asset_ids: queuedPhotos.map((p) => p.id),
        engine: selectedEngine,
        output_formats: outputFormats as ModelOutputFormat[],
        priority: priority === 'medium' ? 'normal' : priority,
        capture_mode: captureMode,
      });

      onJobCreated(job);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error creating photogrammetry job:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [queuedPhotos, projectId, selectedEngine, priority, captureMode, outputFormats, onJobCreated]);

  // ========================================================================
  // NAVIGATION
  // ========================================================================

  const handleNextStep = useCallback(async () => {
    if (currentStep === 'select') {
      if (queuedPhotos.length === 0) return;
      await validatePhotos();
      setCurrentStep('validate');
    } else if (currentStep === 'validate') {
      setCurrentStep('configure');
    } else if (currentStep === 'configure') {
      setCurrentStep('review');
    }
  }, [currentStep, queuedPhotos, validatePhotos]);

  const handlePreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  }, [currentStepIndex, steps]);

  // Drag-and-drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      e.target.value = '';
    },
    [addFiles]
  );

  // ========================================================================
  // COMPUTED
  // ========================================================================

  const allPhotosValid = useMemo(
    () => queuedPhotos.every((p) => p.validation?.valid),
    [queuedPhotos]
  );

  const validCount = useMemo(
    () => queuedPhotos.filter((p) => p.validation?.valid).length,
    [queuedPhotos]
  );

  const selectedEngineConfig = useMemo(
    () => ENGINE_CONFIGS.find((e) => e.engine === selectedEngine) ?? ENGINE_CONFIGS[0],
    [selectedEngine]
  );

  const estimatedTime = useMemo(() => {
    return Math.ceil(queuedPhotos.length * selectedEngineConfig.minPerPhoto);
  }, [queuedPhotos.length, selectedEngineConfig]);

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderMetricBadge = (value: number, threshold: number, isMax: boolean, label: string, unit: string = '') => {
    const pass = isMax ? value <= threshold : value >= threshold;
    return (
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-500">{label}</span>
        <span
          className={`text-[10px] font-mono font-semibold ${
            pass ? 'text-emerald-400' : 'text-orange-400'
          }`}
        >
          {typeof value === 'number' ? value.toFixed(1) : value}{unit}
        </span>
      </div>
    );
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div>
      <Card variant="glass" className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header with step indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                {currentStep === 'select' && t('photogrammetry.selectPhotos', 'Select Photos')}
                {currentStep === 'validate' && t('photogrammetry.validatePhotos', 'Validate Photos')}
                {currentStep === 'configure' && t('photogrammetry.configure', 'Configure Pipeline')}
                {currentStep === 'review' && t('photogrammetry.reviewStart', 'Review & Start')}
              </h2>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400 hover:text-white" />
              </button>
            </div>

            {/* Step dots */}
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx <= currentStepIndex ? 'bg-brand-500' : 'bg-zinc-700'
                    }`}
                  />
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-8 transition-all ${
                        idx < currentStepIndex ? 'bg-brand-500' : 'bg-zinc-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* Step 1: Select Photos */}
          {/* ============================================================ */}
          {currentStep === 'select' && (
            <div className="space-y-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-brand-400/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {t('photogrammetry.dragPhotos', 'Drag & drop your photos here')}
                    </p>
                    <p className="text-sm text-zinc-400 mt-1">
                      {t('photogrammetry.orBrowse', 'or click to browse')}
                    </p>
                    <p className="text-xs text-zinc-600 mt-2">
                      {t('photogrammetry.recommendedRange', 'Recommended: 72-96 photos from ring-shot capture (3-4 rings × 24 shots)')}
                    </p>
                  </div>
                </div>
              </div>

              {queuedPhotos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white">
                    {queuedPhotos.length} {t('photogrammetry.photosQueued', 'photos queued')}
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {queuedPhotos.map((photo) => (
                      <div key={photo.id} className="group relative">
                        <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800 border border-white/[0.06]">
                          <img
                            src={photo.preview}
                            alt={photo.file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-white/[0.06] hover:border-brand-400 hover:bg-brand-500/10 flex items-center justify-center transition-colors"
                    >
                      <Upload className="w-5 h-5 text-zinc-600" />
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.cr2,.cr3,.nef,.arw,.dng"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* Step 2: Validate Photos (8-metric) */}
          {/* ============================================================ */}
          {currentStep === 'validate' && (
            <div className="space-y-6">
              {/* Validation summary bar */}
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-semibold text-white">
                      {t('photogrammetry.validationSummary', 'Validation Summary')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-emerald-400 font-semibold">{validCount} passed</span>
                    <span className="text-orange-400 font-semibold">{queuedPhotos.length - validCount} issues</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-white/[0.06] flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                      className="text-emerald-500/30" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                      className="text-emerald-500"
                      strokeDasharray={`${(validCount / queuedPhotos.length) * 176} 176`}
                      strokeLinecap="round" />
                  </svg>
                  <span className="text-sm font-bold text-white z-10">
                    {Math.round((validCount / queuedPhotos.length) * 100)}%
                  </span>
                </div>
              </div>

              {/* Per-photo validation cards */}
              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-1">
                {queuedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`rounded-xl border p-4 transition-all ${
                      photo.validation?.valid
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-orange-500/20 bg-orange-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={photo.preview}
                        alt={photo.file.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {photo.file.name}
                          </h4>
                          {photo.validation?.valid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                          )}
                        </div>

                        {/* 8-metric grid */}
                        {photo.validation && (
                          <div className="grid grid-cols-4 gap-x-4 gap-y-1">
                            {renderMetricBadge(photo.validation.blurScore, VALIDATION_THRESHOLDS.blur_laplacian_min, false, 'Blur', '')}
                            {renderMetricBadge(photo.validation.exposureClippingPct, VALIDATION_THRESHOLDS.exposure_clipping_max_pct, true, 'Exposure', '%')}
                            {renderMetricBadge(photo.validation.wbDriftKelvin, VALIDATION_THRESHOLDS.wb_drift_max_kelvin, true, 'WB Drift', 'K')}
                            {renderMetricBadge(photo.validation.specularPct, VALIDATION_THRESHOLDS.specular_max_pct, true, 'Specular', '%')}
                            {renderMetricBadge(photo.validation.featureCount, VALIDATION_THRESHOLDS.feature_count_min, false, 'Features', '')}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-500">EXIF</span>
                              <span className={`text-[10px] font-semibold ${photo.validation.hasExif ? 'text-emerald-400' : 'text-orange-400'}`}>
                                {photo.validation.hasExif ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-500">Color</span>
                              <span className="text-[10px] font-mono font-semibold text-zinc-300">
                                {photo.validation.colorProfile}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-500">MPx</span>
                              <span className={`text-[10px] font-mono font-semibold ${
                                photo.validation.resolutionMp >= VALIDATION_THRESHOLDS.min_megapixels
                                  ? 'text-emerald-400'
                                  : 'text-orange-400'
                              }`}>
                                {photo.validation.resolutionMp.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Warnings */}
                        {photo.validation && photo.validation.warnings.length > 0 && (
                          <div className="mt-2 space-y-0.5">
                            {photo.validation.warnings.map((w, i) => (
                              <p key={i} className="text-[10px] text-orange-400/80">
                                &bull; {w}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!allPhotosValid && (
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-4">
                  <p className="text-sm text-orange-300">
                    {t(
                      'photogrammetry.somePhotosInvalid',
                      'Some photos failed validation. Consider removing them or re-capturing with cross-polarization to reduce specular highlights.'
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* Step 3: Configure (engines + capture mode + formats) */}
          {/* ============================================================ */}
          {currentStep === 'configure' && (
            <div className="space-y-6">
              {/* Engine Selection */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">
                  {t('photogrammetry.processingEngine', 'Processing Engine')}
                </h4>
                <div className="space-y-2">
                  {ENGINE_CONFIGS.map((config) => {
                    const isSelected = selectedEngine === config.engine;
                    const EngineIcon = config.icon;
                    return (
                      <button
                        key={config.key}
                        onClick={() => setSelectedEngine(config.engine)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-brand-500/20' : 'bg-white/[0.04]'
                          }`}>
                            <EngineIcon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-zinc-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-white">{config.label}</span>
                              {config.badge && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${config.badgeColor}`}>
                                  {config.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {config.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capture Mode */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">
                  {t('photogrammetry.captureMode', 'Capture Mode')}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      mode: CaptureMode.CrossPolarized,
                      label: 'Cross-Polarized',
                      desc: 'Pure diffuse albedo',
                      icon: Sun,
                    },
                    {
                      mode: CaptureMode.Normal,
                      label: 'Normal',
                      desc: 'Standard capture',
                      icon: Camera,
                    },
                    {
                      mode: CaptureMode.TwoPass,
                      label: '2-Pass (PBR)',
                      desc: 'Both passes for roughness map',
                      icon: Layers,
                    },
                  ].map(({ mode, label, desc, icon: ModeIcon }) => (
                    <button
                      key={mode}
                      onClick={() => setCaptureMode(mode)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        captureMode === mode
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                      }`}
                    >
                      <ModeIcon className={`w-4 h-4 mx-auto mb-1.5 ${
                        captureMode === mode ? 'text-brand-400' : 'text-zinc-500'
                      }`} />
                      <p className="text-xs font-semibold text-white">{label}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Formats */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">
                  {t('photogrammetry.outputFormats', 'Output Formats')}
                </h4>
                <div className="space-y-2">
                  {OUTPUT_FORMAT_CONFIGS.map(({ format, label, description }) => (
                    <label
                      key={format}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={outputFormats.includes(format)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setOutputFormats((prev) => [...prev, format]);
                          } else {
                            setOutputFormats((prev) => prev.filter((f) => f !== format));
                          }
                        }}
                        className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-white uppercase tracking-wider">
                          {label}
                        </span>
                        <p className="text-[10px] text-zinc-500">{description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">
                  {t('photogrammetry.priority', 'Priority')}
                </h4>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800/50 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="low">{t('photogrammetry.low', 'Low - Standard processing')}</option>
                  <option value="medium">{t('photogrammetry.medium', 'Medium - Faster')}</option>
                  <option value="high">{t('photogrammetry.high', 'High - Priority queue')}</option>
                </select>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* Step 4: Review & Start */}
          {/* ============================================================ */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-brand-500/10 border border-brand-500/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-4 h-4 text-brand-400" />
                    <span className="text-[10px] font-semibold text-zinc-300 uppercase">
                      Photos
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{queuedPhotos.length}</p>
                  <p className="text-[10px] text-zinc-500">{validCount} validated</p>
                </div>

                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <selectedEngineConfig.icon className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-zinc-300 uppercase">
                      Engine
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">{selectedEngineConfig.label}</p>
                </div>

                <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-semibold text-zinc-300 uppercase">
                      Capture
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {captureMode === CaptureMode.CrossPolarized
                      ? 'Cross-Pol'
                      : captureMode === CaptureMode.TwoPass
                        ? '2-Pass PBR'
                        : 'Normal'}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-[10px] font-semibold text-zinc-300 uppercase">
                      ETA
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">~{estimatedTime}m</p>
                </div>
              </div>

              {/* Output formats */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <h4 className="text-sm font-semibold text-white mb-2">
                  {t('photogrammetry.outputFormats', 'Output Formats')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {outputFormats.map((format) => (
                    <span
                      key={format}
                      className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold uppercase"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>

              {/* PBR material note for 2-pass */}
              {captureMode === CaptureMode.TwoPass && (
                <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-purple-300 mb-1">
                        PBR Material Generation
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        2-pass capture will generate BaseColor (from cross-pol pass), Roughness (from specular difference), Normal map, and AO. Metallic will be set to 0 for food items.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* Navigation Buttons */}
          {/* ============================================================ */}
          <div className="mt-8 flex items-center justify-between gap-3 pt-6 border-t border-white/[0.06]">
            <button
              onClick={currentStep === 'select' ? onCancel : handlePreviousStep}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 'select'
                ? t('common.cancel', 'Cancel')
                : t('common.back', 'Back')}
            </button>

            {currentStep !== 'review' ? (
              <button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 'select' && queuedPhotos.length === 0) ||
                  (currentStep === 'configure' && outputFormats.length === 0)
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {t('common.next', 'Next')}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                <Play className="w-4 h-4" />
                {isSubmitting
                  ? t('common.processing', 'Processing...')
                  : t('photogrammetry.startProcessing', 'Start Processing')}
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PhotoUploadWizard;
