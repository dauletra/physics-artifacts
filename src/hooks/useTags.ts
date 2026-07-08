import { useState, useEffect, useCallback } from 'react';
import type { Tag } from '../types/artifact.types';
import { tagService } from '../services/tagService';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    return tagService
      .getAll()
      .then(data => {
        setTags(data.sort((a, b) => a.order - b.order));
        setError(null);
      })
      .catch(err => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchData();
  }, [fetchData]);

  return { tags, loading, error, reload };
}
