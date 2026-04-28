import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const ThemeToggle = ({ showLabel = true }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const config = {
    light: { icon: Sun, label: 'Light', color: 'text-unilorin-secondary' },
    dark: { icon: Moon, label: 'Dark', color: 'text-blue-400' },
    system: { icon: Monitor, label: 'System', color: 'text-gray-400 dark:text-gray-500' },
  };

  const current = config[theme] || config.system;
  const Icon = current.icon;

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${current.label}. Click to switch.`}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
        'bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-600'
      )}
    >
      <Icon className={cn('h-4 w-4', current.color)} />
      {showLabel && (
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {current.label}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;