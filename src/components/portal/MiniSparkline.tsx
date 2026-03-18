import React, { useMemo } from 'react';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showDot?: boolean;
}

function buildPath(data: number[], width: number, height: number): string {
  if (data.length < 2) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const usableHeight = height - padding * 2;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * step,
    y: padding + usableHeight - ((v - min) / range) * usableHeight,
  }));

  // Build smooth cubic bezier path
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color = 'var(--brand-600, #7c3aed)',
  width = 80,
  height = 28,
  showDot = true,
}) => {
  const path = useMemo(() => buildPath(data, width, height), [data, width, height]);

  if (data.length < 2) return null;

  const lastPoint = (() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const usableHeight = height - padding * 2;
    const step = width / (data.length - 1);
    const lastIdx = data.length - 1;
    return {
      x: lastIdx * step,
      y: padding + usableHeight - ((data[lastIdx] - min) / range) * usableHeight,
    };
  })();

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className="flex-shrink-0">
      <path d={path} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {showDot && (
        <circle cx={lastPoint.x} cy={lastPoint.y} r={2.5} fill={color} />
      )}
    </svg>
  );
};
