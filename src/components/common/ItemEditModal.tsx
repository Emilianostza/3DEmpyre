import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, EyeOff, Check, ChevronDown, Save } from 'lucide-react';
import type { MenuItemDTO } from '@/types/dtos';
import { tagStyle } from './DishCardContent';

// ─── Constants ──────────────────────────────────────────────────────────────

const INPUT_CLASS =
  'w-full px-3 py-2 bg-stone-800/50 border border-stone-700/40 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all';

const COMMON_TAGS = [
  "Chef's Pick", 'Bestseller', 'Signature', 'New', 'Seasonal',
  'Spicy', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Organic',
  'Raw', 'Shareable', 'Premium', 'Classic', 'House Special',
  'Low Carb', 'Keto', 'Sugar-Free', 'Dairy-Free', 'Halal',
] as const;

const COMMON_ALLERGENS = [
  'Milk', 'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Crustaceans',
  'Tree Nuts', 'Peanuts', 'Wheat', 'Gluten', 'Soy', 'Sesame',
  'Celery', 'Mustard', 'Lupin', 'Molluscs', 'Sulphites', 'Corn',
] as const;

// ─── Types ──────────────────────────────────────────────────────────────────

interface DraftItem {
  name: string;
  desc: string;
  price: string;
  calories: string;
  tags: string;
  allergens: string;
  category: string;
}

export interface ItemEditModalProps {
  item: MenuItemDTO;
  brandColor?: string;
  onSave: (updated: Partial<MenuItemDTO>) => void;
  onClose: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const ItemEditModal: React.FC<ItemEditModalProps> = ({
  item,
  brandColor = 'var(--color-brand-500, #8b5cf6)',
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<DraftItem>({
    name: item.name,
    desc: item.desc,
    price: item.price,
    calories: item.calories,
    tags: item.tags.join(', '),
    allergens: item.allergens.join(', '),
    category: item.category,
  });

  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [allergenDropdownOpen, setAllergenDropdownOpen] = useState(false);
  const tagRef = useRef<HTMLDivElement>(null);
  const allergenRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click-outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tagDropdownOpen && tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
      }
      if (allergenDropdownOpen && allergenRef.current && !allergenRef.current.contains(e.target as Node)) {
        setAllergenDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [tagDropdownOpen, allergenDropdownOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    const updated: Partial<MenuItemDTO> = {
      id: item.id,
      name: draft.name,
      desc: draft.desc,
      price: draft.price,
      calories: draft.calories,
      category: draft.category,
      tags: draft.tags.split(',').map((s) => s.trim()).filter(Boolean),
      allergens: draft.allergens.split(',').map((s) => s.trim()).filter(Boolean),
    };
    onSave(updated);
  };

  const selectedTags = draft.tags.split(',').map((s) => s.trim()).filter(Boolean);
  const selectedAllergens = draft.allergens.split(',').map((s) => s.trim()).filter(Boolean);

  const toggleTag = (tag: string) => {
    const current = selectedTags;
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    setDraft((prev) => ({ ...prev, tags: updated.join(', ') }));
  };

  const toggleAllergen = (a: string) => {
    const current = selectedAllergens;
    const updated = current.includes(a)
      ? current.filter((t) => t !== a)
      : [...current, a];
    setDraft((prev) => ({ ...prev, allergens: updated.join(', ') }));
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 120 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-stone-900 border border-stone-700/60 rounded-2xl shadow-2xl shadow-black/50 overflow-auto flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left column: item showcase ── */}
        <div className="md:w-[320px] flex-shrink-0 bg-stone-950/60 border-b md:border-b-0 md:border-r border-stone-800/60 flex flex-col">
          {/* Image hero */}
          <div className="relative aspect-[4/3] md:aspect-auto md:h-48 bg-stone-800 overflow-hidden">
            {item.image ? (
              <img
                src={item.image}
                alt={draft.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-600 text-sm">
                No image
              </div>
            )}
            {item.model_url && (
              <div
                className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md text-white uppercase tracking-wider"
                style={{ backgroundColor: `${brandColor}e0` }}
              >
                3D Asset
              </div>
            )}
          </div>

          {/* Live preview */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="text-base font-bold text-white leading-tight">
                  {draft.name || item.name}
                </h2>
                <span
                  className="text-base font-bold font-mono flex-shrink-0"
                  style={{ color: brandColor }}
                >
                  {draft.price || item.price}
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                {draft.desc || item.desc}
              </p>
            </div>

            {/* Tags preview */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${tagStyle(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata preview */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {draft.calories && (
                <div className="bg-stone-800/60 rounded-lg px-2.5 py-1.5 border border-stone-700/30">
                  <span className="text-stone-500 uppercase tracking-wider">Calories</span>
                  <div className="text-stone-200 font-medium mt-0.5">{draft.calories}</div>
                </div>
              )}
              {selectedAllergens.length > 0 && (
                <div className="bg-stone-800/60 rounded-lg px-2.5 py-1.5 border border-stone-700/30">
                  <span className="text-stone-500 uppercase tracking-wider">Allergens</span>
                  <div className="text-stone-200 font-medium mt-0.5">
                    {selectedAllergens.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column: edit form ── */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800/60 bg-stone-900/80 px-6 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Edit Details</h3>
              <span className="text-xs text-stone-500">
                Modify all product information line by line.
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 text-stone-500 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Item Name
              </label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                className={INPUT_CLASS}
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                placeholder="e.g., Wagyu Burger"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Description
              </label>
              <textarea
                value={draft.desc}
                onChange={(e) => setDraft((prev) => ({ ...prev, desc: e.target.value }))}
                rows={3}
                className={`${INPUT_CLASS} resize-none`}
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                placeholder="Detailed description of the item..."
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Price
              </label>
              <input
                type="text"
                value={draft.price}
                onChange={(e) => setDraft((prev) => ({ ...prev, price: e.target.value }))}
                className={INPUT_CLASS}
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                placeholder="e.g., $24"
              />
            </div>

            {/* Calories */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Calories
              </label>
              <input
                type="text"
                value={draft.calories}
                onChange={(e) => setDraft((prev) => ({ ...prev, calories: e.target.value }))}
                className={INPUT_CLASS}
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                placeholder="e.g., 650"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Tags
              </label>
              <div ref={tagRef} className="relative">
                <button
                  type="button"
                  onClick={() => setTagDropdownOpen((v) => !v)}
                  className={`${INPUT_CLASS} flex items-center justify-between gap-2 text-left w-full`}
                  style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                >
                  <span className={selectedTags.length > 0 ? 'text-white truncate' : 'text-stone-500 truncate'}>
                    {selectedTags.length > 0 ? selectedTags.join(', ') : 'Select tags...'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-500 flex-shrink-0 transition-transform ${tagDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Selected pills */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleTag(tag); }}
                          className="hover:text-brand-300 transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag dropdown */}
                {tagDropdownOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-stone-900 border border-stone-700/60 rounded-lg shadow-xl shadow-black/40 max-h-48 overflow-y-auto scrollbar-none">
                    {COMMON_TAGS.map((tag) => {
                      const selected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors ${
                            selected
                              ? 'bg-brand-500/10 text-brand-400'
                              : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                            selected ? 'border-brand-500 bg-brand-500' : 'border-stone-600'
                          }`}>
                            {selected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Allergens */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Allergens
              </label>
              <div ref={allergenRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAllergenDropdownOpen((v) => !v)}
                  className={`${INPUT_CLASS} flex items-center justify-between gap-2 text-left w-full`}
                  style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                >
                  <span className={selectedAllergens.length > 0 ? 'text-white truncate' : 'text-stone-500 truncate'}>
                    {selectedAllergens.length > 0 ? selectedAllergens.join(', ') : 'Select allergens...'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-500 flex-shrink-0 transition-transform ${allergenDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Selected pills */}
                {selectedAllergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectedAllergens.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-medium"
                      >
                        {a}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleAllergen(a); }}
                          className="hover:text-red-300 transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Allergen dropdown */}
                {allergenDropdownOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-stone-900 border border-stone-700/60 rounded-lg shadow-xl shadow-black/40 max-h-48 overflow-y-auto scrollbar-none">
                    {COMMON_ALLERGENS.map((a) => {
                      const selected = selectedAllergens.includes(a);
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleAllergen(a)}
                          className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors ${
                            selected
                              ? 'bg-red-500/10 text-red-400'
                              : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                            selected ? 'border-red-500 bg-red-500' : 'border-stone-600'
                          }`}>
                            {selected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          {a}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer with Save */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-800/60 bg-stone-950/40">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 hover:brightness-110"
              style={{ backgroundColor: brandColor }}
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

ItemEditModal.displayName = 'ItemEditModal';
