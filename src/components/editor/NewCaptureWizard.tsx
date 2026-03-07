import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Check, Camera, ArrowRight } from 'lucide-react';
import { AssetsProvider } from '@/services/dataProvider';
import { placeholder } from '@/config/site';

export const NewCaptureWizard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'processing' | 'complete'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const startProcessing = async () => {
    if (files.length === 0) return;

    setStep('processing');

    // Simulate upload
    setProcessingStage('Uploading images...');
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise((r) => setTimeout(r, 200));
    }

    // Simulate processing stages
    setProgress(0);
    setProcessingStage('Analyzing geometry...');
    await new Promise((r) => setTimeout(r, 1500));
    setProgress(30);

    setProcessingStage('Generating point cloud...');
    await new Promise((r) => setTimeout(r, 1500));
    setProgress(60);

    setProcessingStage('Creating mesh & textures...');
    await new Promise((r) => setTimeout(r, 1500));
    setProgress(100);

    // Create asset
    try {
      const newAsset = await AssetsProvider.create({
        name: `New Capture ${new Date().toLocaleTimeString()}`,
        type: 'Photogrammetry Scan',
        status: 'Processing',
        thumb: placeholder(200, 200, 'New Capture', 45),
      });

      setStep('complete');
      setTimeout(() => {
        navigate(`/app/editor/${newAsset.id}`);
      }, 1500);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to create asset', error);
      setStep('upload'); // Reset on error
    }
  };

  return (
    <div className="flex-1 bg-stone-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {step === 'upload' && (
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <Camera className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Create New 3D Model</h1>
              <p className="text-stone-400">Upload 20-50 photos of your object from all angles.</p>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-700 hover:border-amber-500/50 hover:bg-stone-800/50 rounded-xl p-12 text-center cursor-pointer transition-all group"
            >
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <Upload className="w-10 h-10 text-stone-500 group-hover:text-amber-500 mx-auto mb-4 transition-colors" />
              <p className="font-medium text-stone-300 group-hover:text-amber-500 transition-colors">
                Click to upload photos
              </p>
              <p className="text-sm text-stone-500 mt-2">or drag and drop them here</p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-stone-400">
                    {files.length} Photos Selected
                  </span>
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs text-red-500 hover:text-red-400"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="relative group aspect-square bg-stone-800 rounded-lg overflow-hidden border border-stone-700"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${i}`}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(i);
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* Add more button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-stone-800/50 hover:bg-stone-800 rounded-lg border border-stone-700 border-dashed flex items-center justify-center text-stone-500 hover:text-amber-500 transition-all"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-stone-800 flex justify-end gap-4">
              <button
                onClick={() => navigate('/app/dashboard')}
                className="px-6 py-3 rounded-xl font-bold text-stone-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={files.length === 0}
                onClick={startProcessing}
                className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2"
              >
                Generate 3D Model <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-stone-800 rounded-full"></div>
              <div
                className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"
                style={{ animationDuration: '2s' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-white">
                {progress}%
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{processingStage}</h2>
            <p className="text-stone-400 max-w-md mx-auto">
              This process usually takes a few minutes. We&apos;re reconstructing geometry from your
              photos using AI photogrammetry.
            </p>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Model Generated!</h2>
            <p className="text-stone-400 mb-8">Redirecting to editor...</p>
          </div>
        )}
      </div>
    </div>
  );
};
