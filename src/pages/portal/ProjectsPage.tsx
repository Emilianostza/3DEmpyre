import { useTranslation } from 'react-i18next';
import { usePortalContext } from '@/types/portal';
import { ProjectTable } from '@/components/portal/ProjectTable';
import { useUrlSearchParam } from '@/hooks/useUrlSearchParam';

const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const { projects, assets, setEditingProject, setAssigningProject } = usePortalContext();
  const [expandedId, setExpandedId] = useUrlSearchParam('expanded');

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
        {t('portal.tab.projects', 'Projects')}
      </h1>
      <ProjectTable
        projects={projects}
        assets={assets}
        expandedId={expandedId || null}
        onToggleExpand={(id) => setExpandedId(id)}
        onEditProject={(projectId) => {
          const project = projects.find((p) => p.id === projectId);
          if (project) {
            setEditingProject(project);
          }
        }}
        onAssignTechnician={(project) => setAssigningProject(project)}
      />
    </div>
  );
};

export default ProjectsPage;
