import '@testing-library/jest-dom';
import { ProjectsProvider, AssetsProvider } from '@/services/dataProvider';

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

vi.mock('@/config/env', () => ({
  env: { useMockData: true },
}));

const mockFetchProjects = vi.fn().mockResolvedValue({
  projects: [{ id: '1', name: 'Test Project' }],
});
const mockGetProject = vi.fn().mockResolvedValue({ id: '1', name: 'Test Project' });
const mockCreateProject = vi.fn().mockResolvedValue({ id: '2', name: 'New Project' });
const mockUpdateProject = vi.fn().mockResolvedValue({ id: '1', name: 'Updated' });
const mockApproveProject = vi.fn().mockResolvedValue({ id: '1', status: 'approved' });
const mockStartProject = vi.fn().mockResolvedValue({ id: '1', status: 'started' });
const mockDeliverProject = vi.fn().mockResolvedValue({ id: '1', status: 'delivered' });
const mockDeleteProject = vi.fn().mockResolvedValue(undefined);

vi.mock('@/services/api/mock/projects', () => ({
  fetchProjects: mockFetchProjects,
  getProject: mockGetProject,
  createProject: mockCreateProject,
  updateProject: mockUpdateProject,
  approveProject: mockApproveProject,
  startProject: mockStartProject,
  deliverProject: mockDeliverProject,
  deleteProject: mockDeleteProject,
}));

const mockFetchAssets = vi.fn().mockResolvedValue({
  assets: [{ id: 'a1', name: 'Test Asset' }],
});
const mockGetAsset = vi.fn().mockResolvedValue({ id: 'a1', name: 'Test Asset' });
const mockCreateAsset = vi.fn().mockResolvedValue({ id: 'a2', name: 'New Asset' });
const mockUpdateAsset = vi.fn().mockResolvedValue({ id: 'a1', name: 'Updated Asset' });
const mockPublishAsset = vi.fn().mockResolvedValue({ id: 'a1', status: 'Published' });
const mockDeleteAsset = vi.fn().mockResolvedValue({ success: true, id: 'a1' });

vi.mock('@/services/api/mock/assets', () => ({
  fetchAssets: mockFetchAssets,
  getAsset: mockGetAsset,
  createAsset: mockCreateAsset,
  updateAsset: mockUpdateAsset,
  publishAsset: mockPublishAsset,
  deleteAsset: mockDeleteAsset,
}));

// --------------------------------------------------------------------------
// Tests — ProjectsProvider
// --------------------------------------------------------------------------

describe('ProjectsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list() calls fetchProjects and returns the projects array', async () => {
    const result = await ProjectsProvider.list();

    expect(mockFetchProjects).toHaveBeenCalledWith({});
    expect(result).toEqual([{ id: '1', name: 'Test Project' }]);
  });

  it('list() forwards the filter parameter to fetchProjects', async () => {
    const filter = { status: 'active' };
    await ProjectsProvider.list(filter);

    expect(mockFetchProjects).toHaveBeenCalledWith(filter);
  });

  it('get(id) calls getProject with the correct id', async () => {
    const result = await ProjectsProvider.get('PRJ-001');

    expect(mockGetProject).toHaveBeenCalledWith('PRJ-001');
    expect(result).toEqual({ id: '1', name: 'Test Project' });
  });

  it('create(data) calls createProject with the provided data', async () => {
    const data = { name: 'New Project', client: 'Acme' };
    const result = await ProjectsProvider.create(data);

    expect(mockCreateProject).toHaveBeenCalledWith(data);
    expect(result).toEqual({ id: '2', name: 'New Project' });
  });

  it('update(id, data) calls updateProject with id and data', async () => {
    const data = { name: 'Updated' };
    const result = await ProjectsProvider.update('PRJ-001', data);

    expect(mockUpdateProject).toHaveBeenCalledWith('PRJ-001', data);
    expect(result).toEqual({ id: '1', name: 'Updated' });
  });

  it('approve(id) calls approveProject with the correct id', async () => {
    const result = await ProjectsProvider.approve('PRJ-001');

    expect(mockApproveProject).toHaveBeenCalledWith('PRJ-001');
    expect(result).toEqual({ id: '1', status: 'approved' });
  });

  it('start(id) calls startProject with the correct id', async () => {
    const result = await ProjectsProvider.start('PRJ-001');

    expect(mockStartProject).toHaveBeenCalledWith('PRJ-001');
    expect(result).toEqual({ id: '1', status: 'started' });
  });

  it('deliver(id) calls deliverProject with the correct id', async () => {
    const result = await ProjectsProvider.deliver('PRJ-001');

    expect(mockDeliverProject).toHaveBeenCalledWith('PRJ-001');
    expect(result).toEqual({ id: '1', status: 'delivered' });
  });

  it('delete(id) calls deleteProject with the correct id', async () => {
    const result = await ProjectsProvider.delete('PRJ-001');

    expect(mockDeleteProject).toHaveBeenCalledWith('PRJ-001');
    expect(result).toBeUndefined();
  });
});

// --------------------------------------------------------------------------
// Tests — AssetsProvider
// --------------------------------------------------------------------------

describe('AssetsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list() calls fetchAssets and returns the assets array', async () => {
    const result = await AssetsProvider.list();

    expect(mockFetchAssets).toHaveBeenCalledWith({});
    expect(result).toEqual([{ id: 'a1', name: 'Test Asset' }]);
  });

  it('list() forwards the filter parameter to fetchAssets', async () => {
    const filter = { project_id: 'PRJ-001' };
    await AssetsProvider.list(filter);

    expect(mockFetchAssets).toHaveBeenCalledWith(filter);
  });

  it('get(id) calls getAsset with the correct id', async () => {
    const result = await AssetsProvider.get('AST-101');

    expect(mockGetAsset).toHaveBeenCalledWith('AST-101');
    expect(result).toEqual({ id: 'a1', name: 'Test Asset' });
  });

  it('create(data) calls createAsset with the provided data', async () => {
    const data = { name: 'New Asset', project_id: 'PRJ-001' };
    const result = await AssetsProvider.create(data);

    expect(mockCreateAsset).toHaveBeenCalledWith(data);
    expect(result).toEqual({ id: 'a2', name: 'New Asset' });
  });

  it('update(id, data) calls updateAsset with id and data', async () => {
    const data = { name: 'Updated Asset' };
    const result = await AssetsProvider.update('AST-101', data);

    expect(mockUpdateAsset).toHaveBeenCalledWith('AST-101', data);
    expect(result).toEqual({ id: 'a1', name: 'Updated Asset' });
  });

  it('publish(id) calls publishAsset with the correct id', async () => {
    const result = await AssetsProvider.publish('AST-101');

    expect(mockPublishAsset).toHaveBeenCalledWith('AST-101');
    expect(result).toEqual({ id: 'a1', status: 'Published' });
  });

  it('delete(id) calls deleteAsset with the correct id', async () => {
    const result = await AssetsProvider.delete('AST-101');

    expect(mockDeleteAsset).toHaveBeenCalledWith('AST-101');
    expect(result).toEqual({ success: true, id: 'a1' });
  });
});
