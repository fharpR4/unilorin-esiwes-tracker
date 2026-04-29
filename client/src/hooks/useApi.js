import useSWR from 'swr';
import api from '@/lib/api';

/**
 * The API returns: { success: true, data: { ... }, count, page, pages }
 * This hook returns the FULL response object so components can access
 * data.logs, data.students, data.attendance, data.records, etc.
 * as well as top-level count, page, unreadCount etc.
 */
const fetcher = async (url) => {
  const response = await api.get(url);
  return response.data; // Returns the full { success, data, count, page, unreadCount, ... }
};

const useApi = (url, options = {}) => {
  const { data: response, error, isLoading, mutate } = useSWR(
    url || null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      ...options,
    }
  );

  return {
    data: response,        // Full response — access as data?.data?.logs, data?.count etc.
    error,
    isLoading,
    mutate,
  };
};

export default useApi;