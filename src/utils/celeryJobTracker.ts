import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

interface JobStatus {
  id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILURE' | 'RETRY' | 'REVOKED';
  result?: any;
  error?: string;
}

export const startJobWithTracking = async (
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    startTitle: string;
    startDescription: string;
    successTitle: string;
    successDescription: string;
    errorTitle: string;
    errorDescription: string;
    onComplete?: () => void;
  }
) => {
  const {
    method = 'POST',
    body,
    startTitle,
    startDescription,
    successTitle,
    successDescription,
    errorTitle,
    errorDescription,
    onComplete
  } = options;

  // Show start notification
  toast({
    title: startTitle,
    description: startDescription,
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // If response contains task_id, start polling for job status
    if (data.task_id) {
      pollJobStatus(data.task_id, {
        successTitle,
        successDescription,
        errorTitle,
        errorDescription,
        onComplete
      });
    } else {
      // Immediate completion (fallback for non-celery endpoints)
      toast({
        title: successTitle,
        description: data.message || successDescription,
      });
      
      if (onComplete) {
        onComplete();
      }
    }
    
    return data;
  } catch (error) {
    console.error('Job start error:', error);
    toast({
      title: errorTitle,
      description: errorDescription,
      variant: "destructive",
    });
    throw error;
  }
};

const pollJobStatus = (
  taskId: string,
  options: {
    successTitle: string;
    successDescription: string;
    errorTitle: string;
    errorDescription: string;
    onComplete?: () => void;
    pollInterval?: number;
    maxAttempts?: number;
  }
) => {
  const {
    successTitle,
    successDescription,
    errorTitle,
    errorDescription,
    onComplete,
    pollInterval = 2000, // Poll every 2 seconds
    maxAttempts = 150 // Max 5 minutes (150 * 2s)
  } = options;

  let attempts = 0;

  const checkStatus = async () => {
    attempts++;
    
    try {
      const response = await fetch(`${API_BASE_URL}/task-status/${taskId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jobStatus: JobStatus = await response.json();
      
      switch (jobStatus.status) {
        case 'SUCCESS':
          toast({
            title: successTitle,
            description: jobStatus.result?.message || successDescription,
          });
          
          if (onComplete) {
            onComplete();
          }
          return;
          
        case 'FAILURE':
          toast({
            title: errorTitle,
            description: jobStatus.error || errorDescription,
            variant: "destructive",
          });
          return;
          
        case 'PENDING':
        case 'RETRY':
          // Continue polling if within limits
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, pollInterval);
          } else {
            toast({
              title: "Job Timeout",
              description: "The job is taking longer than expected. Please check back later.",
              variant: "destructive",
            });
          }
          break;
          
        case 'REVOKED':
          toast({
            title: "Job Cancelled",
            description: "The job was cancelled.",
            variant: "destructive",
          });
          return;
          
        default:
          // Continue polling for unknown status
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, pollInterval);
          } else {
            toast({
              title: "Job Status Unknown",
              description: "Unable to determine job status. Please check back later.",
              variant: "destructive",
            });
          }
      }
    } catch (error) {
      console.error('Error checking job status:', error);
      
      // Continue polling on error if within limits
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, pollInterval);
      } else {
        toast({
          title: "Job Status Error",
          description: "Unable to check job status. Please refresh and try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Start polling
  setTimeout(checkStatus, pollInterval);
};