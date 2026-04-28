import { useState } from 'react';
import Head from 'next/head';
import {
  CalendarCheck, LogIn, LogOut, Clock, MapPin, CheckCircle,
  AlertTriangle, Loader2, TrendingUp, Calendar,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import useGeolocation from '@/hooks/useGeolocation';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES, ATTENDANCE_STATUS_COLORS, ATTENDANCE_LABELS } from '@/lib/constants';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function AttendancePage() {
  const { toast } = useToast();
  const { location, error: geoError, loading: geoLoading, getPosition } = useGeolocation();
  const { data: todayData, mutate: mutateToday } = useApi('/attendance/today');
  const { data: historyData, isLoading: historyLoading } = useApi('/attendance?limit=30');
  const [actionLoading, setActionLoading] = useState('');

  const today = todayData?.attendance;
  const records = historyData?.data?.records || [];
  const stats = historyData?.data?.stats || {};

  const handleCheckIn = async () => {
    if (!location) { toast.error('Please capture your location first.'); return; }
    setActionLoading('checkin');
    try {
      await api.post('/attendance/checkin', { geolocation: location, dayNumber: records.length + 1 });
      toast.success('Checked in successfully! Have a productive day.');
      mutateToday();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed.');
    } finally { setActionLoading(''); }
  };

  const handleCheckOut = async () => {
    if (!location) { toast.error('Please capture your location first.'); return; }
    setActionLoading('checkout');
    try {
      await api.post('/attendance/checkout', { geolocation: location });
      toast.success('Checked out successfully. Great work today!');
      mutateToday();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed.');
    } finally { setActionLoading(''); }
  };

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Attendance</title></Head>
      <AppLayout pageTitle="Attendance" allowedRoles={[ROLES.STUDENT]}>
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Today Card */}
          <div className="bg-gradient-to-br from-unilorin-primary to-unilorin-dark dark:from-blue-900 dark:to-gray-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-unilorin-secondary" />
              <p className="text-sm text-white/70">{todayStr}</p>
            </div>
            <h2 className="text-2xl font-heading font-bold mb-4">Today&apos;s Attendance</h2>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-white/60 mb-1 flex items-center gap-1"><LogIn className="h-3 w-3" />Check-In</p>
                <p className="text-sm font-semibold">
                  {today?.checkIn?.time
                    ? new Date(today.checkIn.time).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
                    : 'Not yet'}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-white/60 mb-1 flex items-center gap-1"><LogOut className="h-3 w-3" />Check-Out</p>
                <p className="text-sm font-semibold">
                  {today?.checkOut?.time
                    ? new Date(today.checkOut.time).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
                    : 'Not yet'}
                </p>
              </div>
            </div>

            {today?.hoursWorked > 0 && (
              <div className="flex items-center gap-2 mb-4 bg-white/10 rounded-xl p-3">
                <Clock className="h-4 w-4 text-unilorin-secondary" />
                <span className="text-sm font-medium">{today.hoursWorked} hours worked today</span>
              </div>
            )}

            {/* Location capture */}
            {!location ? (
              <div className="space-y-2">
                {geoError && (
                  <div className="flex gap-2 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-300">{geoError}</p>
                  </div>
                )}
                <button onClick={getPosition} disabled={geoLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/15 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                  {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  {geoLoading ? 'Getting location...' : 'Capture Location First'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-3 p-2 bg-green-900/30 border border-green-500/30 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-xs text-green-300">Location captured (±{Math.round(location.accuracy)}m)</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {!today?.checkIn?.time && (
                <button onClick={handleCheckIn} disabled={!location || !!actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-unilorin-secondary hover:opacity-90 text-white rounded-xl font-semibold text-sm transition-opacity disabled:opacity-40">
                  {actionLoading === 'checkin' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                  Check In
                </button>
              )}
              {today?.checkIn?.time && !today?.checkOut?.time && (
                <button onClick={handleCheckOut} disabled={!location || !!actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40">
                  {actionLoading === 'checkout' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  Check Out
                </button>
              )}
              {today?.checkIn?.time && today?.checkOut?.time && (
                <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-900/30 border border-green-500/30 text-green-300 rounded-xl text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Attendance Complete
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: CalendarCheck, label: 'Total Days', value: stats.totalDays || 0, color: 'text-unilorin-primary dark:text-blue-400' },
              { icon: TrendingUp, label: 'Present Days', value: stats.presentDays || 0, color: 'text-green-500' },
              { icon: Clock, label: 'Total Hours', value: `${stats.totalHours || 0}h`, color: 'text-unilorin-secondary' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
                <p className="text-xl font-heading font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Attendance History */}
          <div>
            <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
              Attendance History
            </h3>
            <div className="space-y-2">
              {records.map((record) => (
                <div key={record._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatDate(record.date)}</p>
                    <div className="flex gap-2 mt-1 text-xs text-gray-400">
                      {record.checkIn?.time && <span>In: {new Date(record.checkIn.time).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</span>}
                      {record.checkOut?.time && <span>Out: {new Date(record.checkOut.time).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</span>}
                      {record.hoursWorked > 0 && <span>· {record.hoursWorked}h</span>}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ATTENDANCE_STATUS_COLORS[record.status]}`}>
                    {ATTENDANCE_LABELS[record.status]}
                  </span>
                </div>
              ))}
              {records.length === 0 && !historyLoading && (
                <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
                  No attendance records yet. Check in to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}