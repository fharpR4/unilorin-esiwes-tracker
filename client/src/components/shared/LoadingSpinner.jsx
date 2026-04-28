import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoadingSpinner = ({ fullScreen = false, size = 'md', message = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className={cn('animate-spin text-unilorin-primary dark:text-blue-400', sizes[size])} />
        {message && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className={cn('animate-spin text-unilorin-primary dark:text-blue-400', sizes[size])} />
      {message && <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;