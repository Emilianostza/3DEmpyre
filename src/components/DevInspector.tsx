/**
 * DevInspector — Right-click any element to auto-copy its location info.
 *
 * DEV-ONLY: This component is completely stripped from production builds.
 * It intercepts right-click (contextmenu) events, walks up the DOM tree
 * to collect rich context (file, component, section, DOM breadcrumb,
 * element state, data attributes, nearby siblings, computed styles) and
 * copies a structured multi-line block to the clipboard for pasting to Claude.
 *
 * Hold Shift + right-click to get the normal browser context menu.
 */
import { useEffect, useState, useCallback, useRef } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Walk up the DOM tree to find the nearest data-* attribute */
function findAncestorData(el: HTMLElement, attr: string): string {
  let current: HTMLElement | null = el;
  while (current) {
    const val = current.getAttribute(attr);
    if (val) return val;
    current = current.parentElement;
  }
  return '';
}

/** Short readable selector for one element */
function describeNode(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  if (tag === 'body' || tag === 'html') return tag;
  const id = el.id ? `#${el.id}` : '';
  const role = el.getAttribute('role');
  const ariaLabel = el.getAttribute('aria-label');
  const section = el.getAttribute('data-section');
  const component = el.getAttribute('data-component');

  let s = tag + id;
  if (role) s += `[role="${role}"]`;
  if (ariaLabel) s += `[aria-label="${ariaLabel}"]`;
  if (section) s += `[data-section="${section}"]`;
  if (component) s += `[data-component="${component}"]`;
  return s;
}

/** Build a breadcrumb trail from target up to the body, keeping only meaningful nodes */
function buildBreadcrumb(el: HTMLElement): string {
  const parts: string[] = [];
  let cur: HTMLElement | null = el;
  while (cur && cur.tagName.toLowerCase() !== 'html') {
    const tag = cur.tagName.toLowerCase();
    const isMeaningful =
      cur === el ||
      cur.id ||
      cur.getAttribute('role') ||
      cur.getAttribute('data-section') ||
      cur.getAttribute('data-component') ||
      cur.getAttribute('data-file') ||
      ['section', 'nav', 'main', 'header', 'footer', 'article', 'aside', 'form', 'dialog'].includes(
        tag
      );
    if (isMeaningful) parts.unshift(describeNode(cur));
    cur = cur.parentElement;
  }
  return parts.join(' → ');
}

/** Get all data-* attributes on an element */
function _getDataAttrs(el: HTMLElement): Record<string, string> {
  const out: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    if (attr.name.startsWith('data-')) out[attr.name] = attr.value;
  }
  return out;
}

/** Get ARIA / interaction state */
function _getElementState(el: HTMLElement): Record<string, string> {
  const state: Record<string, string> = {};
  const checks = [
    'aria-selected',
    'aria-expanded',
    'aria-checked',
    'aria-disabled',
    'aria-pressed',
    'aria-current',
    'aria-hidden',
    'disabled',
    'open',
    'href',
    'type',
    'name',
    'value',
  ];
  for (const a of checks) {
    const v = el.getAttribute(a);
    if (v !== null) state[a] = v;
  }
  if ((el as HTMLInputElement).checked !== undefined && el.tagName === 'INPUT') {
    state['checked'] = String((el as HTMLInputElement).checked);
  }
  return state;
}

/** Get direct visible text, truncated */
function getVisibleText(el: HTMLElement): string {
  const directText = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent?.trim())
    .filter(Boolean)
    .join(' ');
  const text = directText || el.textContent?.trim() || '';
  return text.length > 100 ? text.slice(0, 97) + '...' : text;
}

/** Describe nearby siblings for extra context */
function _describeSiblings(el: HTMLElement): { prev: string; next: string } {
  const prev = el.previousElementSibling as HTMLElement | null;
  const next = el.nextElementSibling as HTMLElement | null;
  const describe = (sib: HTMLElement | null): string => {
    if (!sib) return '';
    const text = sib.textContent?.trim().slice(0, 50) || '';
    return `${describeNode(sib)}${text ? ` "${text}"` : ''}`;
  };
  return { prev: describe(prev), next: describe(next) };
}

/** Grab a few useful computed styles */
function getKeyStyles(el: HTMLElement): Record<string, string> {
  const cs = getComputedStyle(el);
  const pick: Record<string, string> = {};
  const props = [
    'color',
    'background-color',
    'font-size',
    'font-weight',
    'position',
    'display',
    'gap',
    'padding',
    'border-radius',
    'opacity',
    'z-index',
  ];
  for (const p of props) {
    const v = cs.getPropertyValue(p);
    if (
      v &&
      v !== 'normal' &&
      v !== 'auto' &&
      v !== 'none' &&
      v !== '0px' &&
      v !== 'visible' &&
      v !== '1' &&
      v !== 'static'
    ) {
      pick[p] = v;
    }
  }
  return pick;
}

/** Get abbreviated Tailwind class list */
function getClasses(el: HTMLElement): string {
  const classes = el.className;
  if (typeof classes !== 'string') return '';
  return classes.length > 200 ? classes.slice(0, 197) + '...' : classes;
}

/** Get bounding box summary */
function getBounds(el: HTMLElement): string {
  const r = el.getBoundingClientRect();
  return `${Math.round(r.width)}×${Math.round(r.height)} at (${Math.round(r.left)}, ${Math.round(r.top)})`;
}

// ── Format ────────────────────────────────────────────────────────────────────

function formatForClipboard(el: HTMLElement): string {
  const file = findAncestorData(el, 'data-file');
  const component = findAncestorData(el, 'data-component');
  const breadcrumb = buildBreadcrumb(el);
  const text = getVisibleText(el);
  const classes = getClasses(el);
  const styles = getKeyStyles(el);
  const bounds = getBounds(el);

  const lines: string[] = [];

  if (file) lines.push(`File:       ${file}`);
  if (component) lines.push(`Component:  ${component}`);
  lines.push(`Path:       ${breadcrumb}`);
  lines.push(`Element:    ${describeNode(el)}`);
  if (text) lines.push(`Text:       "${text}"`);
  lines.push(`Size:       ${bounds}`);
  if (classes) lines.push(`Classes:    ${classes}`);

  const styleKeys = Object.keys(styles);
  if (styleKeys.length) {
    lines.push(`Styles:     ${styleKeys.map((k) => `${k}: ${styles[k]}`).join('; ')}`);
  }

  return lines.join('\n');
}

/** Short summary for the toast */
function shortSummary(el: HTMLElement): string {
  const component = findAncestorData(el, 'data-component');
  const section = findAncestorData(el, 'data-section');
  const tag = el.tagName.toLowerCase();
  const text = getVisibleText(el).slice(0, 30);
  return [component, section, tag, text ? `"${text}"` : ''].filter(Boolean).join(' › ');
}

/** Toast notification component */
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '20px'})`,
        opacity: visible ? 1 : 0,
        transition: 'all 0.2s ease-out',
        zIndex: 99999,
        pointerEvents: 'none',
        maxWidth: '90vw',
      }}
    >
      <div
        style={{
          background: '#18181b',
          border: '1px solid #7c3aed',
          borderRadius: '12px',
          padding: '10px 16px',
          color: '#e4e4e7',
          fontSize: '13px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
          lineHeight: '1.5',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(124, 58, 237, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <span style={{ color: '#a78bfa', fontWeight: 600, flexShrink: 0 }}>Copied</span>
        <span style={{ color: '#71717a', flexShrink: 0 }}>|</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{message}</span>
      </div>
    </div>
  );
}

/** Blue outline highlight on the inspected element */
function Highlight({ rect, visible }: { rect: DOMRect | null; visible: boolean }) {
  if (!rect || !visible) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: rect.top - 2,
        left: rect.left - 2,
        width: rect.width + 4,
        height: rect.height + 4,
        border: '2px solid #7c3aed',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 99998,
        transition: 'all 0.15s ease-out',
        boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.2)',
      }}
    />
  );
}

export default function DevInspector() {
  const [toast, setToast] = useState({ message: '', visible: false });
  const [highlight, setHighlight] = useState<{ rect: DOMRect | null; visible: boolean }>({
    rect: null,
    visible: false,
  });
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    // Shift + right-click = normal browser menu
    if (e.shiftKey) return;

    e.preventDefault();

    const target = e.target as HTMLElement;
    if (!target) return;

    const formatted = formatForClipboard(target);

    // Copy to clipboard
    navigator.clipboard.writeText(formatted).then(() => {
      // Show highlight
      const rect = target.getBoundingClientRect();
      setHighlight({ rect, visible: true });

      // Show toast with short summary
      const shortMsg = shortSummary(target);
      setToast({ message: shortMsg, visible: true });

      // Clear any previous hide timer so rapid clicks don't conflict
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      // Hide after 2 seconds
      hideTimerRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
        setHighlight((prev) => ({ ...prev, visible: false }));
      }, 2000);
    });
  }, []);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [handleContextMenu]);

  return (
    <>
      <Highlight rect={highlight.rect} visible={highlight.visible} />
      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}
