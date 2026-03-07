import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Eye, Layers, Clock, Pencil, Settings, QrCode, Download, X, ImagePlus, Trash2, Code2, Check } from 'lucide-react';
import { QRCodeDisplay } from '@/components/common/QRCodeDisplay';
import type QRCodeStyling from 'qr-code-styling';
import type { Asset, Project } from '@/types';
import { timeAgo } from '@/utils/formatters';
import { MenuSettingsModal } from '@/components/portal/MenuSettingsModal';
import { getStatusConfig } from '@/constants/status-config';

interface Props {
  projects: Project[];
  assets: Asset[];
  onEditProject?: (projectId: string) => void;
}

export const ProjectCards: React.FC<Props> = ({ projects, assets, onEditProject }) => {
  const { t } = useTranslation();
  const [settingsProjectId, setSettingsProjectId] = useState<string | null>(null);
  const [qrCodeProjectId, setQrCodeProjectId] = useState<string | null>(null);
  const [qrTableNumber, setQrTableNumber] = useState<string>('');
  const [qrColor, setQrColor] = useState<string>('#000000');
  const [qrBgColor, setQrBgColor] = useState<string>('#ffffff');
  const [qrDotType, setQrDotType] = useState<string>('square');
  const [qrCornerType, setQrCornerType] = useState<string>('square');
  const [qrArtImage, setQrArtImage] = useState<string | null>(null);
  const [qrInstance, setQrInstance] = useState<QRCodeStyling | null>(null);
  const [embedCopied, setEmbedCopied] = useState(false);
  const qrFileInputRef = React.useRef<HTMLInputElement>(null);
  const [menuSettings, setMenuSettings] = useState<
    Record<
      string,
      { title: string; brandColor: string; font: string; showPrices: boolean; currency: string }
    >
  >({});

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          {t('portal.yourMenus')}
        </h2>
      </div>

      {/* Feature cards grid — 2 columns for prominence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {projects.map((project) => {
          const projectAssets = assets.filter((a) => a.project_id === project.id);
          const itemCount = projectAssets.length;
          const totalViews = projectAssets.reduce((sum, a) => sum + (a.viewCount ?? 0), 0);
          const statusEntry = getStatusConfig(project.status);
          const lastUpdated = timeAgo(project.updated_at ?? project.created_at ?? '');
          const thumbs = projectAssets.filter((a) => a.thumb).slice(0, 3);

          return (
            <div
              key={project.id}
              className="group relative flex flex-col bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-200/50 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-500 ring-1 ring-white/50 dark:ring-white/10"
            >
              {/* Hero section — gradient wash + thumbnails */}
              <div
                className={`relative h-48 md:h-56 bg-gradient-to-br ${statusEntry.gradient} dark:opacity-80 overflow-hidden flex-shrink-0`}
              >
                {/* Decorative pattern overlay */}
                <div
                  className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Asset thumbnails mosaic */}
                {thumbs.length > 0 ? (
                  <div className="absolute inset-0 flex gap-0.5">
                    {thumbs.map((a, _idx) => (
                      <div key={a.id} className="flex-1 relative overflow-hidden">
                        <img
                          src={a.thumb}
                          alt={a.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          loading="lazy"
                        />
                      </div>
                    ))}
                    {/* Gradient fade at the bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Layers className="w-10 h-10 text-zinc-300 dark:text-zinc-700 opacity-50" />
                    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
                      {t('portal.noItemsYet', 'No items captured yet')}
                    </span>
                  </div>
                )}

                {/* Status badge — top-left overlay */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold rounded-full px-3 py-1.5 backdrop-blur-md shadow-sm border border-white/20 dark:border-white/10 ${statusEntry.cls}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusEntry.dotCls}${['in_progress', 'processing', 'qa'].includes(project.status) ? ' animate-pulse' : ''}`} />
                    {t(statusEntry.i18nKey)}
                  </span>
                </div>

                {/* View count badge — top-right */}
                {totalViews > 0 && (
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 rounded-full px-2.5 py-1 backdrop-blur-sm shadow-sm">
                      <Eye className="w-3 h-3" />
                      {totalViews.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-6 md:p-8 flex flex-col justify-between flex-1 relative z-10 bg-gradient-to-t from-white dark:from-zinc-900 via-white/95 dark:via-zinc-900/95 to-white/50 dark:to-zinc-900/50">
                <div className="mb-6">
                  {/* Project name — large, bold */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-2xl md:text-3xl font-serif-premium font-bold text-zinc-900 dark:text-white leading-tight tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {project.name}
                    </h3>
                    {onEditProject && (
                      <button
                        onClick={() => onEditProject(project.id)}
                        className="p-2 rounded-xl text-zinc-400 dark:text-zinc-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                        title={t('portal.projectSettings', 'Project Settings')}
                        aria-label={t('portal.projectSettings', 'Project Settings')}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Client name */}
                  {project.client && (
                    <p className="text-base text-zinc-500 dark:text-zinc-400 mt-1.5 font-sans-premium truncate">
                      {project.client}
                    </p>
                  )}
                </div>

                {/* Stats strip */}
                <div className="flex items-center gap-5 mb-8 text-zinc-500 dark:text-zinc-400 font-sans-premium">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      {itemCount}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider">
                      {t('portal.projectItems', { count: itemCount })}
                    </span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-medium uppercase tracking-wider">{lastUpdated}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                    to={`/project/${project.id}/menu`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-sm font-bold text-zinc-700 dark:text-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 hover:-translate-y-0.5 transition-all group/btn whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover/btn:text-brand-500 transition-colors" />
                    {t('portal.openProject')}
                  </Link>
                  <Link
                    to={`/project/${project.id}/menu/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 border border-transparent text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all group/btn whitespace-nowrap"
                  >
                    <Pencil className="w-4 h-4 text-brand-100 group-hover/btn:-rotate-12 transition-transform duration-300" />
                    {t('portal.editMenu', 'Edit Menu')}
                  </Link>
                  <button
                    onClick={() => setQrCodeProjectId(project.id)}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/30 shadow-sm hover:shadow-md transition-all group/btn flex-shrink-0"
                    title={t('portal.qrCode', 'QR Code')}
                    aria-label={t('portal.qrCode', 'QR Code')}
                  >
                    <QrCode className="w-4 h-4 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Menu Settings Modal */}
      {settingsProjectId &&
        (() => {
          const proj = projects.find((p) => p.id === settingsProjectId);
          const currentSettings = menuSettings[settingsProjectId] || {
            title: proj?.name || '',
            brandColor: '#d97706',
            font: 'Inter',
            showPrices: true,
            currency: '$',
          };
          return (
            <MenuSettingsModal
              isOpen={true}
              onClose={() => setSettingsProjectId(null)}
              currentSettings={currentSettings}
              onSave={(s) => {
                setMenuSettings((prev) => ({ ...prev, [settingsProjectId]: s }));
                setSettingsProjectId(null);
              }}
            />
          );
        })()}

      {/* QR Code Modal */}
      {qrCodeProjectId &&
        (() => {
          const proj = projects.find((p) => p.id === qrCodeProjectId);
          if (!proj) return null;

          const baseMenuUrl = `${window.location.origin}/project/${proj.id}/menu`;
          const menuUrl = qrTableNumber ? `${baseMenuUrl}?table=${encodeURIComponent(qrTableNumber)}` : baseMenuUrl;

          const handleCloseQr = () => {
            if (qrArtImage) URL.revokeObjectURL(qrArtImage);
            setQrArtImage(null);
            setQrInstance(null);
            setQrCodeProjectId(null);
            setQrTableNumber('');
            setQrColor('#000000');
            setQrBgColor('#ffffff');
            setQrDotType('square');
            setQrCornerType('square');
          };

          const handleArtImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (qrArtImage) URL.revokeObjectURL(qrArtImage);
            setQrArtImage(URL.createObjectURL(file));
            e.target.value = '';
          };

          const handleRemoveArtImage = () => {
            if (qrArtImage) URL.revokeObjectURL(qrArtImage);
            setQrArtImage(null);
          };

          const downloadQRCode = async () => {
            if (!qrInstance) return;
            await qrInstance.download({
              extension: 'png',
              name: `${proj.name}-qr-code`,
            });
          };

          return createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
              <div
                className="absolute inset-0 bg-transparent pointer-events-auto max-h-screen overflow-y-auto"
                onClick={handleCloseQr}
                aria-hidden="true"
              />
              <div
                className="relative pointer-events-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {t('portal.menuQRCode', 'Menu QR Code')}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{proj.name}</p>
                  </div>
                  <button
                    onClick={handleCloseQr}
                    className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* QR Code */}
                <div
                  className="p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 mb-6 flex items-center justify-center"
                  style={{ backgroundColor: qrBgColor }}
                >
                  <QRCodeDisplay
                    url={menuUrl}
                    size="lg"
                    label={proj.name}
                    onReady={setQrInstance}
                    options={{
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- qr-code-styling expects string union, state is generic string
                      dotsOptions: { color: qrColor, type: qrDotType as any },
                      backgroundOptions: { color: qrBgColor },
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- qr-code-styling expects string union, state is generic string
                      cornersSquareOptions: { color: qrColor, type: qrCornerType as any },
                      cornersDotOptions: { color: qrColor },
                      ...(qrArtImage
                        ? { image: qrArtImage, imageOptions: { crossOrigin: 'anonymous', margin: 8, imageSize: 0.35 } }
                        : {}),
                    }}
                  />
                </div>

                {/* Options */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">
                      {t('portal.tableNumber', 'Table Number (Optional)')}
                    </label>
                    <input
                      type="text"
                      value={qrTableNumber}
                      onChange={(e) => setQrTableNumber(e.target.value)}
                      placeholder="e.g. 12 or Patio-3"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">
                        {t('portal.qrColor', 'QR Color')}
                      </label>
                      <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1">
                        <input
                          type="color"
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent border-none appearance-none"
                        />
                        <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{qrColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">
                        {t('portal.qrBgColor', 'Background')}
                      </label>
                      <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1">
                        <input
                          type="color"
                          value={qrBgColor}
                          onChange={(e) => setQrBgColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent border-none appearance-none"
                        />
                        <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{qrBgColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dot Pattern */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">
                      {t('portal.qrDotPattern', 'Dot Pattern')}
                    </label>
                    <div className="flex gap-1.5">
                      {[
                        { value: 'square', label: 'Square' },
                        { value: 'dots', label: 'Dots' },
                        { value: 'rounded', label: 'Rounded' },
                        { value: 'classy', label: 'Classy' },
                        { value: 'classy-rounded', label: 'Soft' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setQrDotType(opt.value)}
                          className={`flex-1 px-1.5 py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${
                            qrDotType === opt.value
                              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                              : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Corner Style */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">
                      {t('portal.qrCornerStyle', 'Corner Style')}
                    </label>
                    <div className="flex gap-1.5">
                      {[
                        { value: 'square', label: 'Square' },
                        { value: 'dot', label: 'Dot' },
                        { value: 'extra-rounded', label: 'Rounded' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setQrCornerType(opt.value)}
                          className={`flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${
                            qrCornerType === opt.value
                              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                              : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* QR Art Image */}
                <div className="mb-6">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">
                    {t('portal.qrArtImage', 'QR Art Image')}
                  </label>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">
                    {t('portal.qrArtImageDesc', 'Add a logo or image to the center of your QR code')}
                  </p>
                  <input
                    ref={qrFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleArtImageUpload}
                    className="hidden"
                  />
                  {qrArtImage ? (
                    <div className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                      <img
                        src={qrArtImage}
                        alt="QR art"
                        className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-600"
                      />
                      <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 font-medium truncate">
                        {t('portal.qrImageUploaded', 'Image applied')}
                      </span>
                      <button
                        onClick={() => qrFileInputRef.current?.click()}
                        className="px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg transition-colors"
                      >
                        {t('portal.qrChangeImage', 'Change')}
                      </button>
                      <button
                        onClick={handleRemoveArtImage}
                        className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title={t('portal.qrRemoveImage', 'Remove image')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => qrFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors"
                    >
                      <ImagePlus className="w-4 h-4" />
                      {t('portal.qrUploadImage', 'Upload image')}
                    </button>
                  )}
                </div>

                {/* Menu URL */}
                <div className="mb-6">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
                    {t('portal.menuLink', 'Menu Link')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={menuUrl}
                      readOnly
                      className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(menuUrl);
                      }}
                      className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t('portal.copy', 'Copy')}
                    </button>
                  </div>
                </div>

                {/* Embed Code */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                      {t('portal.embedCode', 'Embed Code')}
                    </label>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `<iframe src="${menuUrl}" width="400" height="600" frameborder="0" allowfullscreen></iframe>`
                        );
                        setEmbedCopied(true);
                        setTimeout(() => setEmbedCopied(false), 2000);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors"
                    >
                      {embedCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          {t('portal.copied', 'Copied!')}
                        </>
                      ) : (
                        <>
                          <Code2 className="w-3 h-3" />
                          {t('portal.copy', 'Copy')}
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 overflow-x-auto font-mono whitespace-pre-wrap break-all leading-relaxed">
                    {`<iframe src="${menuUrl}" width="400" height="600" frameborder="0" allowfullscreen></iframe>`}
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={downloadQRCode}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {t('portal.downloadQR', 'Download QR Code')}
                  </button>
                  <button
                    onClick={handleCloseQr}
                    className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
                  >
                    {t('portal.close', 'Close')}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          );
        })()}
    </section>
  );
};
