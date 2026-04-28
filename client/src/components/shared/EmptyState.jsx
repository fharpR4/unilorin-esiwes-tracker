import { FileX } from 'lucide-react';

const EmptyState = ({ icon: Icon = FileX, title = 'Nothing here yet', description = '', action = null }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
    </div>
    <h3 className="text-lg font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;