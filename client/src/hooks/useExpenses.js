import { useCallback, useEffect, useState } from 'react';
import api from '../lib/axios';

export const useExpenses = (params = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/expenses', { params });
      setExpenses(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load expenses');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { expenses, loading, error, refetch: fetchExpenses };
};
