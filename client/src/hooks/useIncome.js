import { useCallback, useEffect, useState } from 'react';
import api from '../lib/axios';

export const useIncome = (params = {}) => {
  const [entries, setEntries] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIncome = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/income', { params });
      setEntries(data.data.entries);
      setMeta({ total: data.data.total, page: data.data.page, pages: data.data.pages });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load income entries');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchIncome();
  }, [fetchIncome]);

  return { entries, meta, loading, error, refetch: fetchIncome };
};
