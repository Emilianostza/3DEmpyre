import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, X } from 'lucide-react';

interface AssetUploaderProps {
  onUpload: (url: string, file: File) => void;
  maxSizeMB?: number; // default 50
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({ onUpload, maxSizeMB = 50 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // Mock progress
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Clean up interval and object URL on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFile = (file: File) => {
    setError(null);
    setProgress(0);

    // Validate type
    const isGlb = file.name.toLowerCase().endsWith('.glb');
    const isUsdz = file.name.toLowerCase().endsWith('.usdz');

    if (!isGlb && !isUsdz) {
      setError('Invalid file format. Please upload .glb or .usdz files.');
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    // Clean up previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    // Simulate upload progress
    let p = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        const url = URL.createObjectURL(file);
        objectUrlRef.current = url;
        onUpload(url, file);
      }
    }, 150);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [maxSizeMB, onUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-8">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-stone-700 hover:border-stone-500 bg-stone-900/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-6 pointer-events-none">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-amber-500 text-white' : 'bg-stone-800 text-stone-400'}`}
          >
            <Upload className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-stone-200">
              {isDragging ? 'Drop your 3D model here' : 'Drag & drop your 3D model'}
            </h3>
            <p className="text-stone-500 max-w-sm mx-auto">
              Supports .glb (preferred) and .usdz for AR preview. Max file size {maxSizeMB}MB.
            </p>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <label className="cursor-pointer bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-amber-900/20">
              Browse Files
              <input
                type="file"
                className="hidden"
                accept=".glb,.usdz"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        </div>

        {/* Progress Overlay */}
        {progress > 0 && progress < 100 && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl gap-4 z-10 transition-opactiy">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-amber-500 font-mono font-bold">Uploading... {progress}%</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto hover:text-white"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
