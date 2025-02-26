import React from 'react';
import { Loading } from './Loading';
import { ErrorBoundary } from './ErrorBoundary';

interface AsyncWrapperProps {
  loading: boolean;
  error: Error | null;
  onRetry?: () => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyComponent?: React.ReactNode;
}

export function AsyncWrapper({
  loading,
  error,
  onRetry,
  loadingComponent,
  errorComponent,
  children,
  isEmpty,
  emptyComponent,
}: AsyncWrapperProps) {
  // Show loading state
  if (loading) {
    return loadingComponent || (
      <div className="flex items-center justify-center p-8">
        <Loading size="lg" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return errorComponent || (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{error.message}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Show empty state
  if (isEmpty) {
    return emptyComponent || (
      <div className="text-center p-8 text-gray-500">
        No data available
      </div>
    );
  }

  // Show content
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

// Higher-order component version
export function withAsync<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<AsyncWrapperProps, 'children'> = {
    loading: false,
    error: null,
  }
) {
  return function WithAsyncWrapper(props: P) {
    return (
      <AsyncWrapper {...options}>
        <WrappedComponent {...props} />
      </AsyncWrapper>
    );
  };
} 