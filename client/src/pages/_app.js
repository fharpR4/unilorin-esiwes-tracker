import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import SplashScreen from '@/components/layout/SplashScreen';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="esiwes-theme">
        <SplashScreen finishLoading={() => setSplashDone(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="esiwes-theme"
    >
      <AuthProvider>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}