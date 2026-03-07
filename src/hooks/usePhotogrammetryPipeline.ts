import { useState, useEffect, useCallback, useRef } from 'react';
import type { PhotogrammetryJobDTO } from '@/types/photogrammetry';
import {
  fetchJobs as apiFetchJobs,
  getJob as apiGetJob,
  cancelJob as apiCancelJob,
} from '@/services/api/real/photogrammetry';
import { PhotogrammetryJobStatus } from '@/types/domain';

// Statuses that indicate the job is actively processing
const ACTIVE_STATUSES: PhotogrammetryJobStatus[] = [
  PhotogrammetryJobStatus.Queued,
  PhotogrammetryJobStatus.Preprocessing,
  PhotogrammetryJobStatus.FeatureExtraction,
  PhotogrammetryJobStatus.FeatureMatching,
  PhotogrammetryJobStatus.SparseReconstruction,
  PhotogrammetryJobStatus.DenseReconstruction,
  PhotogrammetryJobStatus.Meshing,
  PhotogrammetryJobStatus.Texturing,
  PhotogrammetryJobStatus.Converting,
];

export const usePhotogrammetryPipeline = () => {
  const [jobs, setJobs] = useState<PhotogrammetryJobDTO[]>([]);
  const [activeJob, setActiveJob] = useState<PhotogrammetryJobDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Fetch all photogrammetry jobs for a project
   */
  const fetchJobs = useCallback(async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { jobs: fetchedJobs } = await apiFetchJobs({ projectId });
      setJobs(fetchedJobs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(message);
      if (import.meta.env.DEV) console.error('[usePhotogrammetryPipeline] Fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new photogrammetry job (delegates to the page/wizard to call the API)
   * This hook just adds the returned job to its state.
   */
  const addJob = useCallback((job: PhotogrammetryJobDTO) => {
    setJobs((prev) => [job, ...prev]);
    setActiveJob(job);
  }, []);

  /**
   * Cancel a photogrammetry job
   */
  const cancelJob = useCallback(async (id: string) => {
    try {
      setError(null);
      await apiCancelJob(id);
      setJobs((prev) =>
        prev.map((job) =>
          job.id === id
            ? { ...job, status: PhotogrammetryJobStatus.Cancelled }
            : job
        )
      );
      if (activeJob?.id === id) {
        setActiveJob(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel job';
      setError(message);
      if (import.meta.env.DEV) console.error('[usePhotogrammetryPipeline] Cancel failed:', err);
    }
  }, [activeJob]);

  /**
   * Select a job as the active job
   */
  const selectJob = useCallback((id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (job) {
      setActiveJob(job);
    }
  }, [jobs]);

  /**
   * Refresh the status of a specific job
   */
  const refreshJobStatus = useCallback(async (id: string) => {
    try {
      const updatedJob = await apiGetJob(id);
      setJobs((prev) =>
        prev.map((job) => (job.id === id ? updatedJob : job))
      );
      if (activeJob?.id === id) {
        setActiveJob(updatedJob);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('[usePhotogrammetryPipeline] Refresh failed:', err);
    }
  }, [activeJob]);

  /**
   * Auto-polling: polls the active job every 5 seconds if it is in an active state
   */
  useEffect(() => {
    if (!activeJob || !ACTIVE_STATUSES.includes(activeJob.status)) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    pollingIntervalRef.current = setInterval(() => {
      refreshJobStatus(activeJob.id);
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [activeJob, refreshJobStatus]);

  return {
    jobs,
    activeJob,
    isLoading,
    error,
    fetchJobs,
    addJob,
    cancelJob,
    selectJob,
    refreshJobStatus,
  };
};
