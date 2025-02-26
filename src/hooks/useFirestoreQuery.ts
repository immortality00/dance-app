import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Query,
  QuerySnapshot,
  DocumentData,
  onSnapshot,
  getDocs,
  startAfter,
  limit,
  query,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { useAuth } from './useAuth';

interface QueryState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

interface UseFirestoreQueryOptions<T> {
  pageSize?: number;
  realtimeUpdates?: boolean;
  parseDoc?: (doc: QueryDocumentSnapshot<DocumentData>) => T;
}

const defaultOptions = {
  pageSize: 10,
  realtimeUpdates: false,
  parseDoc: (doc: QueryDocumentSnapshot<DocumentData>) => ({
    id: doc.id,
    ...doc.data(),
  }),
};

export function useFirestoreQuery<T = DocumentData>(
  baseQuery: Query<DocumentData>,
  options: UseFirestoreQueryOptions<T> = {}
) {
  const mergedOptions = { ...defaultOptions, ...options } as UseFirestoreQueryOptions<T>;
  const { user } = useAuth();
  const queryRef = useRef(baseQuery);

  const [state, setState] = useState<QueryState<T>>({
    data: [],
    loading: true,
    error: null,
    hasMore: true,
    lastDoc: null,
  });

  const [loadingMore, setLoadingMore] = useState(false);

  // Handle query snapshot
  const handleSnapshot = useCallback((snapshot: QuerySnapshot<DocumentData>) => {
    setState(prev => {
      const newDocs = snapshot.docs.map(doc => mergedOptions.parseDoc!(doc));
      const hasMore = newDocs.length === mergedOptions.pageSize;
      const lastDoc = newDocs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

      return {
        data: newDocs,
        loading: false,
        error: null,
        hasMore,
        lastDoc,
      };
    });
  }, [mergedOptions.pageSize, mergedOptions.parseDoc]);

  // Handle error
  const handleError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      loading: false,
      error,
    }));
    console.error('Firestore query error:', error);
  }, []);

  // Initial fetch and real-time updates setup
  useEffect(() => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true }));

    const paginatedQuery = query(
      queryRef.current,
      limit(mergedOptions.pageSize!)
    );

    if (mergedOptions.realtimeUpdates) {
      const unsubscribe = onSnapshot(
        paginatedQuery,
        handleSnapshot,
        handleError
      );
      return () => unsubscribe();
    } else {
      getDocs(paginatedQuery)
        .then(handleSnapshot)
        .catch(handleError);
    }
  }, [
    user,
    mergedOptions.pageSize,
    mergedOptions.realtimeUpdates,
    handleSnapshot,
    handleError,
  ]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (!state.hasMore || !state.lastDoc || loadingMore) return;

    setLoadingMore(true);

    try {
      const paginatedQuery = query(
        queryRef.current,
        startAfter(state.lastDoc),
        limit(mergedOptions.pageSize!)
      );
      
      const snapshot = await getDocs(paginatedQuery);
      const newDocs = snapshot.docs.map(doc => mergedOptions.parseDoc!(doc));
      const hasMore = newDocs.length === mergedOptions.pageSize;
      const lastDoc = newDocs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

      setState(prev => ({
        data: [...prev.data, ...newDocs],
        loading: false,
        error: null,
        hasMore,
        lastDoc,
      }));
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to load more data'));
    } finally {
      setLoadingMore(false);
    }
  }, [
    state.hasMore,
    state.lastDoc,
    loadingMore,
    mergedOptions.pageSize,
    mergedOptions.parseDoc,
    handleError,
  ]);

  // Refresh data
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const paginatedQuery = query(
        queryRef.current,
        limit(mergedOptions.pageSize!)
      );
      
      const snapshot = await getDocs(paginatedQuery);
      handleSnapshot(snapshot);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to refresh data'));
    }
  }, [mergedOptions.pageSize, handleSnapshot, handleError]);

  return {
    ...state,
    loadingMore,
    loadMore,
    refresh,
    isEmpty: !state.loading && state.data.length === 0,
  };
} 