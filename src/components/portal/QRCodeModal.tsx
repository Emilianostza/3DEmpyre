import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, Copy, ExternalLink, QrCode, Palette, Grid3x3, RefreshCw, Box, Code2, Check } from 'lucide-react';
import { Asset } from '@/types';
import { QRCodeDisplay } from '@/components/common/QRCodeDisplay';
import { BaseModal } from '@/components/common/BaseModal';
import type QRCodeStyling from 'qr-code-styling';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

const DOT_TYPES = [
  { value: 'square', label: 'Classic Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
];

const CORNER_TYPES = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
];

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, asset }) => {
  const { t } = useTranslation();

  // Styling State
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [dotType, setDotType] = useState('rounded');
  const [cornerType, setCornerType] = useState('extra-rounded');
  const [logoEnabled, setLogoEnabled] = useState(false);
  const [qrInstance, setQrInstance] = useState<QRCodeStyling | null>(null);
  const [embedCopied, setEmbedCopied] = useState(false);

  if (!isOpen || !asset) return null;

  // Public WebAR viewer URL — safe to share with end-customers (no auth required)
  const assetUrl = `${window.location.origin}/view/${asset.id}`;

  const handleDownload = async () => {
    if (qrInstance) {
      await qrInstance.download({
        extension: 'png',
        name: `qr-${asset.name.toLowerCase().replace(/\s+/g, '-')}`,
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(assetUrl);
  };

  const embedCode = `<iframe src="${assetUrl}" width="400" height="300" frameborder="0" allow="xr-spatial-tracking" allowfullscreen></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    });
  };

  const resetStyles = () => {
    setFgColor('#000000');
    setBgColor('#ffffff');
    setDotType('rounded');
    setCornerType('extra-rounded');
    setLogoEnabled(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      className="bg-white dark:bg-zinc-900 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      aria-labelledby="qr-modal-title"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
              <QrCode className="w-5 h-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            </div>
            <div>
              <h3 id="qr-modal-title" className="font-bold text-zinc-900 dark:text-white text-lg">
                {t('qrModal.title', 'QR Code Art Studio')}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('qrModal.subtitle', { name: asset.name })}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body Wrapper (Two Columns on Desktop) */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto">

          {/* Left Column: Preview */}
          <div className="p-8 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/50 border-r border-zinc-100 dark:border-zinc-800 md:w-1/2">

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-xl border border-zinc-100 dark:border-zinc-800 mb-6 transition-all">
              <QRCodeDisplay
                url={assetUrl}
                size="lg"
                label={asset.name}
                onReady={setQrInstance}
                options={{
                  dotsOptions: {
                    color: fgColor,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    type: dotType as any,
                  },
                  backgroundOptions: {
                    color: bgColor,
                  },
                  cornersSquareOptions: {
                    color: fgColor,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    type: cornerType as any,
                  },
                  cornersDotOptions: {
                    color: fgColor,
                  },
                  imageOptions: {
                    crossOrigin: "anonymous",
                    margin: 10
                  },
                  ...(logoEnabled ? { image: '/favicon.svg' } : {}) // Assuming a favicon exists in public/
                }}
              />
            </div>

            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 text-center flex items-center gap-2">
              {t('qrModal.scanToView', 'Scan to view')} <ExternalLink className="w-3 h-3" />
            </p>
          </div>

          {/* Right Column: Controls */}
          <div className="p-6 md:w-1/2 space-y-6">

            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{t('qrModal.customization', 'Customization')}</h4>
              <button
                onClick={resetStyles}
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 font-medium bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded"
              >
                <RefreshCw className="w-3 h-3" />
                {t('qrModal.reset', 'Reset')}
              </button>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                <Palette className="w-4 h-4 text-zinc-400" />
                {t('qrModal.brandColors', 'Brand Colors')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">{t('qrModal.foreground', 'Foreground')}</label>
                  <div className="relative">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                      title="Choose Foreground Color"
                    />
                    <div className="flex items-center gap-2 p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800">
                      <div className="w-6 h-6 rounded border border-zinc-200 dark:border-zinc-700 shadow-inner" style={{ backgroundColor: fgColor }} />
                      <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300 uppercase">{fgColor}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">{t('qrModal.background', 'Background')}</label>
                  <div className="relative">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                      title="Choose Background Color"
                    />
                    <div className="flex items-center gap-2 p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800">
                      <div className="w-6 h-6 rounded border border-zinc-200 dark:border-zinc-700 shadow-inner" style={{ backgroundColor: bgColor }} />
                      <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300 uppercase">{bgColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shape Style */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                <Grid3x3 className="w-4 h-4 text-zinc-400" />
                {t('qrModal.patternCorners', 'Pattern & Corners')}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">{t('qrModal.dotPattern', 'Dot Pattern')}</label>
                  <select
                    value={dotType}
                    onChange={(e) => setDotType(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    {DOT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">{t('qrModal.cornerStyle', 'Corner Style')}</label>
                  <select
                    value={cornerType}
                    onChange={(e) => setCornerType(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    {CORNER_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                <Box className="w-4 h-4 text-zinc-400" />
                {t('qrModal.logoIntegration', 'Logo Integration')}
              </label>

              <label className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                <input
                  type="checkbox"
                  checked={logoEnabled}
                  onChange={(e) => setLogoEnabled(e.target.checked)}
                  className="w-5 h-5 text-brand-600 rounded border-zinc-300 focus:ring-brand-600 bg-zinc-100 dark:bg-zinc-900 border-2"
                />
                <div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-white">{t('qrModal.centerLogo', 'Center Logo')}</div>
                  <div className="text-xs text-zinc-500">{t('qrModal.centerLogoDesc', 'Insert platform logo in the center')}</div>
                </div>
              </label>
            </div>


            {/* Embed Code */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                <Code2 className="w-4 h-4 text-zinc-400" />
                {t('qrModal.embedCode', 'Embed Code')}
              </label>
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">HTML iframe</span>
                  <button
                    onClick={handleCopyEmbed}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors"
                  >
                    {embedCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        {t('qrModal.copied', 'Copied!')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        {t('qrModal.copy', 'Copy')}
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 overflow-x-auto font-mono whitespace-pre-wrap break-all leading-relaxed">
                  {embedCode}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 py-3 rounded-xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 focus:outline-none"
                >
                  <Copy className="w-4 h-4" aria-hidden="true" /> {t('qrModal.copyLink')}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-opacity flex items-center justify-center gap-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-700 focus:outline-none shadow-lg shadow-brand-500/20"
                >
                  <Download className="w-4 h-4" aria-hidden="true" /> {t('qrModal.downloadCode', 'Download Code')}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </BaseModal>
  );
};
