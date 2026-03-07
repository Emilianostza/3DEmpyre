import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling, { Options } from 'qr-code-styling';

interface QRCodeDisplayProps {
  url: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  options?: Partial<Options>;
  onReady?: (qrCode: QRCodeStyling) => void;
}

/**
 * Unified QR Code Display Component
 * Uses qr-code-styling to generate highly customizable artistic QR codes
 * Supports multiple sizes with glassmorphism design
 */
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  url,
  size = 'md',
  label,
  className = '',
  options = {},
  onReady,
}) => {
  // Size mapping: sm=128, md=192, lg=256
  const sizeMap = {
    sm: { w: 'w-32', h: 'h-32', pixels: 128 },
    md: { w: 'w-48', h: 'h-48', pixels: 192 },
    lg: { w: 'w-64', h: 'h-64', pixels: 256 },
  };

  const sizeConfig = sizeMap[size];
  const ref = useRef<HTMLDivElement>(null);

  // Create the instance once
  const [qrCode] = useState<QRCodeStyling>(() => new QRCodeStyling({
    width: sizeConfig.pixels,
    height: sizeConfig.pixels,
    type: "svg",
    data: url,
    dotsOptions: {
      color: "#000000",
      type: "rounded"
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    cornersSquareOptions: {
      type: "extra-rounded" // Default artistic feel
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 10
    }
  }));

  // Append to DOM on mount
  useEffect(() => {
    if (ref.current) {
      // Clear any existing children before appending to avoid duplicates in StrictMode
      ref.current.innerHTML = '';
      qrCode.append(ref.current);
    }
  }, [qrCode, ref]);

  // Update options when props change
  useEffect(() => {
    qrCode.update({
      data: url,
      width: sizeConfig.pixels,
      height: sizeConfig.pixels,
      ...options
    });

    if (onReady) {
      onReady(qrCode);
    }
  }, [qrCode, url, sizeConfig.pixels, options, onReady]);

  return (
    <div className={className}>
      <div
        className={`${sizeConfig.w} ${sizeConfig.h} bg-white dark:bg-white/10 rounded-2xl p-3 shadow-lg dark:shadow-2xl dark:shadow-black/50 border border-white/[0.06] backdrop-blur-sm flex items-center justify-center`}
        aria-label={label ? `QR Code for ${label}` : 'QR Code'}
      >
        <div ref={ref} className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>canvas]:max-w-full" />
      </div>
    </div>
  );
};
