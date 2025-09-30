import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResilioAgent, ResilioJob, ResilioSystemInfo, ResilioAPIResponse, CreateJobRequest } from '@/types/resilio';

export const useResilioAgents = () => {
  return useQuery<ResilioAPIResponse<{ agents: ResilioAgent[] }>>({
    queryKey: ['resilio', 'agents'],
    queryFn: async () => {
      const response = await fetch('/api/resilio/agents');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useResilioJobs = () => {
  return useQuery<ResilioAPIResponse<{ jobs: ResilioJob[] }>>({
    queryKey: ['resilio', 'jobs'],
    queryFn: async () => {
      const response = await fetch('/api/resilio/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });
};

export const useResilioSystemInfo = () => {
  return useQuery<ResilioAPIResponse<ResilioSystemInfo>>({
    queryKey: ['resilio', 'info'],
    queryFn: async () => {
      const response = await fetch('/api/resilio/info');
      if (!response.ok) {
        throw new Error('Failed to fetch system info');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (jobData: CreateJobRequest) => {
      const response = await fetch('/api/resilio/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        // Try to get detailed error information
        let errorMessage = 'Failed to create job';
        let errorDetails = null;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          errorDetails = errorData;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        
        // Create an error object with more details
        const error = new Error(errorMessage) as any;
        error.status = response.status;
        error.details = errorDetails;
        throw error;
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch jobs data
      queryClient.invalidateQueries({ queryKey: ['resilio', 'jobs'] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/resilio/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch jobs data
      queryClient.invalidateQueries({ queryKey: ['resilio', 'jobs'] });
    },
  });
};
