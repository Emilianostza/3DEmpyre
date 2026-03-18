/**
 * Mock Projects API Service
 *
 * Provides realistic project data for development and testing.
 * Simulates network latency with artificial delays.
 *
 * This service is used when VITE_USE_MOCK_DATA=true or when the real API is unavailable.
 */

import { Project } from '@/types';
import { ProjectStatus } from '@/types/domain';

// ── Helper: deterministic date offsets ──────────────────────────
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

// Mutable in-memory store for mock projects
const MOCK_PROJECTS: Project[] = [
  // ── Bistro 55 (2 projects) ─────────────────────────────────────
  {
    id: 'PRJ-001',
    name: 'Summer Menu Update',
    client: 'Bistro 55',
    customer_id: 'cust-bistro',
    status: ProjectStatus.Delivered,
    items: 12,
    type: 'restaurant_menu',
    address: '123 Main St, Austin TX',
    created_at: daysAgo(45),
    updated_at: daysAgo(5),
  },
  {
    id: 'PRJ-002',
    name: 'Cocktail Bar Remodel',
    client: 'Bistro 55',
    customer_id: 'cust-bistro',
    status: ProjectStatus.Approved,
    items: 8,
    type: 'restaurant_menu',
    address: '123 Main St, Austin TX',
    created_at: daysAgo(20),
    updated_at: daysAgo(3),
  },

  // ── Café Luna (3 projects) ─────────────────────────────────────
  {
    id: 'PRJ-004',
    name: 'Full Menu Digitization',
    client: 'Café Luna',
    customer_id: 'cust-retail',
    status: ProjectStatus.InProgress,
    items: 24,
    type: 'restaurant_menu',
    address: '8 Rue de Rivoli, Paris',
    phone: '+33 1 44 55 66 77',
    created_at: daysAgo(30),
    updated_at: daysAgo(1),
  },
  {
    id: 'PRJ-005',
    name: 'Pastry Collection',
    client: 'Café Luna',
    customer_id: 'cust-retail',
    status: ProjectStatus.QA,
    items: 10,
    type: 'restaurant_menu',
    address: '8 Rue de Rivoli, Paris',
    created_at: daysAgo(18),
    updated_at: daysAgo(2),
  },
  {
    id: 'PRJ-006',
    name: 'Wine Cellar Experience',
    client: 'Café Luna',
    customer_id: 'cust-retail',
    status: ProjectStatus.Processing,
    items: 15,
    type: 'restaurant_menu',
    address: '8 Rue de Rivoli, Paris',
    created_at: daysAgo(10),
    updated_at: daysAgo(1),
  },

  // ── Hotel Athena (3 projects) ──────────────────────────────────
  {
    id: 'PRJ-007',
    name: 'Lobby & Restaurant 3D Tour',
    client: 'Hotel Athena',
    customer_id: 'cust-hotel',
    status: ProjectStatus.Delivered,
    items: 18,
    type: 'standard',
    address: '45 Mitropoleos St, Athens',
    created_at: daysAgo(60),
    updated_at: daysAgo(15),
  },
  {
    id: 'PRJ-008',
    name: 'Rooftop Bar Menu',
    client: 'Hotel Athena',
    customer_id: 'cust-hotel',
    status: ProjectStatus.Approved,
    items: 14,
    type: 'restaurant_menu',
    address: '45 Mitropoleos St, Athens',
    created_at: daysAgo(25),
    updated_at: daysAgo(4),
  },
  {
    id: 'PRJ-009',
    name: 'Spa Product Showcase',
    client: 'Hotel Athena',
    customer_id: 'cust-hotel',
    status: ProjectStatus.Rejected,
    items: 5,
    type: 'product_showcase',
    address: '45 Mitropoleos St, Athens',
    rejection_reason: 'Client requested higher resolution captures',
    created_at: daysAgo(35),
    updated_at: daysAgo(30),
  },

  // ── Tallinn Market Hall (3 projects) ───────────────────────────
  {
    id: 'PRJ-010',
    name: 'Vendor Stall Menus',
    client: 'Tallinn Market Hall',
    customer_id: 'cust-realestate',
    status: ProjectStatus.Delivered,
    items: 32,
    type: 'restaurant_menu',
    address: 'Keldrimäe 9, Tallinn',
    created_at: daysAgo(90),
    updated_at: daysAgo(40),
  },
  {
    id: 'PRJ-011',
    name: 'Artisan Products Collection',
    client: 'Tallinn Market Hall',
    customer_id: 'cust-realestate',
    status: ProjectStatus.Archived,
    items: 20,
    type: 'product_showcase',
    address: 'Keldrimäe 9, Tallinn',
    created_at: daysAgo(120),
    updated_at: daysAgo(90),
  },
  {
    id: 'PRJ-012',
    name: 'Spring Market Refresh',
    client: 'Tallinn Market Hall',
    customer_id: 'cust-realestate',
    status: ProjectStatus.Assigned,
    items: 16,
    type: 'restaurant_menu',
    address: 'Keldrimäe 9, Tallinn',
    assigned_to: 'tech-001',
    created_at: daysAgo(5),
    updated_at: daysAgo(1),
  },
];

// Simulate network latency
const NETWORK_DELAY = 500;

/**
 * Fetch all projects (with optional filtering)
 */
export async function fetchProjects(filter: Record<string, string> = {}) {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY));

  let results = [...MOCK_PROJECTS];

  // Apply filters if provided
  if (filter.customer_id) {
    results = results.filter((p) => p.customer_id === filter.customer_id);
  }
  if (filter.status) {
    results = results.filter((p) => p.status === filter.status);
  }
  if (filter.client) {
    results = results.filter((p) => p.client.toLowerCase().includes(filter.client.toLowerCase()));
  }

  return {
    projects: results,
    total: results.length,
    page: 1,
    pageSize: results.length,
  };
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string) {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY));

  const project = MOCK_PROJECTS.find((p) => p.id === id);
  if (!project) {
    throw new Error(`Project ${id} not found`);
  }
  return project;
}

/**
 * Create a new project
 */
export async function createProject(data: Partial<Project>) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newProject: Project = {
    id: `PRJ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    name: data.name || 'Untitled Project',
    client: data.client || 'New Client',
    status: ProjectStatus.Pending,
    items: 0,
    type: data.type || 'standard',
    address: data.address,
    phone: data.phone,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  MOCK_PROJECTS.unshift(newProject);
  return newProject;
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, data: Partial<Project>) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = MOCK_PROJECTS.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Project ${id} not found`);
  }

  const updated = {
    ...MOCK_PROJECTS[index],
    ...data,
    id: MOCK_PROJECTS[index].id, // Prevent ID changes
    updated_at: new Date().toISOString(),
  };

  MOCK_PROJECTS[index] = updated;
  return updated;
}

/**
 * Approve a project (transitions from Pending to Approved)
 */
export async function approveProject(id: string) {
  return updateProject(id, { status: ProjectStatus.Approved });
}

/**
 * Start processing a project (transitions to Processing)
 */
export async function startProject(id: string) {
  return updateProject(id, { status: ProjectStatus.Processing });
}

/**
 * Deliver a project (transitions to Delivered)
 */
export async function deliverProject(id: string) {
  return updateProject(id, { status: ProjectStatus.Delivered });
}

/**
 * Delete a project
 */
export async function deleteProject(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = MOCK_PROJECTS.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Project ${id} not found`);
  }

  MOCK_PROJECTS.splice(index, 1);
  return { success: true, id };
}

// Default export for easier importing
export default {
  fetchProjects,
  getProject,
  createProject,
  updateProject,
  approveProject,
  startProject,
  deliverProject,
  deleteProject,
};
