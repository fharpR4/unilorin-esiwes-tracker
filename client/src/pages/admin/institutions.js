import Head from 'next/head';
import { useState } from 'react';
import { Building2, Plus, Pencil, X, Check } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';

export default function AdminInstitutionsPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useApi('/institutions');
  const institutions = data?.institutions || [];
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', acronym: '', type: 'university' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/institutions/${editId}`, form);
        toast.success('Institution updated.');
      } else {
        await api.post('/institutions', form);
        toast.success('Institution created.');
      }
      mutate();
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', acronym: '', type: 'university' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save institution.');
    } finally { setSaving(false); }
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Institutions</title></Head>
      <AppLayout pageTitle="Institutions" allowedRoles={[ROLES.ADMIN]}>
        <div className="space-y-4 max-w-2xl">
          <div className="flex justify-end">
            <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', acronym: '', type: 'university' }); }}
              className="flex items-center gap-2 px-4 py-2 bg-unilorin-primary dark:bg-blue-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
              Add Institution
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
              <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200">{editId ? 'Edit Institution' : 'New Institution'}</h3>
              <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Institution name"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500" />
              <input value={form.acronym} onChange={(e) => setForm((p) => ({ ...p, acronym: e.target.value }))} placeholder="Acronym (e.g. UNILORIN)"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500" />
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-unilorin-primary dark:bg-blue-600 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                  <Check className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">
                  <X className="h-4 w-4" />Cancel
                </button>
              </div>
            </form>
          )}

          {isLoading ? <LoadingSpinner /> : (
            <div className="space-y-2">
              {institutions.map((inst) => (
                <div key={inst._id} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Building2 className="h-5 w-5 text-unilorin-primary dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{inst.name}</p>
                    <p className="text-xs text-gray-400">{inst.acronym} · {inst.address?.city}, {inst.address?.state}</p>
                  </div>
                  <button onClick={() => { setForm({ name: inst.name, acronym: inst.acronym || '', type: inst.type }); setEditId(inst._id); setShowForm(true); }}
                    className="p-2 text-gray-400 hover:text-unilorin-primary dark:hover:text-blue-400 transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}