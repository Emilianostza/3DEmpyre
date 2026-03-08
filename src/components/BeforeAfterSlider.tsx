import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  beforeAlt: string;
  afterSrc: string;
  afterAlt: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

/**
 * Draggable before/after comparison slider.
 * Renders `before` image clipped to the left portion
 * and `after` image behind it.  The divider is draggable
 * via mouse, touch, and keyboard (left/right arrows).
 */
const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeSrc,
  beforeAlt,
  afterSrc,
  afterAlt,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = '',
}) => {
  const [position, setPosition] = useState(50); // 0-100
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Update position from pointer X ─────────────────── */
  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(2, Math.min(98, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  /* ── Mouse & Touch (single effect to avoid shared-ref race) ── */
  const onPointerStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      updatePosition(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.touches[0].clientX);
    };
    const onPointerEnd = () => {
      isDragging.current = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onPointerEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onPointerEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onPointerEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onPointerEnd);
    };
  }, [updatePosition]);

  /* ── Keyboard (a11y) ────────────────────────────────── */
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPosition((p) => Math.max(2, p - 2));
    else if (e.key === 'ArrowRight') setPosition((p) => Math.min(98, p + 2));
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-zinc-800/80 select-none ${className}`}
      style={{ touchAction: 'pan-y' }}
      {...(import.meta.env.DEV && {
        'data-component': 'BeforeAfterSlider',
        'data-file': 'src/components/BeforeAfterSlider.tsx',
      })}
    >
      {/* ── After (background, full) ────────────────────── */}
      <img
        src={afterSrc}
        alt={afterAlt}
        className="w-full h-full object-cover"
        loading="lazy"
        width={800}
        height={500}
        draggable={false}
      />

      {/* ── Before (clipped overlay) ────────────────────── */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img
          src={beforeSrc}
          alt={beforeAlt}
          className="h-full object-cover"
          style={{ width: containerWidth || '100%' }}
          loading="lazy"
          width={800}
          height={500}
          draggable={false}
        />
      </div>

      {/* ── Labels ──────────────────────────────────────── */}
      <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400 pointer-events-none">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-brand-600/80 backdrop-blur-sm border border-brand-500/40 text-[10px] font-bold uppercase tracking-widest text-white pointer-events-none">
        {afterLabel}
      </div>

      {/* ── Divider handle ──────────────────────────────── */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        {/* Vertical line */}
        <div className="absolute inset-0 w-0.5 bg-white/80 mx-auto" />

        {/* Draggable grip */}
        <button
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg shadow-black/30 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          onMouseDown={onPointerStart}
          onTouchStart={onPointerStart}
          onKeyDown={onKeyDown}
          aria-label="Drag to compare before and after"
          aria-valuenow={Math.round(position)}
          aria-valuemin={0}
          aria-valuemax={100}
          role="slider"
          tabIndex={0}
        >
          <GripVertical className="w-4 h-4 text-zinc-700" />
        </button>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
