import { useState, useEffect } from 'react';
import type { Admin } from '../types/artifact.types';
import { adminService } from '../services/adminService';

export function useAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = () => {
    setLoading(true);
    adminService
      .getAll()
      .then(data => setAdmins(data.sort((a, b) => a.email.localeCompare(b.email))))
      .catch(err => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return { admins, loading, error, reload: load };
}
