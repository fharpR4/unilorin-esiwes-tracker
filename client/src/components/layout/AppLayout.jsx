import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

const AppLayout = ({ children, pageTitle = '', allowedRoles = [] }) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        {/* Desktop sidebar — hidden on mobile */}
        <Sidebar />

        {/* Main content — offset by sidebar width on desktop */}
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <Header pageTitle={pageTitle} />
          <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>

        {/* Mobile bottom navigation — only shown on mobile */}
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
};

export default AppLayout;