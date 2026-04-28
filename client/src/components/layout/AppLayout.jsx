import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { cn } from '@/lib/utils';

const AppLayout = ({ children, pageTitle = '', allowedRoles = [] }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <Sidebar />

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-20 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main content area */}
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <Header pageTitle={pageTitle} onMenuClick={() => setMobileMenuOpen((v) => !v)} />
          <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>

        <MobileNav />
      </div>
    </ProtectedRoute>
  );
};

export default AppLayout;