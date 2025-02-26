import { useState, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiRequestOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useApiRequest<T>(options: UseApiRequestOptions = {}) {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { showToast } = useToast();

  const execute = useCallback(
    async (
      requestFn: () => Promise<T>,
      customOptions: Partial<UseApiRequestOptions> = {}
    ) => {
      const mergedOptions = { ...options, ...customOptions };
      
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await requestFn();
        
        setState(prev => ({ ...prev, data: result, loading: false }));
        
        if (mergedOptions.successMessage) {
          showToast(mergedOptions.successMessage, 'success');
        }
        
        mergedOptions.onSuccess?.(result);
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
        
        setState(prev => ({ ...prev, error: errorObj, loading: false }));
        
        if (mergedOptions.errorMessage) {
          showToast(mergedOptions.errorMessage, 'error');
        }
        
        mergedOptions.onError?.(errorObj);
        throw errorObj;
      }
    },
    [options, showToast]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: !state.loading && !state.error && !state.data,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !state.loading && !state.error && !!state.data,
  };
} 