import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Undo,
  Redo,
  Layers,
  Sun,
  Move,
  Share2,
  Settings,
  Smartphone,
  RotateCcw,
  X,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import { AssetUploader } from '@/components/editor/AssetUploader';
import { AssetsProvider } from '@/services/dataProvider';
import { useToast } from '@/contexts/ToastContext';
import { QRCodeDisplay } from '@/components/common/QRCodeDisplay';
import { SEO } from '@/components/common/SEO';

const ModelEditor: React.FC = () => {
  const { t } = useTranslation();
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [modelSrc, setModelSrc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'transform' | 'materials' | 'lighting'>('transform');

  // Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Share Modal State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Model Properties
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });

  // Environment Properties
  const [exposure, setExposure] = useState(1.0);
  const [shadowIntensity, setShadowIntensity] = useState(1.0);
  const [autoRotate, setAutoRotate] = useState(false);

  // Material Properties
  const [baseColor, setBaseColor] = useState('#ffffff');
  const [roughness, setRoughness] = useState(0.5);
  const [metalness, setMetalness] = useState(0.0);

  // Helper: Hex to RGBA
  const hexToRgba = (hex: string): [number, number, number, number] => {
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      let chars = hex.substring(1).split('');
      if (chars.length === 3) {
        chars = [chars[0], chars[0], chars[1], chars[1], chars[2], chars[2]];
      }
      const num = parseInt(chars.join(''), 16);
      return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255, 1.0];
    }
    return [1, 1, 1, 1];
  };

  // Apply Material Changes
  useEffect(() => {
    const viewer = document.querySelector('model-viewer') as any; // eslint-disable-line @typescript-eslint/no-explicit-any -- model-viewer DOM API lacks TS typings;
    if (!viewer) return;

    const updateMaterial = () => {
      if (!viewer.model || !viewer.model.materials || viewer.model.materials.length === 0) return;

      const material = viewer.model.materials[0];
      const pbr = material.pbrMetallicRoughness;

      // Update Base Color
      pbr.setBaseColorFactor(hexToRgba(baseColor));

      // Update Roughness & Metalness
      pbr.setRoughnessFactor(roughness);
      pbr.setMetallicFactor(metalness);
    };

    // Apply when model loads or state changes
    viewer.addEventListener('load', updateMaterial);
    updateMaterial();

    return () => {
      viewer.removeEventListener('load', updateMaterial);
    };
  }, [baseColor, roughness, metalness, modelSrc]);

  // Initialize
  useEffect(() => {
    // Load model-viewer
    import('@google/model-viewer');

    if (assetId && assetId !== 'new') {
      // Mock loading existing asset
      setModelSrc('/models/AdvancedExport/3DModel_Custom.gltf');
      // If it was a real app, we'd fetch the specific asset data here
    }
  }, [assetId]);

  const handleUpload = (url: string) => {
    setModelSrc(url);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const savedAsset = await AssetsProvider.create({
        id: assetId === 'new' ? undefined : assetId,
        name: assetId === 'new' ? 'My New AR Scene' : 'Updated AR Scene',
        // In a real app we'd upload the blob/file here
        // For MVP we can't easily persist the blob URL, so we keep using the placeholder or the blob URL if valid
        thumb: '/models/AdvancedExport/3DModel_Custom.jpg',
        updated: 'Just now',
      });

      setLastSaved(new Date());
      success('Scene saved successfully');

      if (assetId === 'new') {
        navigate(`/app/editor/${savedAsset.id}`);
      }
    } catch {
      error('Failed to save scene');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success('Link copied to clipboard');
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0, z: 0 });
    setRotation({ x: 0, y: 0, z: 0 });
    setScale({ x: 1, y: 1, z: 1 });
    setExposure(1.0);
    setShadowIntensity(1.0);
    setBaseColor('#ffffff');
    setRoughness(0.5);
    setMetalness(0.0);
    const viewer = document.querySelector('model-viewer') as any; // eslint-disable-line @typescript-eslint/no-explicit-any -- model-viewer DOM API lacks TS typings;
    if (viewer) viewer.cameraOrbit = '45deg 55deg 2.5m';
  };

  const handleActivateAR = () => {
    const viewer = document.querySelector('model-viewer') as any; // eslint-disable-line @typescript-eslint/no-explicit-any -- model-viewer DOM API lacks TS typings;
    if (viewer?.activateAR) viewer.activateAR();
  };

  // If no model is loaded, show uploader
  if (!modelSrc) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
        <Link
          to="/app/dashboard"
          className="absolute top-8 left-8 text-stone-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> {t('editor.backToScene')}
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-100 mb-2">{t('editor.uploadModel')}</h1>
          <p className="text-stone-400">{t('editor.uploadModel')}</p>
        </div>
        <AssetUploader onUpload={handleUpload} />
      </div>
    );
  }

  return (
    <div
      className="flex h-screen bg-stone-950 text-stone-200 overflow-hidden font-sans"
      {...(import.meta.env.DEV && {
        'data-component': 'Model Editor',
        'data-file': 'src/pages/editor/ModelEditor.tsx',
      })}
    >
      <SEO
        title={assetId === 'new' ? 'New Scene' : `Edit ${assetId}`}
        description="Edit your 3D scene settings, materials, and lighting."
      />
      {/* Top Bar */}
      <header className="fixed top-0 w-full h-14 bg-stone-900 border-b border-stone-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <Link
            to="/app/dashboard"
            className="p-2 hover:bg-stone-800 rounded-md text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-stone-800"></div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-stone-100">
              {assetId === 'new' ? 'Untitled Scene' : assetId}
            </span>
            <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30">
              DRAFT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 mr-2 hidden md:inline">
            {lastSaved
              ? t('editor.lastSaved', { time: lastSaved.toLocaleTimeString() })
              : 'Unsaved changes'}
          </span>
          <button
            className="p-2 hover:bg-stone-800 rounded text-stone-400 hover:text-white"
            title={t('editor.undo')}
            aria-label={t('editor.undo')}
          >
            <Undo className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            className="p-2 hover:bg-stone-800 rounded text-stone-400 hover:text-white"
            title={t('editor.redo')}
            aria-label={t('editor.redo')}
          >
            <Redo className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="h-6 w-px bg-stone-800 mx-2"></div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? t('editor.saving') : t('editor.save')}
          </button>
          <button
            onClick={() => setIsShareOpen(true)}
            className="p-2 hover:bg-stone-800 rounded text-stone-400 hover:text-white"
            title={t('editor.share')}
            aria-label={t('editor.share')}
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 pt-14 w-full">
        {/* Toolbar (Left) */}
        <aside className="w-14 bg-stone-900 border-r border-stone-800 flex flex-col items-center py-4 gap-4">
          <button
            className={`p-3 rounded-xl transition-all ${activeTab === 'transform' ? 'bg-amber-500/20 text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
            onClick={() => setActiveTab('transform')}
            title={t('editor.transform')}
            aria-label={t('editor.transform')}
            aria-pressed={activeTab === 'transform'}
          >
            <Move className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            className={`p-3 rounded-xl transition-all ${activeTab === 'materials' ? 'bg-amber-500/20 text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
            onClick={() => setActiveTab('materials')}
            title={t('editor.materials')}
            aria-label={t('editor.materials')}
            aria-pressed={activeTab === 'materials'}
          >
            <Layers className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            className={`p-3 rounded-xl transition-all ${activeTab === 'lighting' ? 'bg-amber-500/20 text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
            onClick={() => setActiveTab('lighting')}
            title={t('editor.lighting')}
            aria-label={t('editor.lighting')}
            aria-pressed={activeTab === 'lighting'}
          >
            <Sun className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="flex-1"></div>
          <button className="p-3 text-stone-500 hover:text-white" aria-label="Settings">
            <Settings className="w-5 h-5" aria-hidden="true" />
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
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
            <button
              onClick={handleReset}
              className="bg-stone-900/80 backdrop-blur text-stone-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-stone-800 border border-stone-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> {t('editor.resetCamera')}
            </button>
            <button
              onClick={handleActivateAR}
              className="bg-amber-600/90 backdrop-blur text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-amber-500 shadow-lg shadow-amber-900/40 flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" /> {t('editor.viewInAR')}
            </button>
          </div>
        </main>

        {/* Properties Panel (Right) */}
        <aside className="w-80 bg-stone-900 border-l border-stone-800 overflow-y-auto">
          <div className="p-4 border-b border-stone-800">
            <h2 className="font-bold text-sm uppercase tracking-wider text-stone-400">
              {activeTab === 'transform' && t('editor.transform')}
              {activeTab === 'materials' && t('editor.materials')}
              {activeTab === 'lighting' && t('editor.lighting')}
            </h2>
          </div>

          <div className="p-6 space-y-8">
            {activeTab === 'transform' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-stone-500 uppercase">
                    {t('editor.position')} (m)
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                      <span className="text-red-500 text-xs font-bold">X</span>
                      <input
                        type="number"
                        step="0.1"
                        className="bg-transparent w-full text-sm outline-none"
                        value={position.x}
                        onChange={(e) =>
                          setPosition({ ...position, x: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                      <span className="text-green-500 text-xs font-bold">Y</span>
                      <input
                        type="number"
                        step="0.1"
                        className="bg-transparent w-full text-sm outline-none"
                        value={position.y}
                        onChange={(e) =>
                          setPosition({ ...position, y: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                      <span className="text-blue-500 text-xs font-bold">Z</span>
                      <input
                        type="number"
                        step="0.1"
                        className="bg-transparent w-full text-sm outline-none"
                        value={position.z}
                        onChange={(e) =>
                          setPosition({ ...position, z: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPosition({ x: 0, y: 0, z: 0 })}
                      className="text-xs text-stone-500 underline hover:text-stone-300"
                    >
                      Reset Position
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-stone-500 uppercase">
                    {t('editor.scale')} (Factor)
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                      <span className="text-red-500 text-xs font-bold">X</span>
                      <input
                        type="number"
                        step="0.1"
                        className="bg-transparent w-full text-sm outline-none"
                        value={scale.x}
                        onChange={(e) => setScale({ ...scale, x: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                      <span className="text-green-500 text-xs font-bold">Y</span>
                      <input
                        type="number"
                        step="0.1"
                        className="bg-transparent w-full text-sm outline-none"
                        value={scale.y}
                        onChange={(e) => setScale({ ...scale, y: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                      <span className="text-blue-500 text-xs font-bold">Z</span>
                      <input
                        type="number"
                        step="0.1"
                        className="bg-transparent w-full text-sm outline-none"
                        value={scale.z}
                        onChange={(e) => setScale({ ...scale, z: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScale({ x: 1, y: 1, z: 1 })}
                      className="text-xs text-stone-500 underline hover:text-stone-300"
                    >
                      Reset Scale
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-stone-500 uppercase">
                    {t('editor.rotation')} (deg)
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                      <span className="text-red-500 text-xs font-bold">X</span>
                      <input
                        type="number"
                        className="bg-transparent w-full text-sm outline-none"
                        value={rotation.x}
                        onChange={(e) => setRotation({ ...rotation, x: Number(e.target.value) })}
                      />
                    </div>
                    <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                      <span className="text-green-500 text-xs font-bold">Y</span>
                      <input
                        type="number"
                        className="bg-transparent w-full text-sm outline-none"
                        value={rotation.y}
                        onChange={(e) => setRotation({ ...rotation, y: Number(e.target.value) })}
                      />
                    </div>
                    <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                      <span className="text-blue-500 text-xs font-bold">Z</span>
                      <input
                        type="number"
                        className="bg-transparent w-full text-sm outline-none"
                        value={rotation.z}
                        onChange={(e) => setRotation({ ...rotation, z: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'materials' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-stone-500 uppercase">Base Material</h3>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-stone-300">Base Color</label>
                      <span className="text-xs text-stone-500">{baseColor}</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={baseColor}
                        onChange={(e) => setBaseColor(e.target.value)}
                        className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={baseColor}
                        onChange={(e) => setBaseColor(e.target.value)}
                        className="flex-1 bg-stone-950 border border-stone-800 rounded px-3 text-sm text-stone-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-stone-500 uppercase">Properties</h3>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-stone-300">Roughness</label>
                      <span className="text-xs text-stone-500">{roughness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={roughness}
                      onChange={(e) => setRoughness(parseFloat(e.target.value))}
                      className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-stone-300">Metalness</label>
                      <span className="text-xs text-stone-500">{metalness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={metalness}
                      onChange={(e) => setMetalness(parseFloat(e.target.value))}
                      className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'lighting' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-stone-500 uppercase">Environment</h3>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-stone-300">{t('editor.autoRotate')}</label>
                    <input
                      type="checkbox"
                      checked={autoRotate}
                      onChange={(e) => setAutoRotate(e.target.checked)}
                      className="w-4 h-4 rounded bg-stone-800 border-stone-600 accent-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-stone-300">{t('editor.exposure')}</label>
                    <span className="text-xs text-stone-500">{exposure}</span>
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
                    <label className="text-sm text-stone-300">{t('editor.shadowIntensity')}</label>
                    <span className="text-xs text-stone-500">{shadowIntensity}</span>
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
              </>
            )}
          </div>

          <div className="p-4 border-t border-stone-800 mt-auto">
            <button
              onClick={handleReset}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 rounded text-sm font-medium text-stone-300 transition-colors"
            >
              Reset All Settings
            </button>
          </div>
        </aside>
      </div>

      {/* Share / Publish Modal */}
      {isShareOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsShareOpen(false)}
        >
          <div
            className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white font-serif">{t('editor.shareTitle')}</h2>
              <button
                onClick={() => setIsShareOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Privacy */}
              <div className="bg-stone-950/50 p-4 rounded-xl border border-stone-800/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-900/20 text-green-500 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-200">Public Access</div>
                    <div className="text-xs text-stone-500">Anyone with the link can view</div>
                  </div>
                  <div className="ml-auto">
                    <input type="checkbox" checked readOnly className="toggle accent-amber-500" />
                  </div>
                </div>
              </div>

              {/* Link Copy */}
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">
                  {t('editor.copyLink')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-300"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-stone-800 hover:bg-stone-700 text-white px-3 py-2 rounded-lg flex items-center justify-center transition-colors"
                    aria-label={t('editor.copyLink')}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Embed Code */}
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">
                  {t('editor.embedCode')}
                </label>
                <div className="bg-stone-950 border border-stone-800 rounded-lg p-3 text-xs font-mono text-stone-400 overflow-x-auto whitespace-pre">
                  {`<iframe src="${window.location.href}" width="100%" height="400px" frameborder="0"></iframe>`}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex items-center gap-4 pt-4 border-t border-stone-800/50">
                <QRCodeDisplay url={window.location.href} size="sm" />
                <div className="flex-1">
                  <div className="font-bold text-stone-200 text-sm mb-1">{t('editor.qrCode')}</div>
                  <p className="text-xs text-stone-500">{t('editor.scanToView')}</p>
                </div>
              </div>

              <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelEditor;
