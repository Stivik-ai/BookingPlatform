import { useState } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { CompanyListPage } from './pages/client/CompanyListPage';
import { CompanyProfilePage } from './pages/client/CompanyProfilePage';
import { CompanyProfileForm } from './components/company/CompanyProfileForm';
import { ServicesManagement } from './components/company/ServicesManagement';
import { ScheduleManagement } from './components/company/ScheduleManagement';
import { BookingsManagement } from './components/company/BookingsManagement';
import { LogOut, Building2, List, Calendar, Clock } from 'lucide-react';

type CompanyView = 'dashboard' | 'profile' | 'services' | 'schedule' | 'bookings';
type ClientView = 'list' | 'company';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [companyView, setCompanyView] = useState<CompanyView>('dashboard');
  const [clientView, setClientView] = useState<ClientView>('list');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [userRole, setUserRole] = useState<'company' | 'client'>('client');
  const [companyId, setCompanyId] = useState<string>('');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={(role, compId) => {
      setUserRole(role);
      if (compId) setCompanyId(compId);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">BookingPlatform</h1>
              <div className="hidden md:flex items-center gap-4">
                {userRole === 'client' && (
                  <button
                    onClick={() => {
                      setClientView('list');
                      setSelectedCompanyId('');
                    }}
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Browse Companies
                  </button>
                )}
                {userRole === 'company' && (
                  <>
                    <button
                      onClick={() => setCompanyView('dashboard')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        companyView === 'dashboard'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Building2 size={18} />
                      Dashboard
                    </button>
                    <button
                      onClick={() => setCompanyView('profile')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        companyView === 'profile'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Building2 size={18} />
                      Profile
                    </button>
                    <button
                      onClick={() => setCompanyView('services')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        companyView === 'services'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <List size={18} />
                      Services
                    </button>
                    <button
                      onClick={() => setCompanyView('schedule')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        companyView === 'schedule'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Clock size={18} />
                      Schedule
                    </button>
                    <button
                      onClick={() => setCompanyView('bookings')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        companyView === 'bookings'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Calendar size={18} />
                      Bookings
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.email}</p>
                <p className="text-gray-600 capitalize">{userRole}</p>
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
        {userRole === 'company' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {companyView === 'dashboard' && (
              <CompanyDashboard
                onCompanyCreated={(id) => setCompanyId(id)}
              />
            )}
            {companyView === 'profile' && (
              <CompanyProfileForm
                companyId={companyId || undefined}
                onSuccess={() => {
                  setCompanyView('dashboard');
                  if (!companyId) {
                    setTimeout(() => window.location.reload(), 500);
                  }
                }}
              />
            )}
            {companyView === 'services' && companyId && (
              <ServicesManagement companyId={companyId} />
            )}
            {companyView === 'schedule' && companyId && (
              <ScheduleManagement companyId={companyId} />
            )}
            {companyView === 'bookings' && companyId && (
              <BookingsManagement companyId={companyId} />
            )}
          </div>
        )}

        {userRole === 'client' && (
          <>
            {clientView === 'list' && (
              <CompanyListPage
                onSelectCompany={(id) => {
                  setSelectedCompanyId(id);
                  setClientView('company');
                }}
              />
            )}
            {clientView === 'company' && selectedCompanyId && (
              <CompanyProfilePage companyId={selectedCompanyId} />
            )}
          </>
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
