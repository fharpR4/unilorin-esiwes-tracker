import useSWR from 'swr';
import api from '@/lib/api';

const fetcher = async (url) => {
  const { data } = await api.get(url);
  return data;
};

const useApi = (url, options = {}) => {
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    ...options,
  });

  return {
    data: data?.data,
    error,
    isLoading,
    mutate,
  };
};

export default useApi;