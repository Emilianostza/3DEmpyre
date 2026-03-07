import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Box,
  TrendingUp,
  Shield,
  Activity,
  Server,
  Search,
  Briefcase,
  LogOut,
  BarChart2,
  FolderOpen,
  Image,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Clock,
  HardDrive,
  Zap,
  CheckCircle,
  AlertTriangle,
  FileText,
  LogIn,
  UserPlus,
  Key,
  Eye,
  Download,
  Truck,
  Heart,
  Globe,
  FileBarChart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AssetAnalyticsBoard } from '@/components/portal/AssetAnalyticsBoard';
import { ActivityFeed } from '@/components/portal/ActivityFeed';
import { RevenueDashboard } from '@/components/portal/RevenueDashboard';
import { ClientHealthMetrics } from '@/components/portal/ClientHealthMetrics';
import { MultiMarketView } from '@/components/portal/MultiMarketView';
import { AutomatedReporting } from '@/components/portal/AutomatedReporting';
import { WorkflowPipeline } from '@/components/portal/WorkflowPipeline';
import Skeleton, { SkeletonCard, SkeletonRow } from '@/components/Skeleton';
import { AssetsProvider, ProjectsProvider } from '@/services/dataProvider';
import { SEO } from '@/components/common/SEO';
import { getUsers, createUser, deleteUser } from '@/services/api/auth';
import { Asset, Project } from '@/types';
import { User } from '@/types/auth';

// ── Shared Constants ─────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  approver: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  technician: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  sales_lead: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  customer_owner: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  customer_viewer: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

const PROJECT_STATUS_COLORS: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  qa: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  pending: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400',
  delivered: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  archived: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-500',
};

const SuperAdmin: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'users'
    | 'projects'
    | 'assets'
    | 'system'
    | 'analytics'
    | 'audit'
    | 'revenue'
    | 'clients'
    | 'markets'
    | 'reports'
  >('overview');
  const [userFilter, setUserFilter] = useState<'all' | 'employee' | 'customer'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [analyticsView, setAnalyticsView] = useState<'customers' | 'team'>('customers');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [assetSearch, setAssetSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    roleType: 'customer_owner',
    orgId: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const handleAddUser = async () => {
    if (!addForm.name.trim() || !addForm.email.trim()) {
      setAddError('Name and email are required.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      const newUser = await createUser(addForm);
      setUsers((prev) => [...prev, newUser]);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', roleType: 'customer_owner', orgId: '' });
    } catch {
      setAddError('Failed to create user. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setDeleteError('');
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setPendingDeleteId(null);
    } catch {
      setDeleteError('Failed to remove user. Please try again.');
      setPendingDeleteId(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, projectsData, usersData] = await Promise.all([
          AssetsProvider.list(),
          ProjectsProvider.list(),
          getUsers(),
        ]);
        setAssets(assetsData as Asset[]);
        setProjects(projectsData as Project[]);
        setUsers(usersData);
      } catch (error) {
        if (import.meta.env.DEV) console.error('Failed to load super admin data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/app/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-10 h-10" rounded="xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3.5 w-36" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-1">
            {[...Array(8)].map((_, i) => (
              <SkeletonRow key={i} cols={5} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SEO
        title={t('portal.superAdmin.title')}
        description={t('portal.superAdmin.seoDescription')}
      />
      {/* Top Navigation */}
      <header className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-2xl border-b border-zinc-200/60 dark:border-zinc-800/60 sticky top-0 z-30 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-brand-500/20 ring-1 ring-brand-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif-premium font-bold text-zinc-900 dark:text-white leading-none">
                {t('portal.superAdmin.title')}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {t('portal.superAdmin.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {t('portal.superAdmin.systemHealthy')}
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden border-2 border-zinc-300 dark:border-zinc-700">
              <img
                src="https://ui-avatars.com/api/?name=Emiliano&background=0ea5e9&color=fff"
                alt="Profile"
                loading="eager"
              />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title={t('portal.superAdmin.signOut')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/50 dark:bg-zinc-900/50 p-1.5 rounded-xl max-w-fit shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 overflow-x-auto ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl">
          {[
            { id: 'overview', label: t('portal.superAdmin.tabs.overview'), icon: Activity },
            { id: 'users', label: t('portal.superAdmin.tabs.userManagement'), icon: Users },
            { id: 'assets', label: t('portal.superAdmin.tabs.allAssets'), icon: Image },
            { id: 'projects', label: t('portal.superAdmin.tabs.allProjects'), icon: Briefcase },
            {
              id: 'analytics',
              label: t('portal.superAdmin.tabs.performanceAnalytics'),
              icon: BarChart2,
            },
            { id: 'revenue', label: t('portal.superAdmin.tabs.revenue'), icon: TrendingUp },
            { id: 'clients', label: t('portal.superAdmin.tabs.clientHealth'), icon: Heart },
            { id: 'markets', label: t('portal.superAdmin.tabs.markets'), icon: Globe },
            { id: 'reports', label: t('portal.superAdmin.tabs.reports'), icon: FileBarChart },
            { id: 'system', label: t('portal.superAdmin.tabs.systemHealth'), icon: Server },
            { id: 'audit', label: t('portal.superAdmin.tabs.auditLog'), icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as
                  | 'overview'
                  | 'users'
                  | 'projects'
                  | 'assets'
                  | 'system'
                  | 'analytics'
                  | 'audit'
                  | 'revenue'
                  | 'clients'
                  | 'markets'
                  | 'reports'
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                ? 'bg-white/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 scale-[1.02]'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60 ring-1 ring-white/60 dark:ring-white/10 hover:shadow-blue-500/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        {t('portal.superAdmin.totalAssets')}
                      </p>
                      <h3 className="text-3xl font-serif-premium font-bold text-zinc-900 dark:text-white">
                        {assets.length}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60 ring-1 ring-white/60 dark:ring-white/10 hover:shadow-purple-500/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        {t('portal.superAdmin.totalProjects')}
                      </p>
                      <h3 className="text-3xl font-serif-premium font-bold text-zinc-900 dark:text-white">
                        {projects.length}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60 ring-1 ring-white/60 dark:ring-white/10 hover:shadow-green-500/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        {t('portal.superAdmin.activeUsers')}
                      </p>
                      <h3 className="text-3xl font-serif-premium font-bold text-zinc-900 dark:text-white">
                        {users.length.toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60 ring-1 ring-white/60 dark:ring-white/10 hover:shadow-orange-500/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        {t('portal.superAdmin.publishedAssets')}
                      </p>
                      <h3 className="text-3xl font-serif-premium font-bold text-zinc-900 dark:text-white">
                        {assets.filter((a) => a.status === 'Published').length.toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Pipeline */}
              <div className="my-6">
                <WorkflowPipeline projects={projects} onStatusChange={() => { }} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-1">
                  <ActivityFeed projects={projects} assets={assets} />
                </div>

                {/* Global Analytics */}
                <div className="lg:col-span-2 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60 ring-1 ring-white/60 dark:ring-white/10">
                  <div className="mb-6">
                    <h2 className="text-xl font-serif-premium font-bold text-zinc-900 dark:text-white">
                      {t('portal.superAdmin.platformAnalytics')}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {t('portal.superAdmin.platformAnalyticsDesc')}
                    </p>
                  </div>
                  <AssetAnalyticsBoard assets={assets} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl shadow-sm transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60 ring-1 ring-white/60 dark:ring-white/10 overflow-hidden">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-serif-premium font-bold text-zinc-900 dark:text-white">
                    {t('portal.superAdmin.userManagement')}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t('portal.superAdmin.totalUsers')}: {users.length}
                  </p>
                  {deleteError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{deleteError}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                    {(['all', 'employee', 'customer'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setUserFilter(filter)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${userFilter === filter
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
                          }`}
                      >
                        {filter === 'all'
                          ? t('portal.superAdmin.allUsers')
                          : filter === 'employee'
                            ? t('portal.superAdmin.team')
                            : t('portal.superAdmin.clientsFilter')}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder={t('portal.superAdmin.searchUsers')}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none text-sm focus:ring-2 focus:ring-brand-500 w-64"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setAddError('');
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('portal.superAdmin.addUser')}
                  </button>
                </div>
              </div>
              <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
                <thead className="bg-zinc-50/50 dark:bg-zinc-800/30 text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <tr>
                    <th className="px-6 py-4">{t('portal.superAdmin.user')}</th>
                    <th className="px-6 py-4">{t('portal.superAdmin.role')}</th>
                    <th className="px-6 py-4">{t('portal.superAdmin.orgCompany')}</th>
                    <th className="px-6 py-4">{t('portal.superAdmin.projects')}</th>
                    <th className="px-6 py-4">{t('portal.superAdmin.assets')}</th>
                    <th className="px-6 py-4">{t('portal.superAdmin.status')}</th>
                    <th className="px-6 py-4 text-right">{t('portal.superAdmin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {users
                    .filter((u) => {
                      if (userFilter === 'all') return true;
                      const isCustomer = ['customer_owner', 'customer_viewer'].includes(
                        u.role.type
                      );
                      return userFilter === 'customer' ? isCustomer : !isCustomer;
                    })
                    .filter(
                      (u) =>
                        !userSearch ||
                        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase())
                    )
                    .map((user) => {
                      const isCustomer = ['customer_owner', 'customer_viewer'].includes(
                        user.role.type
                      );
                      const isExpanded = expandedUserId === user.id;

                      const userProjects = projects.filter(
                        (p) => p.client === user.name || p.client === user.orgId
                      );
                      const userProjectIds = new Set(userProjects.map((p) => p.id));
                      const userAssets = assets.filter((a) =>
                        userProjectIds.has(a.project_id ?? '')
                      );

                      return (
                        <React.Fragment key={user.id}>
                          <tr
                            className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${isExpanded ? 'bg-brand-50/40 dark:bg-brand-900/10' : ''}`}
                            onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${isCustomer ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'}`}
                                >
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-semibold text-zinc-900 dark:text-white">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-zinc-400">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[user.role.type] ?? ''}`}
                              >
                                {user.role.type.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              {user.orgId}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                {userProjects.length}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                  {userAssets.length}
                                </span>
                                {userAssets.slice(0, 3).map((a) => (
                                  <img
                                    key={a.id}
                                    src={a.thumb}
                                    alt={a.name}
                                    className="w-7 h-7 rounded-md object-cover border border-zinc-200 dark:border-zinc-700"
                                    loading="lazy"
                                  />
                                ))}
                                {userAssets.length > 3 && (
                                  <span className="text-xs text-zinc-400">
                                    +{userAssets.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-zinc-500'}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-zinc-400'}`}
                                />
                                <span className="capitalize">{user.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <ChevronRight
                                  className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                />
                                {pendingDeleteId === user.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                      {t('portal.superAdmin.remove')}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteUser(user.id);
                                      }}
                                      className="px-2 py-1 rounded text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                                    >
                                      {t('portal.superAdmin.confirm')}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPendingDeleteId(null);
                                      }}
                                      className="px-2 py-1 rounded text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                    >
                                      {t('portal.superAdmin.cancel')}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPendingDeleteId(user.id);
                                    }}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title={t('portal.superAdmin.removeUser')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded detail panel */}
                          {isExpanded && (
                            <tr className="bg-zinc-50/80 dark:bg-zinc-800/30">
                              <td colSpan={7} className="px-6 py-5">
                                <div className="space-y-4">
                                  {/* Info grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                      { label: t('portal.superAdmin.userId'), value: user.id },
                                      { label: t('portal.superAdmin.org'), value: user.orgId },
                                      {
                                        label: t('portal.superAdmin.created'),
                                        value: new Date(user.createdAt).toLocaleDateString(),
                                      },
                                      {
                                        label: t('portal.superAdmin.mfa'),
                                        value: user.mfaEnabled
                                          ? t('portal.superAdmin.enabled')
                                          : t('portal.superAdmin.disabled'),
                                      },
                                    ].map((item) => (
                                      <div
                                        key={item.label}
                                        className="bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-200 dark:border-zinc-700"
                                      >
                                        <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                                          {item.label}
                                        </div>
                                        <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 truncate">
                                          {item.value}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Projects */}
                                  {userProjects.length > 0 && (
                                    <div>
                                      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                                        {t('portal.superAdmin.projects')} ({userProjects.length})
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {userProjects.map((p) => (
                                          <div
                                            key={p.id}
                                            className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2"
                                          >
                                            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                                            <div>
                                              <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                                {p.name}
                                              </div>
                                              <div className="text-[10px] text-zinc-400">
                                                {p.status} · {p.items} items
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Assets grid */}
                                  {userAssets.length > 0 ? (
                                    <div>
                                      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                                        {t('portal.superAdmin.assets')} ({userAssets.length})
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                        {userAssets.map((asset) => (
                                          <div key={asset.id} className="group">
                                            <div className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shadow-sm">
                                              <img
                                                src={asset.thumb}
                                                alt={asset.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                              />
                                              <div className="absolute top-1.5 left-1.5">
                                                <span
                                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${asset.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : asset.status === 'In Review' ? 'bg-orange-100 text-orange-700' : 'bg-zinc-100 text-zinc-600'}`}
                                                >
                                                  {asset.status}
                                                </span>
                                              </div>
                                            </div>
                                            <p className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 mt-1 truncate">
                                              {asset.name}
                                            </p>
                                            <p className="text-[9px] text-zinc-400">{asset.type}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-xs text-zinc-400 italic">
                                      {t('portal.superAdmin.noAssetsLinked')}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* All Assets Tab */}
          {activeTab === 'assets' &&
            (() => {
              const filtered = assets.filter(
                (a) =>
                  !assetSearch ||
                  a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
                  (a.type ?? '').toLowerCase().includes(assetSearch.toLowerCase())
              );

              // Group assets by project, then by customer
              const projectMap = new Map(projects.map((p) => [p.id, p]));
              const grouped: {
                customer: string;
                projectName: string;
                projectId: string;
                assets: Asset[];
              }[] = [];
              const seen = new Set<string>();
              filtered.forEach((a) => {
                const proj = projectMap.get(a.project_id ?? '');
                const key = proj?.id ?? 'unknown';
                if (!seen.has(key)) {
                  seen.add(key);
                  grouped.push({
                    customer: proj?.client ?? 'Unknown',
                    projectName: proj?.name ?? 'Unknown Project',
                    projectId: key,
                    assets: [],
                  });
                }
                grouped.find((g) => g.projectId === key)?.assets.push(a);
              });

              return (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-serif-premium font-bold text-zinc-900 dark:text-white">
                        {t('portal.superAdmin.allAssetsTitle')}
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {t('portal.superAdmin.totalAssetsAcrossCustomers', {
                          count: assets.length,
                        })}
                      </p>
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder={t('portal.superAdmin.searchAssets')}
                        value={assetSearch}
                        onChange={(e) => setAssetSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none text-sm focus:ring-2 focus:ring-brand-500 w-56"
                      />
                    </div>
                  </div>

                  {grouped.length === 0 && (
                    <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
                      {t('portal.superAdmin.noAssetsFound')}
                    </div>
                  )}

                  {grouped.map((group) => (
                    <div
                      key={group.projectId}
                      className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 ring-1 ring-white/60 dark:ring-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                            <FolderOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white text-sm">
                              {group.projectName}
                            </div>
                            <div className="text-xs text-zinc-400">
                              {t('portal.superAdmin.client')}:{' '}
                              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                                {group.customer}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                          {group.assets.length} asset{group.assets.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {group.assets.map((asset) => (
                          <div key={asset.id} className="group">
                            <div className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                              <img
                                src={asset.thumb}
                                alt={asset.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                                loading="lazy"
                              />
                              <div className="absolute top-2 left-2">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm ${asset.status === 'Published' ? 'bg-emerald-100/90 text-emerald-700' : asset.status === 'In Review' ? 'bg-orange-100/90 text-orange-700' : 'bg-zinc-100/90 text-zinc-600'}`}
                                >
                                  {asset.status}
                                </span>
                              </div>
                              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded">
                                  {asset.id}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-2 truncate">
                              {asset.name}
                            </p>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-[10px] text-zinc-400">
                                {asset.type ?? '3D Model'}
                              </p>
                              {(asset.viewCount ?? 0) > 0 && (
                                <p className="text-[10px] text-zinc-400">
                                  {asset.viewCount?.toLocaleString()} views
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

          {/* All Projects Tab */}
          {activeTab === 'projects' && (
            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 ring-1 ring-white/60 dark:ring-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-serif-premium font-bold text-zinc-900 dark:text-white">
                  {t('portal.superAdmin.allProjectsTitle')}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {t('portal.superAdmin.projectsAcrossCustomers', { count: projects.length })}
                </p>
              </div>
              <table className="w-full text-sm text-left text-zinc-700 dark:text-zinc-300">
                <thead className="bg-zinc-50/50 dark:bg-zinc-800/30 text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <tr>
                    <th className="px-6 py-4">{t('portal.superAdmin.project')}</th>
                    <th className="px-6 py-4">{t('portal.superAdmin.client')}</th>
                    <th className="px-6 py-4">{t('portal.superAdmin.status')}</th>
                    <th className="px-6 py-4">{t('portal.superAdmin.items')}</th>
                    <th className="px-6 py-4">{t('portal.superAdmin.assets')}</th>
                    <th className="px-6 py-4">{t('portal.superAdmin.created')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {projects.map((project) => {
                    const projectAssets = assets.filter((a) => a.project_id === project.id);
                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-all duration-300"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-zinc-900 dark:text-white">
                                {project.name}
                              </div>
                              <div className="text-xs font-mono text-zinc-400">{project.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-800 dark:text-zinc-200">
                          {project.client}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PROJECT_STATUS_COLORS[project.status] ?? 'bg-zinc-100 text-zinc-600'}`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-zinc-800 dark:text-zinc-200">
                          {project.items}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {projectAssets.length}
                            </span>
                            <div className="flex -space-x-1">
                              {projectAssets.slice(0, 4).map((a) => (
                                <img
                                  key={a.id}
                                  src={a.thumb}
                                  alt={a.name}
                                  className="w-6 h-6 rounded-full object-cover border-2 border-white dark:border-zinc-900"
                                  loading="lazy"
                                />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                          {project.created_at
                            ? new Date(project.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'analytics' &&
            (() => {
              const customers = users.filter((u) =>
                ['customer_owner', 'customer_viewer'].includes(u.role.type)
              );
              const teamMembers = users.filter((u) =>
                ['admin', 'approver', 'technician', 'sales_lead', 'super_admin'].includes(
                  u.role.type
                )
              );

              const projectsForClient = (user: User) =>
                projects.filter((p) => p.client === user.name || p.client === user.orgId);

              const assetsForProjects = (clientProjects: typeof projects) => {
                const ids = new Set(clientProjects.map((p) => p.id));
                return assets.filter((a) => ids.has(a.project_id ?? ''));
              };

              const assignedProjects = (user: User) => {
                if (user.role.type === 'technician') {
                  const ids = new Set(user.role.assignedProjectIds);
                  return projects.filter((p) => ids.has(p.id));
                }
                return [];
              };

              const maxProjects = Math.max(
                1,
                ...(analyticsView === 'customers' ? customers : teamMembers).map((u) =>
                  analyticsView === 'customers'
                    ? projectsForClient(u).length
                    : assignedProjects(u).length
                )
              );

              const displayList = analyticsView === 'customers' ? customers : teamMembers;

              return (
                <div className="space-y-6">
                  {/* Header + sub-toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {t('portal.superAdmin.performanceAnalytics')}
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {t('portal.superAdmin.performanceAnalyticsDesc')}
                      </p>
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 self-start sm:self-auto">
                      {(['customers', 'team'] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => setAnalyticsView(v)}
                          className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${analyticsView === v
                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                        >
                          {v === 'customers'
                            ? t('portal.superAdmin.customers')
                            : t('portal.superAdmin.teamMembers')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary strip */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label:
                          analyticsView === 'customers'
                            ? t('portal.superAdmin.totalCustomers')
                            : t('portal.superAdmin.teamSize'),
                        value: displayList.length,
                        icon: Users,
                        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                      },
                      {
                        label: t('portal.superAdmin.active'),
                        value: displayList.filter((u) => u.status === 'active').length,
                        icon: Activity,
                        color:
                          'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                      },
                      {
                        label:
                          analyticsView === 'customers'
                            ? t('portal.superAdmin.projectsLinked')
                            : t('portal.superAdmin.projectsAssigned'),
                        value:
                          analyticsView === 'customers'
                            ? customers.reduce((sum, u) => sum + projectsForClient(u).length, 0)
                            : teamMembers.reduce((sum, u) => sum + assignedProjects(u).length, 0),
                        icon: FolderOpen,
                        color:
                          'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4"
                      >
                        <div className={`p-3 rounded-xl ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            {stat.label}
                          </p>
                          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Per-entity table */}
                  <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <table className="w-full text-sm text-left text-zinc-700 dark:text-zinc-300">
                      <thead className="bg-zinc-50/50 dark:bg-zinc-800/30 text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/60 dark:border-zinc-800/60">
                        <tr>
                          <th className="px-6 py-4">
                            {analyticsView === 'customers'
                              ? t('portal.superAdmin.customer')
                              : t('portal.superAdmin.teamMember')}
                          </th>
                          <th className="px-6 py-4">{t('portal.superAdmin.role')}</th>
                          <th className="px-6 py-4">
                            {analyticsView === 'customers'
                              ? t('portal.superAdmin.projects')
                              : t('portal.superAdmin.assigned')}
                          </th>
                          <th className="px-6 py-4">
                            {analyticsView === 'customers'
                              ? t('portal.superAdmin.assets')
                              : t('portal.superAdmin.completion')}
                          </th>
                          <th className="px-6 py-4">{t('portal.superAdmin.status')}</th>
                          <th className="px-6 py-4 text-right">{t('portal.superAdmin.action')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {displayList.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500"
                            >
                              {analyticsView === 'customers'
                                ? t('portal.superAdmin.noCustomersFound')
                                : t('portal.superAdmin.noTeamMembersFound')}
                            </td>
                          </tr>
                        )}
                        {displayList.map((user) => {
                          const clientProjects = projectsForClient(user);
                          const clientAssets = assetsForProjects(clientProjects);
                          const assigned = assignedProjects(user);
                          const projectCount =
                            analyticsView === 'customers' ? clientProjects.length : assigned.length;
                          const barWidth =
                            maxProjects > 0 ? Math.round((projectCount / maxProjects) * 100) : 0;

                          const delivered =
                            analyticsView === 'team'
                              ? assigned.filter((p) => p.status === 'delivered').length
                              : 0;
                          const completionPct =
                            analyticsView === 'team' && assigned.length > 0
                              ? Math.round((delivered / assigned.length) * 100)
                              : null;

                          return (
                            <tr
                              key={user.id}
                              className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-all duration-300"
                            >
                              {/* Identity */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${analyticsView === 'customers'
                                      ? 'bg-sky-100 text-sky-700'
                                      : 'bg-purple-100 text-purple-700'
                                      }`}
                                  >
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-zinc-900 dark:text-white truncate">
                                      {user.name}
                                    </div>
                                    <div className="text-xs text-zinc-400 truncate">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[user.role.type] ?? ''
                                    }`}
                                >
                                  {user.role.type.replace(/_/g, ' ')}
                                </span>
                              </td>

                              {/* Projects / bar */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3 min-w-[120px]">
                                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="h-full bg-brand-500 rounded-full transition-all"
                                      style={{ width: `${barWidth}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 w-6 text-right">
                                    {projectCount}
                                  </span>
                                </div>
                              </td>

                              {/* Assets / Completion */}
                              <td className="px-6 py-4">
                                {analyticsView === 'customers' ? (
                                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                                    <Image className="w-3.5 h-3.5" />
                                    <span className="font-medium">{clientAssets.length}</span>
                                  </div>
                                ) : completionPct !== null ? (
                                  <div className="flex items-center gap-2 min-w-[100px]">
                                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${completionPct >= 75
                                          ? 'bg-green-500'
                                          : completionPct >= 40
                                            ? 'bg-amber-500'
                                            : 'bg-zinc-400'
                                          }`}
                                        style={{ width: `${completionPct}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                      {completionPct}%
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-zinc-400">—</span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.status === 'active'
                                    ? 'text-green-600 dark:text-green-400'
                                    : user.status === 'suspended'
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-zinc-400'
                                    }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${user.status === 'active'
                                      ? 'bg-green-500'
                                      : user.status === 'suspended'
                                        ? 'bg-amber-500'
                                        : 'bg-zinc-400'
                                      }`}
                                  />
                                  <span className="capitalize">{user.status}</span>
                                </span>
                              </td>

                              {/* Action */}
                              <td className="px-6 py-4 text-right">
                                <button
                                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                                  onClick={() => {
                                    setActiveTab('users');
                                  }}
                                >
                                  {t('portal.superAdmin.view')}
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

          {activeTab === 'system' &&
            (() => {
              const totalStorage = assets.reduce((sum, a) => sum + (a.file_size || 0), 0);
              const storageGB = (totalStorage / (1024 * 1024 * 1024)).toFixed(2);
              const maxStorageGB = 50; // 50 GB quota
              const storagePct = Math.min(
                100,
                (totalStorage / (maxStorageGB * 1024 * 1024 * 1024)) * 100
              );

              // Group storage by project
              const projectMap = new Map(projects.map((p) => [p.id, p]));
              const storageByProject: { name: string; client: string; bytes: number }[] = [];
              const projectBytes = new Map<string, number>();
              assets.forEach((a) => {
                const pid = a.project_id ?? 'unknown';
                projectBytes.set(pid, (projectBytes.get(pid) || 0) + (a.file_size || 0));
              });
              projectBytes.forEach((bytes, pid) => {
                const proj = projectMap.get(pid);
                storageByProject.push({
                  name: proj?.name ?? 'Unknown',
                  client: proj?.client ?? 'Unknown',
                  bytes,
                });
              });
              storageByProject.sort((a, b) => b.bytes - a.bytes);
              const maxProjectBytes = Math.max(1, ...storageByProject.map((s) => s.bytes));

              return (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          {t('portal.superAdmin.uptime')}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">99.98%</div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                        {t('portal.superAdmin.last30Days')}
                      </div>
                    </div>
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          {t('portal.superAdmin.avgResponse')}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">142ms</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                        {t('portal.superAdmin.apiP95Latency')}
                      </div>
                    </div>
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          {t('portal.superAdmin.errorRate')}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">0.02%</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                        {t('portal.superAdmin.belowThreshold')}
                      </div>
                    </div>
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          {t('portal.superAdmin.storage')}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {storageGB} GB
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                        of {maxStorageGB} GB used
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* System Status */}
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60">
                      <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-brand-600" />
                        {t('portal.superAdmin.systemStatus')}
                      </h3>
                      <div className="space-y-3">
                        {[
                          { name: 'API Gateway', status: 'Operational', color: 'green' },
                          { name: 'Database (PostgreSQL)', status: 'Operational', color: 'green' },
                          { name: 'Storage (Supabase)', status: 'Operational', color: 'green' },
                          { name: 'Auth Service', status: 'Operational', color: 'green' },
                          { name: 'CDN (Netlify)', status: 'Operational', color: 'green' },
                          { name: 'Email Service', status: 'Operational', color: 'green' },
                          { name: 'Rendering Engine', status: 'Processing', color: 'blue' },
                          {
                            name: 'Processing Queue',
                            status: `${assets.filter((a) => a.status === 'Processing').length} in queue`,
                            color:
                              assets.filter((a) => a.status === 'Processing').length > 0
                                ? 'blue'
                                : 'green',
                          },
                        ].map((sys) => (
                          <div
                            key={sys.name}
                            className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-2 h-2 rounded-full ${sys.color === 'green'
                                  ? 'bg-green-500'
                                  : sys.color === 'blue'
                                    ? 'bg-blue-500 animate-pulse'
                                    : 'bg-zinc-400'
                                  }`}
                              />
                              <span className="font-medium text-zinc-800 dark:text-zinc-200 text-sm">
                                {sys.name}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-md ${sys.color === 'green'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : sys.color === 'blue'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400'
                                }`}
                            >
                              {sys.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Storage Breakdown */}
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60">
                      <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-white flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        {t('portal.superAdmin.storageByProject')}
                      </h3>
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                          <span>
                            Total: {storageGB} GB / {maxStorageGB} GB
                          </span>
                          <span>{storagePct.toFixed(1)}% used</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${storagePct > 80
                              ? 'bg-red-500'
                              : storagePct > 50
                                ? 'bg-amber-500'
                                : 'bg-brand-500'
                              }`}
                            style={{ width: `${storagePct}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        {storageByProject.map((sp) => {
                          const mb = (sp.bytes / (1024 * 1024)).toFixed(1);
                          const barPct = (sp.bytes / maxProjectBytes) * 100;
                          return (
                            <div key={sp.name} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FolderOpen className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                                    {sp.name}
                                  </span>
                                  <span className="text-xs text-zinc-400 hidden sm:inline">
                                    ({sp.client})
                                  </span>
                                </div>
                                <span className="font-bold text-zinc-700 dark:text-zinc-300 text-xs ml-2 whitespace-nowrap">
                                  {mb} MB
                                </span>
                              </div>
                              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-purple-500 dark:bg-purple-400 rounded-full transition-all"
                                  style={{ width: `${barPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recent Errors */}
                  <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60">
                    <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      {t('portal.superAdmin.recentErrors')}
                    </h3>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-3">
                        <CheckCircle className="w-7 h-7 text-green-500 dark:text-green-400" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {t('portal.superAdmin.noErrors')}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        {t('portal.superAdmin.allSystemsNormal')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

          {activeTab === 'revenue' && <RevenueDashboard projects={projects} assets={assets} />}

          {activeTab === 'clients' && <ClientHealthMetrics projects={projects} assets={assets} />}

          {activeTab === 'markets' && <MultiMarketView projects={projects} assets={assets} />}

          {activeTab === 'reports' && <AutomatedReporting projects={projects} assets={assets} />}

          {activeTab === 'audit' &&
            (() => {
              // Generate mock audit log entries from existing data
              type AuditEntry = {
                id: string;
                timestamp: string;
                actor: string;
                action: string;
                actionType: 'auth' | 'project' | 'asset' | 'admin' | 'system';
                target: string;
                success: boolean;
                ip: string;
                icon: React.ElementType;
              };

              const auditEntries: AuditEntry[] = [];
              const ipPool = [
                '192.168.1.42',
                '10.0.0.15',
                '172.16.0.88',
                '203.0.113.7',
                '198.51.100.23',
              ];

              // Auth events from users
              users.forEach((user, idx) => {
                auditEntries.push({
                  id: `aud-login-${user.id}`,
                  timestamp: new Date(Date.now() - (idx * 3 + 1) * 3600000).toISOString(),
                  actor: user.name,
                  action: 'User logged in',
                  actionType: 'auth',
                  target: user.email,
                  success: true,
                  ip: ipPool[idx % ipPool.length],
                  icon: LogIn,
                });
              });

              // Project events
              projects.forEach((project) => {
                if (project.status === 'delivered' && project.updated_at) {
                  auditEntries.push({
                    id: `aud-deliver-${project.id}`,
                    timestamp: project.updated_at,
                    actor: 'System',
                    action: `Project delivered`,
                    actionType: 'project',
                    target: `${project.name} (${project.client})`,
                    success: true,
                    ip: '10.0.0.1',
                    icon: Truck,
                  });
                }
                if (project.status === 'approved' && project.updated_at) {
                  auditEntries.push({
                    id: `aud-approve-${project.id}`,
                    timestamp: project.updated_at,
                    actor: 'Admin',
                    action: `Project approved`,
                    actionType: 'project',
                    target: `${project.name} (${project.client})`,
                    success: true,
                    ip: ipPool[1],
                    icon: CheckCircle,
                  });
                }
                if (project.status === 'rejected' && project.updated_at) {
                  auditEntries.push({
                    id: `aud-reject-${project.id}`,
                    timestamp: project.updated_at,
                    actor: 'Approver',
                    action: `Project rejected`,
                    actionType: 'project',
                    target: `${project.name} — ${project.rejection_reason || 'Needs revision'}`,
                    success: true,
                    ip: ipPool[2],
                    icon: AlertTriangle,
                  });
                }
              });

              // Asset events
              assets.slice(0, 6).forEach((asset, idx) => {
                if (asset.status === 'Published' && asset.updated_at) {
                  auditEntries.push({
                    id: `aud-pub-${asset.id}`,
                    timestamp: asset.updated_at,
                    actor: 'System',
                    action: 'Asset published',
                    actionType: 'asset',
                    target: asset.name,
                    success: true,
                    ip: '10.0.0.1',
                    icon: Eye,
                  });
                }
                auditEntries.push({
                  id: `aud-upload-${asset.id}`,
                  timestamp: new Date(Date.now() - (idx * 2 + 5) * 86400000).toISOString(),
                  actor: 'Technician',
                  action: 'Asset uploaded',
                  actionType: 'asset',
                  target: asset.name,
                  success: true,
                  ip: ipPool[idx % ipPool.length],
                  icon: Download,
                });
              });

              // Admin events
              auditEntries.push(
                {
                  id: 'aud-user-created',
                  timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
                  actor: 'Super Admin',
                  action: 'User account created',
                  actionType: 'admin',
                  target: 'new.user@bistro55.com',
                  success: true,
                  ip: ipPool[0],
                  icon: UserPlus,
                },
                {
                  id: 'aud-pwd-change',
                  timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
                  actor: 'Admin',
                  action: 'Password changed',
                  actionType: 'admin',
                  target: 'admin@3dempyre.com',
                  success: true,
                  ip: ipPool[3],
                  icon: Key,
                },
                {
                  id: 'aud-failed-login',
                  timestamp: new Date(Date.now() - 8 * 86400000).toISOString(),
                  actor: 'Unknown',
                  action: 'Failed login attempt',
                  actionType: 'auth',
                  target: 'unknown@example.com',
                  success: false,
                  ip: '203.0.113.99',
                  icon: LogIn,
                }
              );

              // Sort by timestamp desc
              auditEntries.sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );

              const ACTION_TYPE_COLORS: Record<string, string> = {
                auth: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                project: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                asset: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
                admin: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                system: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400',
              };

              return (
                <div className="space-y-6">
                  {/* Header + Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {auditEntries.length}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                        {t('portal.superAdmin.totalEvents')}
                      </div>
                    </div>
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {auditEntries.filter((e) => e.success).length}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                        {t('portal.superAdmin.successful')}
                      </div>
                    </div>
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {auditEntries.filter((e) => !e.success).length}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                        {t('portal.superAdmin.failed')}
                      </div>
                    </div>
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {new Set(auditEntries.map((e) => e.ip)).size}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                        {t('portal.superAdmin.uniqueIPs')}
                      </div>
                    </div>
                  </div>

                  {/* Audit Log Table */}
                  <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-zinc-400" />
                        {t('portal.superAdmin.auditTrail')}
                      </h3>
                      <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                        {t('portal.superAdmin.last30Days')}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-100 dark:border-zinc-800">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              {t('portal.superAdmin.timestamp')}
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              {t('portal.superAdmin.actor')}
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              {t('portal.superAdmin.action')}
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              {t('portal.superAdmin.target')}
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              {t('portal.superAdmin.type')}
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              {t('portal.superAdmin.status')}
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              {t('portal.superAdmin.ip')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                          {auditEntries.slice(0, 25).map((entry) => {
                            const EntryIcon = entry.icon;
                            const typeColor =
                              ACTION_TYPE_COLORS[entry.actionType] ?? ACTION_TYPE_COLORS.system;
                            return (
                              <tr
                                key={entry.id}
                                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                              >
                                <td className="px-6 py-3.5 whitespace-nowrap">
                                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                                    {new Date(entry.timestamp).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <EntryIcon className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                                    <span className="font-medium text-zinc-900 dark:text-white text-sm">
                                      {entry.actor}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-3.5 text-zinc-700 dark:text-zinc-300">
                                  {entry.action}
                                </td>
                                <td className="px-6 py-3.5 max-w-[200px]">
                                  <span className="text-zinc-500 dark:text-zinc-400 truncate block text-xs">
                                    {entry.target}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5">
                                  <span
                                    className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColor}`}
                                  >
                                    {entry.actionType}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5">
                                  {entry.success ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                      <CheckCircle className="w-3 h-3" />
                                      {t('portal.superAdmin.ok')}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                                      <AlertTriangle className="w-3 h-3" />
                                      {t('portal.superAdmin.failedStatus')}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-3.5 whitespace-nowrap">
                                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                                    {entry.ip}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {auditEntries.length > 25 && (
                      <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {t('portal.superAdmin.showingEntries', {
                            shown: 25,
                            total: auditEntries.length,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {t('portal.superAdmin.addUser')}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {addError && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                  {addError}
                </p>
              )}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                  {t('portal.superAdmin.fullName')}
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                  {t('portal.superAdmin.email')}
                </label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                  {t('portal.superAdmin.role')}
                </label>
                <select
                  value={addForm.roleType}
                  onChange={(e) => setAddForm((f) => ({ ...f, roleType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <optgroup label={t('portal.superAdmin.employees')}>
                    <option value="admin">{t('portal.superAdmin.roles.admin')}</option>
                    <option value="approver">{t('portal.superAdmin.roles.approver')}</option>
                    <option value="technician">{t('portal.superAdmin.roles.technician')}</option>
                    <option value="sales_lead">{t('portal.superAdmin.roles.salesLead')}</option>
                  </optgroup>
                  <optgroup label={t('portal.superAdmin.customers')}>
                    <option value="customer_owner">
                      {t('portal.superAdmin.roles.customerOwner')}
                    </option>
                    <option value="customer_viewer">
                      {t('portal.superAdmin.roles.customerViewer')}
                    </option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                  {t('portal.superAdmin.orgId')}{' '}
                  <span className="normal-case font-normal text-zinc-400">
                    ({t('portal.superAdmin.optional')})
                  </span>
                </label>
                <input
                  type="text"
                  value={addForm.orgId}
                  onChange={(e) => setAddForm((f) => ({ ...f, orgId: e.target.value }))}
                  placeholder="org-1 (auto-assigned if blank)"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              >
                {t('portal.superAdmin.cancel')}
              </button>
              <button
                onClick={handleAddUser}
                disabled={addLoading}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {addLoading ? t('portal.superAdmin.creating') : t('portal.superAdmin.createUser')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
