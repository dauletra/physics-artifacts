import { useState, useEffect, useCallback } from 'react';
import type { Section } from '../types/artifact.types';
import { sectionService } from '../services/sectionService';

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    return sectionService
      .getAll()
      .then(data => {
        setSections(data.sort((a, b) => a.order - b.order));
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

  return { sections, loading, error, reload };
}
