import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Box,
  Search,
  QrCode,
  AlertCircle,
  Plus,
  Maximize2,
  Minimize2,
  Layers,
} from 'lucide-react';
import { Asset } from '@/types';
import { QRCodeModal } from '@/components/portal/QRCodeModal';
const EmbeddedModelEditor = lazy(() =>
  import('@/components/editor/EmbeddedModelEditor').then((m) => ({
    default: m.EmbeddedModelEditor,
  }))
);
import { AssetsProvider } from '@/services/dataProvider';
import { NewCaptureWizard } from '@/components/editor/NewCaptureWizard';

interface SceneItem {
  id: string;
  name: string;
  description: string;
  type: string;
  thumb: string;
  modelUrl: string;
  category: string;
  hasModel: boolean;
}

const SceneDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { assetId } = useParams<{ assetId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<Asset | null>(null);

  // Split Screen State
  const [selectedItem, setSelectedItem] = useState<SceneItem | null>(null);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);

  // Simulate loading
  useEffect(() => {
    try {
      setError(null);
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scene';
      if (import.meta.env.DEV) console.error('Failed to load scene dashboard', err);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  const categories = ['All', 'Models', 'Environments', 'Props', 'Animations'];

  const [sceneItems, setSceneItems] = useState<SceneItem[]>([
    {
      id: 'asset-1',
      name: '3D Model',
      description: 'High-fidelity 3D model with full material set.',
      type: 'Model',
      thumb: '/models/AdvancedExport/3DModel_Custom.jpg',
      modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
      category: 'Models',
      hasModel: true,
    },
  ]);

  // Load asset if ID is present
  useEffect(() => {
    const loadAsset = async () => {
      // Early return for 'new' or no ID
      if (!assetId || assetId === 'new') {
        setSelectedItem((prev) => {
          if (prev) return prev;
          // Auto-select first item if none selected
          return sceneItems.length > 0 ? sceneItems[0] : null;
        });
        return;
      }

      try {
        // Check if already in list
        const existing = sceneItems.find((i) => i.id === assetId);
        if (existing) {
          setSelectedItem(existing);
          return;
        }

        // Fetch from provider
        const asset = await AssetsProvider.get(assetId);
        if (asset) {
          const newItem: SceneItem = {
            id: asset.id,
            name: asset.name,
            description: asset.type || 'Imported Asset',
            type: asset.type || 'Model',
            thumb: (asset as { thumb?: string }).thumb || '',
            modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
            category: 'Models',
            hasModel: true,
          };
          setSceneItems((prev) => {
            // Prevent duplicates
            if (prev.some((i) => i.id === newItem.id)) return prev;
            return [...prev, newItem];
          });
          setSelectedItem(newItem);
          setActiveCategory('Models');
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('Failed to fetch asset', err);
      }
    };
    loadAsset();
  }, [assetId, sceneItems]);

  const filteredItems =
    activeCategory === 'All'
      ? sceneItems
      : sceneItems.filter((item) => item.category === activeCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">{t('scene.loadError')}</p>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            {t('scene.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-200 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="w-full z-50 bg-zinc-900 border-b border-zinc-800 flex-shrink-0 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            to="/app/dashboard"
            className="p-2 -ml-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            aria-label={t('scene.backToPortal')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            <div className="font-semibold text-base text-white">{t('scene.heading')}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300">
            {assetId && assetId !== 'new' ? `Asset ${assetId}` : 'Preview'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            aria-label={t('scene.searchAssets')}
          >
            <Search className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="h-6 w-px bg-zinc-800 mx-2"></div>
          <button
            onClick={() => setIsEditorExpanded(!isEditorExpanded)}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isEditorExpanded ? 'bg-brand-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            {isEditorExpanded ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
            {isEditorExpanded ? t('scene.collapseEditor') : t('scene.expandEditor')}
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {assetId === 'new' ? (
          <NewCaptureWizard />
        ) : (
          <>
            {/* LEFT PANEL: Asset List */}
            <div
              className={`
                bg-zinc-950 border-r border-zinc-800 transition-all duration-300 flex flex-col
                ${isEditorExpanded ? 'w-0 opacity-0 overflow-hidden' : 'w-full md:w-80 lg:w-96'}
              `}
            >
              {/* Categories */}
              <div className="p-2 border-b border-zinc-800 overflow-x-auto scrollbar-none flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeCategory === cat
                        ? 'bg-brand-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {cat === 'All' ? t('scene.allCategories') : cat}
                  </button>
                ))}
              </div>

              {/* Item List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Box className="w-10 h-10 text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-500 font-medium">{t('scene.noAssets')}</p>
                    <p className="text-xs text-zinc-600 mt-1">Add a scene asset to get started</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`
                        group flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all duration-200
                        ${
                          selectedItem?.id === item.id
                            ? 'bg-zinc-900 border-brand-600 ring-1 ring-brand-600/50'
                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                        }
                      `}
                    >
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                        {item.thumb ? (
                          <img
                            src={item.thumb}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Box className="w-5 h-5 text-zinc-600" />
                          </div>
                        )}
                        {selectedItem?.id === item.id && (
                          <div className="absolute inset-0 bg-brand-600/20 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="w-2 h-2 bg-brand-400 rounded-full shadow-lg shadow-brand-500/50" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-bold truncate ${selectedItem?.id === item.id ? 'text-white' : 'text-zinc-300'}`}
                        >
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 truncate">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-zinc-500 font-medium">{item.type}</span>
                          {item.hasModel && (
                            <span className="text-[8px] bg-zinc-800 text-brand-400 px-1.5 py-0.5 rounded border border-zinc-700 font-bold tracking-wide">
                              3D
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssetForQR({
                            id: item.id,
                            name: item.name,
                            thumb: item.thumb,
                            status: 'Published',
                          });
                        }}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-white transition-colors"
                        aria-label={t('scene.qrCode')}
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}

                <button className="w-full py-3 border border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900/50 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide">
                  <Plus className="w-4 h-4" /> {t('scene.addCapture')}
                </button>
              </div>
            </div>

            {/* RIGHT PANEL: Editor */}
            <div className="flex-1 bg-zinc-950 relative overflow-hidden flex flex-col">
              {selectedItem ? (
                <Suspense
                  fallback={
                    <div className="flex-1 flex items-center justify-center text-zinc-500">
                      <Box className="w-8 h-8 animate-pulse opacity-40" />
                    </div>
                  }
                >
                  <EmbeddedModelEditor
                    key={selectedItem.id}
                    assetId={selectedItem.id}
                    initialData={selectedItem}
                  />
                </Suspense>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                  <Box className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm font-medium">Select an asset to open the editor</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Choose a scene asset from the panel on the left
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <QRCodeModal
          isOpen={Boolean(selectedAssetForQR)}
          onClose={() => setSelectedAssetForQR(null)}
          asset={selectedAssetForQR}
        />
      </div>
    </div>
  );
};

export default SceneDashboard;
