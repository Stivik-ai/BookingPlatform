import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, Plus, X, AlertCircle, Save } from 'lucide-react';

interface Schedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface ScheduleException {
  id: string;
  date: string;
  is_closed: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string;
}

interface ScheduleManagementProps {
  companyId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ScheduleManagement({ companyId }: ScheduleManagementProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExceptionForm, setShowExceptionForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [companyId]);

  async function loadData() {
    try {
      const [schedulesRes, exceptionsRes] = await Promise.all([
        supabase
          .from('schedules')
          .select('*')
          .eq('company_id', companyId)
          .order('day_of_week'),
        supabase
          .from('schedule_exceptions')
          .select('*')
          .eq('company_id', companyId)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date')
      ]);

      if (schedulesRes.error) throw schedulesRes.error;
      if (exceptionsRes.error) throw exceptionsRes.error;

      setSchedules(schedulesRes.data || []);
      setExceptions(exceptionsRes.data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleScheduleUpdate(dayOfWeek: number, startTime: string, endTime: string, isActive: boolean) {
    try {
      const existing = schedules.find(s => s.day_of_week === dayOfWeek);

      if (existing) {
        const { error } = await supabase
          .from('schedules')
          .update({ start_time: startTime, end_time: endTime, is_active: isActive })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('schedules')
          .insert({
            company_id: companyId,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            is_active: isActive
          });

        if (error) throw error;
      }

      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function handleDeleteException(id: string) {
    if (!confirm('Delete this exception?')) return;

    try {
      const { error } = await supabase
        .from('schedule_exceptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  }

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
        <h2 className="text-2xl font-bold text-gray-900">Schedule & Availability</h2>
        <p className="text-gray-600 mt-1">Set your working hours and manage exceptions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
        <div className="space-y-3">
          {DAYS.map((day, index) => (
            <DaySchedule
              key={index}
              day={day}
              dayOfWeek={index}
              schedule={schedules.find(s => s.day_of_week === index)}
              onUpdate={handleScheduleUpdate}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Exceptions</h3>
            <p className="text-sm text-gray-600">Special dates, holidays, or custom hours</p>
          </div>
          <button
            onClick={() => setShowExceptionForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Exception
          </button>
        </div>

        {showExceptionForm && (
          <ExceptionForm
            companyId={companyId}
            onSuccess={() => {
              setShowExceptionForm(false);
              loadData();
            }}
            onCancel={() => setShowExceptionForm(false)}
          />
        )}

        {exceptions.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No exceptions scheduled
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {exceptions.map((exception) => (
              <div
                key={exception.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-orange-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(exception.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {exception.is_closed ? (
                        <span className="text-red-600 font-medium">Closed</span>
                      ) : (
                        <span>
                          {exception.start_time} - {exception.end_time}
                        </span>
                      )}
                      {exception.reason && ` - ${exception.reason}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteException(exception.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DayScheduleProps {
  day: string;
  dayOfWeek: number;
  schedule?: Schedule;
  onUpdate: (dayOfWeek: number, startTime: string, endTime: string, isActive: boolean) => void;
}

function DaySchedule({ day, dayOfWeek, schedule, onUpdate }: DayScheduleProps) {
  const [isActive, setIsActive] = useState(schedule?.is_active ?? false);
  const [startTime, setStartTime] = useState(schedule?.start_time || '09:00');
  const [endTime, setEndTime] = useState(schedule?.end_time || '17:00');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const changed =
      isActive !== (schedule?.is_active ?? false) ||
      (isActive && (startTime !== (schedule?.start_time || '09:00') || endTime !== (schedule?.end_time || '17:00')));
    setHasChanges(changed);
  }, [isActive, startTime, endTime, schedule]);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(dayOfWeek, startTime, endTime, isActive);
    setSaving(false);
    setHasChanges(false);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="w-32">
        <span className="font-medium text-gray-900">{day}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600">Open</span>
      </div>
      {isActive && (
        <>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-600">to</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </>
      )}
      <div className="ml-auto">
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}

interface ExceptionFormProps {
  companyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function ExceptionForm({ companyId, onSuccess, onCancel }: ExceptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    is_closed: false,
    start_time: '09:00',
    end_time: '17:00',
    reason: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('schedule_exceptions')
        .insert({
          company_id: companyId,
          date: formData.date,
          is_closed: formData.is_closed,
          start_time: formData.is_closed ? null : formData.start_time,
          end_time: formData.is_closed ? null : formData.end_time,
          reason: formData.reason
        });

      if (error) throw error;
      onSuccess();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-gray-900 mb-3">Add Schedule Exception</h4>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_closed"
            checked={formData.is_closed}
            onChange={(e) => setFormData({ ...formData, is_closed: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="is_closed" className="text-sm font-medium text-gray-700">
            Closed all day
          </label>
        </div>

        {!formData.is_closed && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <input
            type="text"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Holiday, Special event, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Exception'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
