import { useAuth, AuthProvider } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { CompanyListPage } from './pages/client/CompanyListPage';
import { LogOut } from 'lucide-react';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">BookingPlatform</h1>
              <div className="hidden md:flex items-center gap-4">
                {profile.role === 'client' && (
                  <a
                    href="/"
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Browse Companies
                  </a>
                )}
                {profile.role === 'company' && (
                  <>
                    <a
                      href="/dashboard"
                      className="text-gray-700 hover:text-gray-900 font-medium"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/services"
                      className="text-gray-700 hover:text-gray-900 font-medium"
                    >
                      Services
                    </a>
                    <a
                      href="/schedule"
                      className="text-gray-700 hover:text-gray-900 font-medium"
                    >
                      Schedule
                    </a>
                    <a
                      href="/reservations"
                      className="text-gray-700 hover:text-gray-900 font-medium"
                    >
                      Reservations
                    </a>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{profile.full_name}</p>
                <p className="text-gray-600 capitalize">{profile.role}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {profile.role === 'company' && <CompanyDashboard />}
        {profile.role === 'client' && <CompanyListPage />}
        {profile.role === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600 mt-2">Admin features coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
