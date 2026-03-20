import { useState, useEffect } from 'react';
import type { ProjectData, BackOfficeResponse } from '@/types';
import { getProjectData } from '@/services/backOffice';

interface UseProjectReturn {
  project: ProjectData | null;
  loading: boolean;
  error: string | null;
}

export const useProject = (projectCode: string | null): UseProjectReturn => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectCode) {
        setError('INVALID_CODE');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response: BackOfficeResponse = await getProjectData(projectCode);
        
        if (response.success && response.project) {
          setProject(response.project);
        } else {
          setError(response.error || 'UNKNOWN_ERROR');
        }
      } catch (err) {
        setError('NETWORK_ERROR');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectCode]);

  return {
    project,
    loading,
    error
  };
};
