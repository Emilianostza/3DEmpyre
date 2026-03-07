import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, UserCheck, MapPin, Calendar, Users, Search, Clock, CheckCircle2 } from 'lucide-react';
import { Project } from '@/types';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useEscapeKey } from '@/hooks/useEscapeKey';

// ── Types ────────────────────────────────────────────────────

interface Technician {
  id: string;
  name: string;
  email: string;
  region: string;
  activeProjects: number;
  completedProjects: number;
  avgRating: number;
  available: boolean;
}

interface AssignTechnicianModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onAssign: (projectId: string, technicianId: string, scheduledDate: string) => void;
}

// ── Mock Technicians ─────────────────────────────────────────

const TECHNICIANS: Technician[] = [
  {
    id: 'tech-001',
    name: 'Marcus Weber',
    email: 'marcus@3dempyre.com',
    region: 'Western Europe',
    activeProjects: 2,
    completedProjects: 47,
    avgRating: 4.9,
    available: true,
  },
  {
    id: 'tech-002',
    name: 'Elena Papadopoulos',
    email: 'elena@3dempyre.com',
    region: 'Southern Europe',
    activeProjects: 1,
    completedProjects: 38,
    avgRating: 4.8,
    available: true,
  },
  {
    id: 'tech-003',
    name: 'Andrei Tamm',
    email: 'andrei@3dempyre.com',
    region: 'Northern Europe',
    activeProjects: 3,
    completedProjects: 52,
    avgRating: 4.7,
    available: true,
  },
  {
    id: 'tech-004',
    name: 'Sophie Laurent',
    email: 'sophie@3dempyre.com',
    region: 'Western Europe',
    activeProjects: 4,
    completedProjects: 29,
    avgRating: 4.6,
    available: false,
  },
];

// ── Helpers ──────────────────────────────────────────────────

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
];

// ── Component ────────────────────────────────────────────────

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  isOpen,
  project,
  onClose,
  onAssign,
}) => {
  const { t } = useTranslation();
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assigning, setAssigning] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);

  useEscapeKey(onClose, isOpen);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && project) {
      setSelectedTechId(project.assigned_to ?? null);
      setScheduledDate('');
      setSearchTerm('');
      setAssigning(false);
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const filteredTechnicians = TECHNICIANS.filter(
    (t) =>
      !searchTerm ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedTechId) return;
    setAssigning(true);
    // Simulate async
    await new Promise((resolve) => setTimeout(resolve, 800));
    onAssign(project.id, selectedTechId, scheduledDate);
    setAssigning(false);
    onClose();
  };

  const selectedTech = TECHNICIANS.find((t) => t.id === selectedTechId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-tech-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
              <UserCheck className="w-4.5 h-4.5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2
                id="assign-tech-title"
                className="text-base font-bold text-zinc-900 dark:text-white"
              >
                {t('assignTech.title')}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {project.name} · {project.client}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Info Strip */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          {project.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {project.address}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {project.items} {t('assignTech.items')}
          </span>
          {project.assigned_to && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> {t('assignTech.currentlyAssigned')}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t('assignTech.searchPlaceholder')}
              aria-label={t('assignTech.searchPlaceholder', 'Search technicians')}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Technician List */}
        <div className="px-6 pb-3 max-h-[280px] overflow-y-auto">
          <div className="space-y-2 mt-2">
            {filteredTechnicians.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-sm">
                {t('assignTech.noMatch')}
              </div>
            ) : (
              filteredTechnicians.map((tech, i) => {
                const isSelected = selectedTechId === tech.id;
                return (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTechId(tech.id)}
                    disabled={!tech.available}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500/30'
                        : tech.available
                          ? 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                          : 'border-zinc-100 dark:border-zinc-800 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                    >
                      {getInitials(tech.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                          {tech.name}
                        </span>
                        {!tech.available && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                            {t('assignTech.busy')}
                          </span>
                        )}
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {tech.region}
                        </span>
                        <span>
                          {tech.activeProjects} {t('assignTech.active')}
                        </span>
                        <span>
                          {tech.completedProjects} {t('assignTech.completed')}
                        </span>
                        <span className="text-amber-500">★ {tech.avgRating}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Schedule Date */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <label htmlFor="assign-tech-schedule-date" className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            <Calendar className="w-3 h-3 inline mr-1" />
            {t('assignTech.scheduleCaptureDate')}
          </label>
          <input
            id="assign-tech-schedule-date"
            type="date"
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
          <div className="text-xs text-zinc-400 dark:text-zinc-500">
            {selectedTech ? (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t('assignTech.selected')}:{' '}
                <strong className="text-zinc-700 dark:text-zinc-300">{selectedTech.name}</strong>
              </span>
            ) : (
              t('assignTech.selectPrompt')
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {t('assignTech.cancel')}
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedTechId || assigning}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white disabled:text-zinc-500 dark:disabled:text-zinc-400 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              {assigning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('assignTech.assigning')}
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  {t('assignTech.assign')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
