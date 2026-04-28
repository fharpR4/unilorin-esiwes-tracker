import { useEffect, useState } from 'react';

const SplashScreen = ({ finishLoading }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => finishLoading(), 3500);
    return () => clearTimeout(timer);
  }, [finishLoading]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center splash-animate">
        {/* Logo placeholder — replace with actual SVG file */}
        <div className="mb-8 flex items-center justify-center">
          <div className="w-44 h-44 rounded-full bg-unilorin-primary dark:bg-blue-900 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-heading font-bold text-white">UNIILORIN</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-heading font-bold text-unilorin-primary dark:text-white mb-2">
          University of Ilorin
        </h1>
        <p className="text-lg md:text-xl font-heading font-semibold text-unilorin-secondary dark:text-yellow-400 mb-3">
          E-SIWES Progress Tracker
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
          Making SIWES Digital &bull; Better &bull; Verified
        </p>

        <div className="flex items-center justify-center gap-2">
          {[0, 0.3, 0.6].map((delay, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full splash-pulse ${i % 2 === 0 ? 'bg-unilorin-primary dark:bg-blue-500' : 'bg-unilorin-secondary dark:bg-yellow-500'}`}
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-xs text-black-500 dark:text-gray-600">Developed by Festus Israel Omoloye</p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
          &copy; {new Date().getFullYear()} University of Ilorin
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;