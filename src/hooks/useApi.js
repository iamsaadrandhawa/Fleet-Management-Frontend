// frontend/src/hooks/useApi.js
import { useState, useCallback } from 'react';
import * as api from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequest = useCallback(async (requestFn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await requestFn(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
      throw err;
    }
  }, []);

  return { loading, error, handleRequest };
};