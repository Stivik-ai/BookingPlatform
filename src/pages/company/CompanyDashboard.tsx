import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, DollarSign, Users, Plus } from 'lucide-react';
import { CompanyProfileForm } from '../../components/company/CompanyProfileForm';

interface Company {
  id: string;
  name: string;
  is_active: boolean;
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  activeServices: number;
  monthlyRevenue: number;
}

interface CompanyDashboardProps {
  onCompanyCreated?: (companyId: string) => void;
}

export function CompanyDashboard({ onCompanyCreated }: CompanyDashboardProps) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    activeServices: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

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
        const { count: bookingsCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyData.id);

        const { count: pendingCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyData.id)
          .eq('status', 'pending');

        const { count: servicesCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyData.id)
          .eq('is_active', true);

        setStats({
          totalBookings: bookingsCount || 0,
          pendingBookings: pendingCount || 0,
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
    if (showCreateForm) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <CompanyProfileForm
              onSuccess={() => {
                setShowCreateForm(false);
                loadCompanyData();
                if (onCompanyCreated) {
                  supabase
                    .from('companies')
                    .select('id')
                    .eq('owner_id', user!.id)
                    .maybeSingle()
                    .then(({ data }) => {
                      if (data) onCompanyCreated(data.id);
                    });
                }
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Calendar className="mx-auto text-blue-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Company</h2>
          <p className="text-gray-600 mb-6">
            You need to set up your company profile before you can start managing bookings.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Create Company Profile
          </button>
        </div>
      </div>
    );
  }

  const isSubscriptionActive = company.is_active;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium mt-2 inline-block ${
                  isSubscriptionActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {isSubscriptionActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Bookings</h3>
              <Calendar className="text-blue-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <Users className="text-yellow-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingBookings}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Services</h3>
              <Plus className="text-green-600" size={20} />
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

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h2>
          <p className="text-gray-600 mb-4">
            Use the navigation menu above to manage your company profile, services, schedule, and bookings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1">Manage Services</h3>
              <p className="text-sm text-blue-700">Add and edit your service offerings</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1">Set Schedule</h3>
              <p className="text-sm text-blue-700">Define your working hours</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1">Handle Bookings</h3>
              <p className="text-sm text-blue-700">Manage client appointments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
