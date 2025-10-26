import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, DollarSign, Users, Settings, Plus } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  is_active: boolean;
  subscription_expires_at: string | null;
}

interface Stats {
  totalReservations: number;
  pendingReservations: number;
  activeServices: number;
  monthlyRevenue: number;
}

export function CompanyDashboard() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    pendingReservations: 0,
    activeServices: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCompanyData();
    }
  }, [user]);

  async function loadCompanyData() {
    try {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user!.id)
        .maybeSingle();

      if (companyError) throw companyError;
      setCompany(companyData);

      if (companyData) {
        const { count: reservationsCount } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyData.id);

        const { count: pendingCount } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyData.id)
          .eq('status', 'pending');

        const { count: servicesCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyData.id)
          .eq('is_active', true);

        setStats({
          totalReservations: reservationsCount || 0,
          pendingReservations: pendingCount || 0,
          activeServices: servicesCount || 0,
          monthlyRevenue: 0,
        });
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Calendar className="mx-auto text-blue-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Company</h2>
          <p className="text-gray-600 mb-6">
            You need to set up your company profile before you can start managing bookings.
          </p>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Plus size={20} />
            Create Company Profile
          </button>
        </div>
      </div>
    );
  }

  const isSubscriptionActive = company.is_active;
  const subscriptionExpiry = company.subscription_expires_at
    ? new Date(company.subscription_expires_at)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isSubscriptionActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isSubscriptionActive ? 'Active' : 'Inactive'}
                </span>
                {subscriptionExpiry && (
                  <span className="text-sm text-gray-600">
                    Expires: {subscriptionExpiry.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Settings size={18} />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!isSubscriptionActive && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-yellow-800 font-semibold mb-1">Subscription Required</h3>
            <p className="text-yellow-700 text-sm mb-3">
              Your subscription is inactive. Renew to continue accepting bookings.
            </p>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
              Renew Subscription
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Bookings</h3>
              <Calendar className="text-blue-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalReservations}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <Users className="text-yellow-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingReservations}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Services</h3>
              <Settings className="text-green-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activeServices}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Monthly Revenue</h3>
              <DollarSign className="text-blue-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">PLN {stats.monthlyRevenue}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <Plus size={20} />
                <span className="font-medium">Add New Service</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <Calendar size={20} />
                <span className="font-medium">Manage Schedule</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <Users size={20} />
                <span className="font-medium">View Reservations</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-gray-600 text-center py-8">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
