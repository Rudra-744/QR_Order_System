import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from './apiClient';

export const usePlaceOrder = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post('/orders', payload.data, {
        headers: { "Idempotency-Key": payload.idempotencyKey },
        silent: true, // Handle errors explicitly in the UI rather than global toast
      });
      return data;
    },
    retry: (failureCount, error) => {
      const status = error.response?.status;
      // Do NOT retry 4xx errors
      if (status && status >= 400 && status < 500) return false;
      // Do NOT retry generic 500 structural errors
      if (status === 500) return false;
      
      // Retry explicitly transient errors: Network Error, timeout, 502, 503, 504
      if (!status || [502, 503, 504].includes(status)) {
        return failureCount < 3; // Retry up to 3 times
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000), // Exponential backoff (1s, 2s, 4s)
  });
};

export const useMenu = (restaurantId) => {
  return useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data } = await apiClient.get(`/menu?restaurantId=${restaurantId}`, {
        silent: true // don't show global toast for menu fetch errors (we have a custom UI)
      });
      return data;
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const status = error.response?.status;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 3;
    }
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/orders');
      return data.data || data;
    }
  });
};

export const useTables = () => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data } = await apiClient.get('/tables');
      return data;
    }
  });
};

export const useOrderStatus = (orderId, idempotencyKey) => {
  return useQuery({
    queryKey: ['orderStatus', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data } = await apiClient.get(`/orders/${orderId}`, {
        headers: { "idempotency-key": idempotencyKey },
        silent: true
      });
      return data;
    },
    enabled: !!orderId,
    refetchInterval: (query) => {
      const status = query.state?.data?.status || query.data?.status;
      if (['completed', 'cancelled', 'rejected'].includes(status)) {
        return false;
      }
      return 10000;
    }
  });
};
