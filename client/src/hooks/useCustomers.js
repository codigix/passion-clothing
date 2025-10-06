import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export function useCustomers(search = '') {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      const { data } = await api.get('/sales/customers', { params: { search } });
      return data?.customers || [];
    },
  });
}