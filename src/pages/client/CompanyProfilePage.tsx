import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Phone, Mail, Clock, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from './navigation';

interface Company {
  id: string;
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string;
  address: string;
  city: string;
  category: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

interface Schedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface CompanyProfilePageProps {
  companyId: string;
}

export function CompanyProfilePage({ companyId }: CompanyProfilePageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  async function loadCompanyData() {
    try {
      const [companyRes, servicesRes, schedulesRes] = await Promise.all([
        supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .eq('is_active', true)
          .maybeSingle(),
        supabase
          .from('services')
          .select('*')
          .eq('company_id', companyId)
          .eq('is_active', true)
          .order('price'),
        supabase
          .from('schedules')
          .select('*')
          .eq('company_id', companyId)
          .eq('is_active', true)
          .order('day_of_week')
      ]);

      if (companyRes.error) throw companyRes.error;
      if (servicesRes.error) throw servicesRes.error;
      if (schedulesRes.error) throw schedulesRes.error;

      setCompany(companyRes.data);
      setServices(servicesRes.data || []);
      setSchedules(schedulesRes.data || []);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company not found</h2>
          <button
            onClick={() => navigate('/companies')}
            className="text-blue-600 hover:underline"
          >
            Back to companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/companies')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to search
          </button>

          <div className="flex items-start gap-6">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-24 h-24 rounded-xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center">
                <Calendar className="text-blue-600" size={32} />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {company.category}
                </span>
              </div>

              {company.description && (
                <p className="text-gray-600 mb-4">{company.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {company.city && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    {company.address && `${company.address}, `}{company.city}
                  </div>
                )}
                {company.contact_phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={16} />
                    <a href={`tel:${company.contact_phone}`} className="hover:text-blue-600">
                      {company.contact_phone}
                    </a>
                  </div>
                )}
                {company.contact_email && (
                  <div className="flex items-center gap-1">
                    <Mail size={16} />
                    <a href={`mailto:${company.contact_email}`} className="hover:text-blue-600">
                      {company.contact_email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>
              {services.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-600">No services available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-gray-700">
                          <DollarSign size={16} />
                          <span className="font-semibold">PLN {service.price}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-700">
                          <Clock size={16} />
                          <span>{service.duration_minutes} min</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setShowBookingForm(true);
                        }}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Opening Hours</h3>
              {schedules.length === 0 ? (
                <p className="text-gray-600 text-sm">No schedule available</p>
              ) : (
                <div className="space-y-2">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
                    (day, index) => {
                      const schedule = schedules.find((s) => s.day_of_week === index);
                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{day}</span>
                          {schedule ? (
                            <span className="text-gray-600">
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                          ) : (
                            <span className="text-gray-400">Closed</span>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBookingForm && selectedService && (
        <BookingModal
          company={company}
          service={selectedService}
          schedules={schedules}
          onClose={() => {
            setShowBookingForm(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}

interface BookingModalProps {
  company: Company;
  service: Service;
  schedules: Schedule[];
  onClose: () => void;
}

function BookingModal({ company, service, schedules, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    client_name: '',
    client_email: user?.email || '',
    client_phone: '',
    notes: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const endTime = calculateEndTime(formData.time, service.duration_minutes);

      const { error } = await supabase
        .from('bookings')
        .insert({
          company_id: company.id,
          service_id: service.id,
          client_user_id: user?.id || null,
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_phone: formData.client_phone,
          booking_date: formData.date,
          start_time: formData.time,
          end_time: endTime,
          notes: formData.notes,
          status: 'pending'
        });

      if (error) throw error;

      alert('Booking request sent successfully! You will receive a confirmation soon.');
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Book {service.name}</h2>
          <p className="text-gray-600 mt-1">
            {service.duration_minutes} minutes • PLN {service.price}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.client_phone}
                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Any special requests or notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
