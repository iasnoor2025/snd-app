import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface EquipmentCategory {
  id: number;
  name: string | Record<string, string>;
}

function getCategoryName(name: any): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  if (typeof name === 'object') {
    if (name.en) return name.en;
    const first = Object.values(name).find(v => typeof v === 'string');
    if (first) return first;
  }
  return '';
}

export function useEquipmentCategories(initialCategories: EquipmentCategory[] = []) {
  const [categories, setCategories] = useState<EquipmentCategory[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/equipment/create', { headers: { Accept: 'application/json' } });
      if (res.data && res.data.categories) {
        setCategories(res.data.categories);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Always return categories with a string name
  const normalizedCategories = categories.map(cat => ({
    ...cat,
    name: getCategoryName(cat.name)
  }));

  return { categories: normalizedCategories, loading, error, refresh: fetchCategories };
}
