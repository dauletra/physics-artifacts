import { useState, useEffect } from 'react';
import type { Artifact } from '../types/artifact.types';
import { artifactService } from '../services/artifactService';

export function useArtifacts(groupId: string) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    artifactService
      .getByGroupId(groupId)
      .then(data => setArtifacts(data.sort((a, b) => a.order - b.order)))
      .catch(err => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { artifacts, loading, error };
}
