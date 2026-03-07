import React, { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Palette } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useToast } from '@/contexts/ToastContext';
import { Project } from '@/types';

export interface MenuSettings {
  title: string;
  brandColor: string;
  font: string;
  showPrices: boolean;
  currency: string;
}

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    client: string;
    type: string;
    description: string;
    dueDate: string;
    priority: string;
    address: string;
    phone: string;
  }) => Promise<void>;
  project?: Project | null;
  menuSettings?: MenuSettings;
  onSaveMenuSettings?: (settings: MenuSettings) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
  menuSettings: initialMenuSettings,
  onSaveMenuSettings,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [type, setType] = useState('standard');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; client?: string }>({});
  const [mSettings, setMSettings] = useState<MenuSettings>({
    title: '',
    brandColor: '#d97706',
    font: 'Inter',
    showPrices: true,
    currency: '$',
  });
  const { success, error } = useToast();
  useEscapeKey(
    useCallback(() => onClose(), [onClose]),
    isOpen
  );
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Only reset form when the modal opens — not while it is already open
  // This prevents a parent re-render (new project object reference) from wiping user edits
  useEffect(() => {
    if (!isOpen) return;
    setFieldErrors({});
    if (project) {
      setName(project.name);
      setClient(project.client);
      setType(project.type || 'standard');
      setAddress(project.address || '');
      setPhone(project.phone || '');
      setDescription('');
      setDueDate('');
      setPriority('Medium');
      setMSettings(
        initialMenuSettings ?? {
          title: project.name || '',
          brandColor: '#d97706',
          font: 'Inter',
          showPrices: true,
          currency: '$',
        }
      );
    } else {
      setName('');
      setClient('');
      setType('standard');
      setAddress('');
      setPhone('');
      setDescription('');
      setDueDate('');
      setPriority('Medium');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; client?: string } = {};
    if (!name.trim()) errors.name = t('newProject.error.nameRequired', 'Menu title is required');
    if (!client.trim()) errors.client = t('newProject.error.clientRequired', 'Client is required');
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await onSave({ name, client, type, description, dueDate, priority, address, phone });
      if (project && onSaveMenuSettings) {
        onSaveMenuSettings(mSettings);
      }
      if (!project) {
        // Only show success toast here if creating? Or let parent handle it?
        // Parent handles refresh.
        // Reset form if creating
        setName('');
        setClient('');
        setType('standard');
        setAddress('');
        setPhone('');
        setDescription('');
        setDueDate('');
        setPriority('Medium');
      }
      success(project ? t('newProject.toast.updated', { name }) : t('newProject.toast.created', { name }));
      onClose();
    } catch (err) {
      error(project ? t('newProject.toast.updateFailed') : t('newProject.toast.createFailed'));
      if (import.meta.env.DEV)
        console.error(`Failed to ${project ? 'update' : 'create'} project`, err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-project-title"
    >
      <div
        className="absolute inset-0 bg-transparent pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={trapRef}
        className="relative pointer-events-auto bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 border-b border-brand-200 dark:border-brand-700 p-6">
          <h2
            id="new-project-title"
            className="text-xl font-bold text-zinc-900 dark:text-white mb-1"
          >
            {project ? t('newProject.updateProject') : t('newProject.newCaptureProject')}
          </h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-400">
            {project ? t('newProject.editDescription') : t('newProject.createDescription')}
          </p>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Essential Fields Section */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="new-project-name"
                className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2"
              >
                {t('newProject.menuTitle', 'Menu Title')} <span className="text-red-500">*</span>
              </label>
              <input
                id="new-project-name"
                type="text"
                required
                autoFocus
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby="new-project-name-hint"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 ${fieldErrors.name ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}
                placeholder="e.g. Summer Collection 2026"
                value={name}
                onChange={(e) => { setName(e.target.value); if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined })); }}
              />
              <p id="new-project-name-hint" className={`text-xs mt-1 ${fieldErrors.name ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {fieldErrors.name || t('newProject.whatCapturing')}
              </p>
            </div>

            <div>
              <label
                htmlFor="new-project-client"
                className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2"
              >
                {t('newProject.clientOrganization')} <span className="text-red-500">*</span>
              </label>
              <input
                id="new-project-client"
                type="text"
                required
                aria-invalid={Boolean(fieldErrors.client)}
                aria-describedby="new-project-client-hint"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 ${fieldErrors.client ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}
                placeholder="e.g. Acme Corp"
                value={client}
                onChange={(e) => { setClient(e.target.value); if (fieldErrors.client) setFieldErrors((p) => ({ ...p, client: undefined })); }}
              />
              <p id="new-project-client-hint" className={`text-xs mt-1 ${fieldErrors.client ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {fieldErrors.client || t('newProject.whoCommissioning')}
              </p>
            </div>
          </div>

          {/* Details Section */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-400 uppercase tracking-wide mb-4">
              {t('newProject.projectDetails')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  {t('newProject.category')}
                </label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-700/60">
                  <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{type}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="new-project-location"
                    className="block text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2"
                  >
                    {t('newProject.location')}
                  </label>
                  <input
                    id="new-project-location"
                    type="text"
                    className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400"
                    placeholder="City, State"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-project-phone"
                    className="block text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2"
                  >
                    {t('newProject.contact')}
                  </label>
                  <input
                    id="new-project-phone"
                    type="tel"
                    className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Menu Settings — only when editing an existing project */}
          {project && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
              <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" /> {t('portal.menuSettings.title', 'Menu Settings')}
              </h3>

              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-1.5">
                  {t('portal.menuSettings.currency', 'Currency')}
                </label>
                <select
                  value={mSettings.currency}
                  onChange={(e) => setMSettings({ ...mSettings, currency: e.target.value })}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                >
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="¥">JPY (¥)</option>
                </select>
              </div>

            </div>
          )}

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-700 dark:text-zinc-400 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {t('newProject.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !client.trim()}
              className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? project
                  ? t('newProject.updating')
                  : t('newProject.creating')
                : project
                  ? t('newProject.updateProject')
                  : t('newProject.createProject')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
