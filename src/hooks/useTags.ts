import { useState, useEffect } from 'react';
import type { Tag } from '../types/artifact.types';
import { tagService } from '../services/tagService';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = () => {
    setLoading(true);
    tagService
      .getAll()
      .then(data => setTags(data.sort((a, b) => a.order - b.order)))
      .catch(err => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return { tags, loading, error, reload: load };
}
