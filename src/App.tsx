import { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { CompanyListPage } from './pages/client/CompanyListPage';
import { CompanyProfilePage } from './pages/client/CompanyProfilePage';
import { CompanyProfileForm } from './components/company/CompanyProfileForm';
import { ServicesManagement } from './components/company/ServicesManagement';
import { ScheduleManagement } from './components/company/ScheduleManagement';
import { BookingsManagement } from './components/company/BookingsManagement';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { LogOut, Building2, List, Calendar, Clock } from 'lucide-react';
import { supabase } from './lib/supabase';

type CompanyView = 'dashboard' | 'profile' | 'services' | 'schedule' | 'bookings';
type ClientView = 'list' | 'company';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [companyView, setCompanyView] = useState<CompanyView>('dashboard');
  const [clientView, setClientView] = useState<ClientView>('list');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    if (type === 'recovery') {
      setIsResetPassword(true);
    }
  }, []);

  useEffect(() => {
    if (user && profile?.role === 'business_owner') {
      loadUserCompany();
    } else {
      setLoadingCompany(false);
    }
  }, [user, profile]);

  async function loadUserCompany() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCompanyId(data.id);
      }
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoadingCompany(false);
    }
  }

  if (isResetPassword) {
    return <ResetPasswordPage />;
  }

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  const userRole = profile.role;

  if (userRole === 'business_owner' && loadingCompany) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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
                {userRole === 'business_owner' && (
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
                    {companyId && (
                      <>
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
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{profile.full_name}</p>
                <p className="text-gray-600">
                  {userRole === 'business_owner' ? 'Business Owner' : 'Client'}
                </p>
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
        {userRole === 'business_owner' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {companyView === 'dashboard' && (
              <CompanyDashboard
                onCompanyCreated={(id) => {
                  setCompanyId(id);
                  setCompanyView('profile');
                }}
              />
            )}
            {companyView === 'profile' && (
              <CompanyProfileForm
                companyId={companyId || undefined}
                onSuccess={() => {
                  setCompanyView('dashboard');
                  if (!companyId) {
                    loadUserCompany();
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
