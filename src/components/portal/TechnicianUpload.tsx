import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Project } from '@/types';
import { ProjectStatus } from '@/types/domain';
import {
  Upload,
  Camera,
  X,
  CheckCircle2,
  AlertTriangle,
  Image,
  Trash2,
  Play,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TechnicianUploadProps {
  projects: Project[];
  onUploadComplete?: (projectId: string, fileCount: number) => void;
}

type UploadState = 'idle' | 'queued' | 'uploading' | 'complete';

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getQualityEstimate(count: number): { labelKey: string; color: string } {
  if (count > 60) {
    return { labelKey: 'techUpload.qualityHigh', color: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (count >= 30) {
    return { labelKey: 'techUpload.qualityMedium', color: 'text-yellow-600 dark:text-yellow-400' };
  }
  return { labelKey: 'techUpload.qualityLow', color: 'text-red-500 dark:text-red-400' };
}

function estimateProcessingTime(count: number): string {
  const minutes = Math.max(5, Math.round(count * 0.12));
  return `~${minutes} min`;
}

const ELIGIBLE_STATUSES: ProjectStatus[] = [
  ProjectStatus.Assigned,
  ProjectStatus.Captured,
  ProjectStatus.Approved,
  ProjectStatus.Processing,
];

const UPLOAD_TIPS = [
  { icon: Camera, textKey: 'techUpload.tip1' },
  { icon: Image, textKey: 'techUpload.tip2' },
  { icon: CheckCircle2, textKey: 'techUpload.tip3' },
  { icon: AlertTriangle, textKey: 'techUpload.tip4' },
  { icon: Info, textKey: 'techUpload.tip5' },
];

export const TechnicianUpload: React.FC<TechnicianUploadProps> = ({
  projects,
  onUploadComplete,
}) => {
  const { t } = useTranslation();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const eligibleProjects = projects.filter((p) => ELIGIBLE_STATUSES.includes(p.status));

  const selectedProject = eligibleProjects.find((p) => p.id === selectedProjectId);

  const totalSize = queuedFiles.reduce((sum, qf) => sum + qf.file.size, 0);
  const quality = getQualityEstimate(queuedFiles.length);

  // Cleanup preview URLs and upload timer on unmount
  useEffect(() => {
    return () => {
      queuedFiles.forEach((qf) => URL.revokeObjectURL(qf.previewUrl));
      if (uploadTimerRef.current) {
        clearTimeout(uploadTimerRef.current);
      }
    };
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((f) => f.type.startsWith('image/'));

    const newQueued: QueuedFile[] = imageFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setQueuedFiles((prev) => [...prev, ...newQueued]);
    if (newQueued.length > 0) {
      setUploadState('queued');
    }
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setQueuedFiles((prev) => {
      const target = prev.find((qf) => qf.id === fileId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const next = prev.filter((qf) => qf.id !== fileId);
      if (next.length === 0) {
        setUploadState('idle');
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    queuedFiles.forEach((qf) => URL.revokeObjectURL(qf.previewUrl));
    setQueuedFiles([]);
    setUploadState('idle');
  }, [queuedFiles]);

  const startUpload = useCallback(() => {
    if (queuedFiles.length === 0 || !selectedProjectId) return;

    setUploadState('uploading');
    setUploadProgress(0);
    setCurrentFileName(queuedFiles[0].file.name);

    const simulateProgress = (current: number) => {
      if (current >= 100) {
        setUploadProgress(100);
        setUploadState('complete');
        setCurrentFileName('');
        onUploadComplete?.(selectedProjectId, queuedFiles.length);
        return;
      }

      const increment = Math.floor(Math.random() * 11) + 5; // 5-15%
      const next = Math.min(current + increment, 100);
      setUploadProgress(next);

      // Pick a file name that corresponds to the progress
      const fileIndex = Math.min(
        Math.floor((next / 100) * queuedFiles.length),
        queuedFiles.length - 1
      );
      setCurrentFileName(queuedFiles[fileIndex].file.name);

      uploadTimerRef.current = setTimeout(() => simulateProgress(next), 300);
    };

    uploadTimerRef.current = setTimeout(() => simulateProgress(0), 300);
  }, [queuedFiles, selectedProjectId, onUploadComplete]);

  const resetUpload = useCallback(() => {
    queuedFiles.forEach((qf) => URL.revokeObjectURL(qf.previewUrl));
    setQueuedFiles([]);
    setUploadState('idle');
    setUploadProgress(0);
    setCurrentFileName('');
  }, [queuedFiles]);

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

      if (uploadState === 'uploading') return;

      try {
        const { files } = e.dataTransfer;
        if (files.length > 0) {
          addFiles(files);
        }
      } catch (err: unknown) {
        if (import.meta.env.DEV) {
          const message = err instanceof Error ? err.message : 'Unknown drag-drop error';
          console.error(`[TechnicianUpload] Drop error: ${message}`);
        }
      }
    },
    [addFiles, uploadState]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        if (e.target.files && e.target.files.length > 0) {
          addFiles(e.target.files);
        }
      } catch (err: unknown) {
        if (import.meta.env.DEV) {
          const message = err instanceof Error ? err.message : 'Unknown file input error';
          console.error(`[TechnicianUpload] File input error: ${message}`);
        }
      }
      // Reset so the same files can be selected again
      e.target.value = '';
    },
    [addFiles]
  );

  const handleDropzoneClick = useCallback(() => {
    if (uploadState !== 'uploading') {
      fileInputRef.current?.click();
    }
  }, [uploadState]);

  // ---- Render ----

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      {/* Header */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <Upload className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {t('techUpload.title')}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('techUpload.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Project Selector */}
        <div>
          <label
            htmlFor="project-select"
            className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2"
          >
            {t('techUpload.selectProject')}
          </label>
          <select
            id="project-select"
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              if (uploadState === 'complete') {
                resetUpload();
              }
            }}
            disabled={uploadState === 'uploading'}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{t('techUpload.chooseProject')}</option>
            {eligibleProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.client}
              </option>
            ))}
          </select>
        </div>

        {/* Empty State: No project selected */}
        {!selectedProjectId && (
          <div className="text-center py-12 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
            <Camera className="w-10 h-10 mx-auto text-zinc-400 dark:text-zinc-500 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('techUpload.noProject')}</p>
          </div>
        )}

        {/* KPI Strip */}
        {selectedProject && queuedFiles.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                {t('techUpload.photosInQueue')}
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {queuedFiles.length}
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                {t('techUpload.estProcessing')}
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {estimateProcessingTime(queuedFiles.length)}
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                {t('techUpload.qualityEstimate')}
              </p>
              <p className={`text-2xl font-bold ${quality.color}`}>{t(quality.labelKey)}</p>
            </div>
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        {selectedProjectId && uploadState !== 'uploading' && uploadState !== 'complete' && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleDropzoneClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDropzoneClick();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:border-brand-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              aria-label="Select photos to upload"
            />
            <Camera
              className={`w-12 h-12 mx-auto mb-4 ${
                isDragOver ? 'text-brand-500' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            />
            <p className="text-base font-semibold text-zinc-900 dark:text-white mb-1">
              {t('techUpload.dragDrop')}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
              {t('techUpload.orBrowse')}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {t('techUpload.acceptedFormats')}
            </p>
          </div>
        )}

        {/* Upload Queue */}
        {uploadState === 'queued' && queuedFiles.length > 0 && (
          <div className="space-y-4">
            {/* Summary Bar */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 py-3">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                <span className="font-semibold">{queuedFiles.length}</span> photo
                {queuedFiles.length !== 1 ? 's' : ''} selected &bull;{' '}
                <span className="font-semibold">{formatFileSize(totalSize)}</span> total
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t('techUpload.removeAll')}
              </button>
            </div>

            {/* Thumbnails Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {queuedFiles.map((qf) => (
                <div key={qf.id} className="group relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <img
                      src={qf.previewUrl}
                      alt={qf.file.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(qf.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                    aria-label={`Remove ${qf.file.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="mt-1">
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                      {qf.file.name}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {formatFileSize(qf.file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Start Processing Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={startUpload}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              >
                <Play className="w-4 h-4" />
                {t('techUpload.uploadAll')}
              </button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadState === 'uploading' && (
          <div className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {t('techUpload.uploading')}
                </p>
                <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                  {uploadProgress}%
                </p>
              </div>
              <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {t('techUpload.uploadingFile')}: {currentFileName}
              </p>
            </div>
          </div>
        )}

        {/* Complete State */}
        {uploadState === 'complete' && (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {t('techUpload.complete')}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {queuedFiles.length} photo{queuedFiles.length !== 1 ? 's' : ''} uploaded
                successfully
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {t('techUpload.processingTime')}
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={resetUpload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              >
                <Upload className="w-4 h-4" />
                {t('techUpload.uploadMore')}
              </button>
            </div>
          </div>
        )}

        {/* Upload Guidelines Panel */}
        {selectedProjectId && (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setGuidelinesOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {t('techUpload.guidelines')}
                </span>
              </div>
              {guidelinesOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>
            {guidelinesOpen && (
              <div className="px-4 py-4 space-y-3 bg-white dark:bg-zinc-900">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  {t('techUpload.tipsTitle')}
                </p>
                <ul className="space-y-2.5">
                  {UPLOAD_TIPS.map((tip) => {
                    const TipIcon = tip.icon;
                    return (
                      <li
                        key={tip.textKey}
                        className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        <TipIcon className="w-4 h-4 text-brand-500 dark:text-brand-400 flex-shrink-0" />
                        {t(tip.textKey)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
