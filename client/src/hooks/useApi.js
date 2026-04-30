import useSWR from 'swr';
import api from '@/lib/api';

/**
 * Fetches data from the API and returns the FULL response object.
 *
 * API always returns: { success, data: { FIELD }, count?, page?, unreadCount? }
 *
 * Usage in components:
 *   const { data, isLoading } = useApi('/logs');
 *   const logs = data?.data?.logs || [];
 *   const total = data?.count || 0;
 *
 * For notifications:
 *   const unread = data?.unreadCount || 0;
 *   const notifications = data?.data?.notifications || [];
 */
const fetcher = (url) => api.get(url).then((res) => res.data);

const useApi = (url, options = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    url || null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3000,
      errorRetryCount: 2,
      ...options,
    }
  );

  return { data, error, isLoading, mutate };
};

export default useApi;