import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, User, Mail, Phone, Check, X, Filter } from 'lucide-react';
import type { BookingStatus } from '../../lib/database.types';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  client_name: string;
  client_email: string;
  client_phone: string;
  notes: string;
  service: {
    name: string;
    price: number;
  };
}

interface BookingsManagementProps {
  companyId: string;
}

export function BookingsManagement({ companyId }: BookingsManagementProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');

  useEffect(() => {
    loadBookings();
  }, [companyId, filter]);

  async function loadBookings() {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          service:services (
            name,
            price
          )
        `)
        .eq('company_id', companyId)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(id: string, status: BookingStatus) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      loadBookings();
    } catch (error: any) {
      alert(error.message);
    }
  }

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
        <p className="text-gray-600 mt-1">Manage client appointments</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={18} className="text-gray-600" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({statusCounts.pending})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'confirmed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Confirmed ({statusCounts.confirmed})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({statusCounts.completed})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelled ({statusCounts.cancelled})
          </button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'No bookings yet'
              : `No ${filter} bookings`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onUpdateStatus={updateBookingStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
}

function BookingCard({ booking, onUpdateStatus }: BookingCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const bookingDate = new Date(booking.booking_date);
  const isPast = bookingDate < new Date(new Date().toDateString());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{booking.service.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status]}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={16} className="text-gray-400" />
              <span>
                {bookingDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={16} className="text-gray-400" />
              <span>{booking.start_time} - {booking.end_time}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <User size={16} className="text-gray-400" />
              <span>{booking.client_name}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Mail size={16} className="text-gray-400" />
              <a href={`mailto:${booking.client_email}`} className="hover:text-blue-600">
                {booking.client_email}
              </a>
            </div>

            {booking.client_phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone size={16} className="text-gray-400" />
                <a href={`tel:${booking.client_phone}`} className="hover:text-blue-600">
                  {booking.client_phone}
                </a>
              </div>
            )}
          </div>

          {booking.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Notes:</span> {booking.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check size={18} />
                Confirm
              </button>
              <button
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X size={18} />
                Decline
              </button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <>
              {isPast && (
                <button
                  onClick={() => onUpdateStatus(booking.id, 'completed')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Check size={18} />
                  Mark Completed
                </button>
              )}
              <button
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
