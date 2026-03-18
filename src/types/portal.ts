import { useOutletContext } from 'react-router-dom';
import type { Asset, Project } from '@/types';

export interface PortalOutletContext {
  role: 'employee' | 'customer';
  projects: Project[];
  assets: Asset[];
  loading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
  handleCreateProject: (data: {
    name: string;
    client: string;
    type?: string;
    address?: string;
    phone?: string;
  }) => Promise<void>;
  handleUpdateProject: (id: string, data: Partial<Project>) => Promise<void>;
  refreshData: () => Promise<void>;
  setEditingProject: (project: Project | null) => void;
  setAssigningProject: (project: Project | null) => void;
  setIsModalOpen: (open: boolean) => void;
  setModalMode: (mode: 'project' | 'menu') => void;
  setShowUpgradePlanModal: (open: boolean) => void;
  announce?: (message: string) => void;
}

export function usePortalContext() {
  return useOutletContext<PortalOutletContext>();
}
