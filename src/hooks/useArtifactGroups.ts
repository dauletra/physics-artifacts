import { useState, useEffect, useCallback } from 'react';
import type { ArtifactGroup } from '../types/artifact.types';
import { artifactGroupService } from '../services/artifactGroupService';

interface Options {
  publicOnly?: boolean;
}

export function useArtifactGroups({ publicOnly = false }: Options = {}) {
  const [groups, setGroups] = useState<ArtifactGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    const fetch = publicOnly
      ? artifactGroupService.getPublic()
      : artifactGroupService.getAll();

    return fetch
      .then(data => {
        setGroups(data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
        setError(null);
      })
      .catch(err => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setLoading(false));
  }, [publicOnly]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchData();
  }, [fetchData]);

  return { groups, loading, error, reload };
}
