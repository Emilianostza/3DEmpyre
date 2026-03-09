import React, { useState, useEffect, useRef } from 'react';
import { Layers, Sun, Move, Share2, Settings, RotateCcw, Copy, Check, X } from 'lucide-react';
import { AssetUploader } from '@/components/editor/AssetUploader';
import { AssetsProvider } from '@/services/dataProvider';
import { useToast } from '@/contexts/ToastContext';

interface EmbeddedModelEditorProps {
  assetId: string;
  initialData?: { modelUrl?: string }; // Optional pre-loaded data
}

export const EmbeddedModelEditor: React.FC<EmbeddedModelEditorProps> = ({
  assetId,
  initialData,
}) => {
  const { success, error } = useToast();
  const [modelSrc, setModelSrc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'transform' | 'materials' | 'lighting'>('transform');

  // Saving State
  const [isSaving, setIsSaving] = useState(false);

  // Share Modal State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Model Properties
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });

  // Environment Properties
  const [exposure, setExposure] = useState(1.0);
  const [shadowIntensity, setShadowIntensity] = useState(1.0);
  const [autoRotate, setAutoRotate] = useState(false);

  // Clean up copy-feedback timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Initialize
  useEffect(() => {
    // Load model-viewer
    import('@google/model-viewer');

    if (assetId && assetId !== 'new') {
      // Mock loading existing asset
      // In a real app, we'd fetch based on assetId
      // For now, use a placeholder or initialData if provided
      if (initialData?.modelUrl) {
        setModelSrc(initialData.modelUrl);
      } else {
        setModelSrc('/models/AdvancedExport/3DModel_Custom.gltf');
      }
    } else {
      setModelSrc(null); // Reset for new
    }
  }, [assetId, initialData]);

  const handleUpload = (url: string) => {
    setModelSrc(url);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await AssetsProvider.create({
        id: assetId === 'new' ? undefined : assetId,
        name: 'Updated Scene',
        thumb: modelSrc || '',
        updated: 'Just now',
      });

      success('Scene saved successfully');
    } catch {
      error('Failed to save scene');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    success('Link copied to clipboard');
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0, z: 0 });
    setRotation({ x: 0, y: 0, z: 0 });
    setScale({ x: 1, y: 1, z: 1 });
    setExposure(1.0);
    setShadowIntensity(1.0);
    const viewer = document.querySelector('model-viewer') as
      | (HTMLElement & { cameraOrbit: string })
      | null;
    if (viewer) viewer.cameraOrbit = '45deg 55deg 2.5m';
  };

  // If no model is loaded, show uploader
  if (!modelSrc) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-stone-900/50 rounded-2xl border border-stone-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-100 mb-2">
            {assetId === 'new' ? 'New AR Scene' : 'Select a Model'}
          </h1>
          <p className="text-stone-400">Upload your 3D model to start editing</p>
        </div>
        <AssetUploader onUpload={handleUpload} />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-stone-950 text-stone-200 overflow-hidden font-sans rounded-2xl border border-stone-800 shadow-2xl relative">
      {/* Toolbar (Left) */}
      <aside className="w-14 bg-stone-900 border-r border-stone-800 flex flex-col items-center py-4 gap-4 z-10">
        <button
          className={`p-3 rounded-xl transition-all ${activeTab === 'transform' ? 'bg-amber-500/20 text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
          onClick={() => setActiveTab('transform')}
          title="Transform"
        >
          <Move className="w-5 h-5" />
        </button>
        <button
          className={`p-3 rounded-xl transition-all ${activeTab === 'materials' ? 'bg-amber-500/20 text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
          onClick={() => setActiveTab('materials')}
          title="Materials"
        >
          <Layers className="w-5 h-5" />
        </button>
        <button
          className={`p-3 rounded-xl transition-all ${activeTab === 'lighting' ? 'bg-amber-500/20 text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
          onClick={() => setActiveTab('lighting')}
          title="Lighting"
        >
          <Sun className="w-5 h-5" />
        </button>
        <div className="flex-1"></div>
        <button
          onClick={() => setIsShareOpen(true)}
          className="p-3 text-stone-500 hover:text-white"
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button className="p-3 text-stone-500 hover:text-white" aria-label="Settings">
          <Settings className="w-5 h-5" />
        </button>
      </aside>

      {/* Viewport (Center) */}
      <main className="flex-1 bg-gradient-to-br from-stone-800 to-stone-900 relative overflow-hidden flex items-center justify-center group">
        {/* Grid Background Mock */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        {/* 3D Model Viewer */}
        <div
          className="w-full h-full"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px)`,
          }}
        >
          {/* @ts-ignore */}
          <model-viewer
            src={modelSrc}
            alt="3D Asset Editor"
            camera-controls
            interaction-prompt="none"
            shadow-intensity={shadowIntensity.toString()}
            exposure={exposure.toString()}
            auto-rotate={autoRotate ? 'true' : undefined}
            ar
            ar-modes="webxr scene-viewer quick-look"
            orientation={`${rotation.x}deg ${rotation.y}deg ${rotation.z}deg`}
            scale={`${scale.x} ${scale.y} ${scale.z}`}
            style={{ width: '100%', height: '100%' }}
          ></model-viewer>
        </div>

        {/* Viewport Overlay Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-none">
          {/* Wrapped in pointer-events-auto via buttons if needed, but here simple layout */}
          <button
            onClick={handleReset}
            className="bg-stone-900/80 backdrop-blur text-stone-300 px-4 py-2 rounded-full text-xs font-medium hover:bg-stone-800 border border-stone-700 flex items-center gap-2 pointer-events-auto"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <button
            onClick={handleSave}
            className="bg-amber-600/90 backdrop-blur text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-amber-500 shadow-lg shadow-amber-900/40 flex items-center gap-2 pointer-events-auto"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </main>

      {/* Properties Panel (Right) */}
      <aside className="w-64 bg-stone-900 border-l border-stone-800 overflow-y-auto">
        <div className="p-4 border-b border-stone-800">
          <h2 className="font-bold text-xs uppercase tracking-wider text-stone-400">
            {activeTab === 'transform' && 'Transform'}
            {activeTab === 'materials' && 'Materials'}
            {activeTab === 'lighting' && 'Lighting'}
          </h2>
        </div>

        <div className="p-4 space-y-6">
          {activeTab === 'transform' && (
            <>
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-stone-500 uppercase">Position</h3>
                <div className="space-y-2">
                  {['x', 'y', 'z'].map((axis) => (
                    <div key={axis} className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold w-4 text-center ${axis === 'x' ? 'text-red-500' : axis === 'y' ? 'text-green-500' : 'text-blue-500'}`}
                      >
                        {axis.toUpperCase()}
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        aria-label={`Position ${axis.toUpperCase()}`}
                        className="bg-stone-950 w-full text-xs p-1.5 rounded border border-stone-800 outline-none focus:border-amber-500/50"
                        value={(position as Record<string, number>)[axis]}
                        onChange={(e) =>
                          setPosition({ ...position, [axis]: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-stone-500 uppercase">Scale</h3>
                <div className="space-y-2">
                  {['x', 'y', 'z'].map((axis) => (
                    <div key={axis} className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold w-4 text-center ${axis === 'x' ? 'text-red-500' : axis === 'y' ? 'text-green-500' : 'text-blue-500'}`}
                      >
                        {axis.toUpperCase()}
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        aria-label={`Scale ${axis.toUpperCase()}`}
                        className="bg-stone-950 w-full text-xs p-1.5 rounded border border-stone-800 outline-none focus:border-amber-500/50"
                        value={(scale as Record<string, number>)[axis]}
                        onChange={(e) =>
                          setScale({ ...scale, [axis]: parseFloat(e.target.value) || 1 })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-stone-500 uppercase">Rotation</h3>
                <div className="space-y-2">
                  {['x', 'y', 'z'].map((axis) => (
                    <div key={axis} className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold w-4 text-center ${axis === 'x' ? 'text-red-500' : axis === 'y' ? 'text-green-500' : 'text-blue-500'}`}
                      >
                        {axis.toUpperCase()}
                      </span>
                      <input
                        type="number"
                        step="15"
                        aria-label={`Rotation ${axis.toUpperCase()}`}
                        className="bg-stone-950 w-full text-xs p-1.5 rounded border border-stone-800 outline-none focus:border-amber-500/50"
                        value={(rotation as Record<string, number>)[axis]}
                        onChange={(e) =>
                          setRotation({ ...rotation, [axis]: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'materials' && (
            <div className="text-center py-8 text-stone-500">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Select a mesh to edit materials</p>
            </div>
          )}

          {activeTab === 'lighting' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-stone-300">Exposure</label>
                  <span className="text-[10px] text-stone-500">{exposure}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={exposure}
                  onChange={(e) => setExposure(parseFloat(e.target.value))}
                  className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-stone-300">Shadows</label>
                  <span className="text-[10px] text-stone-500">{shadowIntensity}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={shadowIntensity}
                  onChange={(e) => setShadowIntensity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-stone-300">Auto-Rotate</label>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className="w-4 h-4 rounded bg-stone-800 border-stone-600 accent-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Share / Publish Modal */}
      {isShareOpen && (
        <div
          className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsShareOpen(false)}
        >
          <div
            className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Share Scene</h2>
              <button
                onClick={() => setIsShareOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">
                Public Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300"
                />
                <button
                  onClick={handleCopyLink}
                  aria-label={copied ? 'Link copied' : 'Copy link'}
                  className="bg-stone-800 hover:bg-stone-700 text-white px-3 py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3 h-3" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
