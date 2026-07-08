import { useState, useEffect } from 'react';
import type { Artifact } from '../types/artifact.types';
import { artifactService } from '../services/artifactService';

export function useArtifacts(groupId: string) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!groupId) return;
    // Refetch-on-prop-change: groupId can change without remounting this hook,
    // so loading must be reset here (React's own "fetch when id changes" pattern).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    artifactService
      .getByGroupId(groupId)
      .then(data => setArtifacts(data.sort((a, b) => a.order - b.order)))
      .catch(err => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { artifacts, loading, error };
}
