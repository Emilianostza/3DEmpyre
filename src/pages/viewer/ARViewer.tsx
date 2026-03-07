import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Smartphone, RotateCcw, Box, ArrowLeft } from 'lucide-react';
import { AssetsProvider } from '@/services/dataProvider';

interface ViewerAsset {
  id: string;
  name: string;
  modelUrl: string;
  thumb?: string;
}

// Fallback demo asset — used when assetId is not found in the provider
const DEMO_ASSET: ViewerAsset = {
  id: 'demo',
  name: 'Demo Scene',
  modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
};

const ARViewer: React.FC = () => {
  const { t } = useTranslation();
  const { assetId } = useParams<{ assetId: string }>();
  const [asset, setAsset] = useState<ViewerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dynamically load model-viewer web component
    import('@google/model-viewer');
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!assetId) {
        setAsset(DEMO_ASSET);
        setIsLoading(false);
        return;
      }
      try {
        const raw = await AssetsProvider.get(assetId);
        if (raw) {
          setAsset({
            id: raw.id,
            name: raw.name,
            modelUrl: raw.file_key?.startsWith('http')
              ? raw.file_key
              : '/models/AdvancedExport/3DModel_Custom.gltf',
            thumb: (raw as { thumb?: string }).thumb,
          });
        } else {
          setAsset(DEMO_ASSET);
        }
      } catch {
        setAsset(DEMO_ASSET);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [assetId]);

  const handleReset = () => {
    const viewer = document.querySelector('model-viewer') as
      | (HTMLElement & { cameraOrbit: string })
      | null;
    if (viewer) viewer.cameraOrbit = '0deg 75deg 130%';
  };

  const handleAR = () => {
    const viewer = document.querySelector('model-viewer') as
      | (HTMLElement & { activateAR?: () => void })
      | null;
    if (viewer?.activateAR) viewer.activateAR();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!asset) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Minimal top bar */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-zinc-950/80 to-transparent pointer-events-none">
        <Link
          to="/library"
          className="flex items-center gap-2 pointer-events-auto hover:opacity-80 transition-opacity"
          aria-label={t('arViewer.backToScene')}
        >
          <ArrowLeft className="w-4 h-4 text-zinc-400" aria-hidden="true" />
          <Box className="w-5 h-5 text-brand-400" aria-hidden="true" />
          <span className="text-sm font-bold tracking-wide">{t('arViewer.backToScene')}</span>
        </Link>
        <span className="text-xs text-zinc-400 bg-zinc-900/60 backdrop-blur-sm px-2 py-1 rounded-full border border-zinc-700/50">
          {asset.name}
        </span>
      </header>

      {/* 3D / AR Viewer — fills the screen */}
      <div className="flex-1 relative" style={{ minHeight: '100dvh' }}>
        <model-viewer
          src={asset.modelUrl}
          alt={asset.name}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          exposure="1"
          loading="eager"
          style={{ width: '100%', height: '100dvh', display: 'block', background: '#09090b' }}
        />

        {/* Bottom controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-white/60 focus:outline-none"
            aria-label={t('arViewer.resetView')}
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            {t('arViewer.resetView')}
          </button>
          <button
            onClick={handleAR}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/30 transition-all text-sm focus-visible:ring-2 focus-visible:ring-brand-300 focus:outline-none"
            aria-label={t('arViewer.viewInAR')}
          >
            <Smartphone className="w-4 h-4" aria-hidden="true" />
            {t('arViewer.viewInAR')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ARViewer;
