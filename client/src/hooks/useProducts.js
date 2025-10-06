import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const PRODUCT_QUERY_KEY = ['inventory', 'products'];

export function useProducts(searchParams = {}) {
  return useQuery({
    queryKey: [...PRODUCT_QUERY_KEY, searchParams],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: searchParams });
      return data?.products ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}