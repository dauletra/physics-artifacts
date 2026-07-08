import { useState, useEffect, useCallback } from 'react';
import type { Admin } from '../types/artifact.types';
import { adminService } from '../services/adminService';

export function useAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    return adminService
      .getAll()
      .then(data => {
        setAdmins(data.sort((a, b) => a.email.localeCompare(b.email)));
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

  return { admins, loading, error, reload };
}
