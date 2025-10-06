import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const VENDOR_QUERY_KEY = ['procurement', 'vendors'];

export function useVendors(searchParams = {}) {
  return useQuery({
    queryKey: [...VENDOR_QUERY_KEY, searchParams],
    queryFn: async () => {
      const { data } = await api.get('/procurement/vendors', { params: searchParams });
      return data?.vendors ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}