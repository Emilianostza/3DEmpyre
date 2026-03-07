/**
 * Real Projects API Service
 *
 * Connects to Supabase backend for project CRUD operations.
 * Replaces mock data with real database queries.
 *
 * API Endpoints:
 * - GET /projects — List projects (paginated)
 * - GET /projects/:id — Get single project
 * - POST /projects — Create project
 * - PATCH /projects/:id — Update project
 * - DELETE /projects/:id — Soft delete project
 */

import { supabase } from '@/services/supabase/client';
import { ProjectDTO } from '@/types/dtos';
import { ProjectStatus, TierType } from '@/types/domain';

export interface FetchProjectsFilter {
  status?: ProjectStatus;
  tier?: TierType;
  industry?: string;
  assignedTo?: string; // Current user ID
  cursor?: string;
  limit?: number;
}

/**
 * Fetch projects with pagination and filtering
 */
export async function fetchProjects(filter: FetchProjectsFilter = {}): Promise<{
  projects: ProjectDTO[];
  nextCursor?: string;
}> {
  try {
    let query = supabase
      .from('projects')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(filter.limit || 20);

    // Apply filters
    if (filter.status) {
      query = query.eq('status', filter.status);
    }
    if (filter.tier) {
      query = query.eq('tier', filter.tier);
    }
    if (filter.industry) {
      query = query.eq('industry', filter.industry);
    }

    // Cursor-based pagination
    if (filter.cursor) {
      const cursorDate = new Date(filter.cursor);
      query = query.lt('created_at', cursorDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    // Calculate next cursor if we have a full page
    const nextCursor =
      data && data.length >= (filter.limit || 20) ? data[data.length - 1].created_at : undefined;

    return {
      projects: data || [],
      nextCursor,
    };
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProjectsAPI] Fetch failed:', err);
    throw err;
  }
}

/**
 * Get single project by ID
 */
export async function getProject(id: string): Promise<ProjectDTO> {
  try {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

    if (error) {
      throw new Error(`Failed to get project: ${error.message}`);
    }

    if (!data) {
      throw new Error('Project not found');
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProjectsAPI] Get failed:', err);
    throw err;
  }
}

/**
 * Create new project
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  industry: string;
  tier: TierType;
  requestId?: string; // Link to lead request
}

export async function createProject(data: CreateProjectRequest): Promise<ProjectDTO> {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          name: data.name,
          description: data.description,
          industry: data.industry,
          tier: data.tier,
          request_id: data.requestId,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return project;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProjectsAPI] Create failed:', err);
    throw err;
  }
}

/**
 * Update project
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  tier?: TierType;
  assignedTo?: string[];
  customFields?: Record<string, unknown>;
}

export async function updateProject(
  id: string,
  updates: UpdateProjectRequest
): Promise<ProjectDTO> {
  try {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.tier !== undefined) payload.tier = updates.tier;
    if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;
    if (updates.customFields !== undefined) payload.custom_fields = updates.customFields;

    const { data, error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProjectsAPI] Update failed:', err);
    throw err;
  }
}

/**
 * Approve project
 */
export async function approveProject(id: string): Promise<ProjectDTO> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve project: ${error.message}`);
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProjectsAPI] Approve failed:', err);
    throw err;
  }
}

/**
 * Start project work
 */
export async function startProject(id: string): Promise<ProjectDTO> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to start project: ${error.message}`);
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProjectsAPI] Start failed:', err);
    throw err;
  }
}

/**
 * Mark project as delivered
 */
export async function deliverProject(id: string): Promise<ProjectDTO> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to deliver project: ${error.message}`);
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProjectsAPI] Deliver failed:', err);
    throw err;
  }
}

/**
 * Reject project
 */
export async function rejectProject(id: string, reason?: string): Promise<ProjectDTO> {
  try {
    // Fetch existing project to preserve metadata
    const { data: existing } = await supabase
      .from('projects')
      .select('metadata')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('projects')
      .update({
        status: 'rejected',
        metadata: {
          ...((existing?.metadata as Record<string, unknown>) || {}),
          rejection_reason: reason,
        },
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reject project: ${error.message}`);
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProjectsAPI] Reject failed:', err);
    throw err;
  }
}

/**
 * Soft delete project
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProjectsAPI] Delete failed:', err);
    throw err;
  }
}

/**
 * Get project with related assets and assignments
 */
export async function getProjectWithDetails(id: string) {
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError) throw projectError;
    if (!project) throw new Error('Project not found');

    // Fetch assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', id)
      .is('deleted_at', null);

    // Fetch assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*')
      .eq('project_id', id);

    if (assetsError) throw assetsError;
    if (assignmentsError) throw assignmentsError;

    return {
      project,
      assets: assets || [],
      assignments: assignments || [],
    };
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProjectsAPI] Get details failed:', err);
    throw err;
  }
}

/**
 * Export projects as CSV/JSON
 */
export async function exportProjects(
  format: 'csv' | 'json',
  filter?: FetchProjectsFilter
): Promise<{ url: string }> {
  try {
    // Fetch all projects matching filter
    const { projects } = await fetchProjects(filter);

    let content: string;
    let _filename: string;
    let mimeType: string;

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['ID', 'Name', 'Industry', 'Status', 'Tier', 'Created'];
      const rows = projects.map((p) => [
        p.id,
        p.name,
        p.industry,
        p.status,
        p.tier,
        new Date(p.created_at).toISOString(),
      ]);

      content = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      _filename = `projects-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(projects, null, 2);
      _filename = `projects-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    // Create blob and upload to temporary storage
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    return { url };
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProjectsAPI] Export failed:', err);
    throw err;
  }
}
