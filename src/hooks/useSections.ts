import { useState, useEffect } from 'react';
import type { Section } from '../types/artifact.types';
import { sectionService } from '../services/sectionService';

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = () => {
    setLoading(true);
    sectionService
      .getAll()
      .then(data => setSections(data.sort((a, b) => a.order - b.order)))
      .catch(err => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return { sections, loading, error, reload: load };
}
