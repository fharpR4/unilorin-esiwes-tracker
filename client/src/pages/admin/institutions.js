import Head from 'next/head';
import { useState } from 'react';
import { Building2, Plus, Pencil, X, Check, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';

const EMPTY_FORM = { name: '', acronym: '', type: 'university', city: 'Ilorin', state: 'Kwara' };

export default function AdminInstitutionsPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useApi('/institutions');
  const institutions = data?.data?.institutions || [];
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (inst) => {
    setForm({
      name: inst.name,
      acronym: inst.acronym || '',
      type: inst.type || 'university',
      city: inst.address?.city || '',
      state: inst.address?.state || '',
    });
    setEditId(inst._id);
    setShowForm(true);
    setDeleteConfirmId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Institution name is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        acronym: form.acronym.trim().toUpperCase(),
        type: form.type,
        address: { city: form.city, state: form.state, country: 'Nigeria' },
      };
      if (editId) {
        await api.put(`/institutions/${editId}`, payload);
        toast.success('Institution updated successfully.');
      } else {
        await api.post('/institutions', payload);
        toast.success('Institution created successfully.');
      }
      mutate();
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save institution.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/institutions/${id}`);
      toast.success('Institution deleted.');
      mutate();
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete institution.');
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = "w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition";

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Institutions</title></Head>
      <AppLayout pageTitle="Institutions" allowedRoles={[ROLES.ADMIN]}>
        <div className="space-y-5 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {institutions.length} institution{institutions.length !== 1 ? 's' : ''} registered
            </p>
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
              Add Institution
            </button>
          </div>

          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white">
                  {editId ? 'Edit Institution' : 'New Institution'}
                </h3>
                <button onClick={() => { setShowForm(false); setEditId(null); }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Institution Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required placeholder="e.g. University of Ilorin" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Acronym</label>
                    <input type="text" value={form.acronym} onChange={(e) => setForm((p) => ({ ...p, acronym: e.target.value }))}
                      placeholder="e.g. UNILORIN" className={`${inputClass} uppercase`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
                    <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className={inputClass}>
                      <option value="university">University</option>
                      <option value="polytechnic">Polytechnic</option>
                      <option value="college_of_education">College of Education</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                    <input type="text" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Ilorin" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State</label>
                    <input type="text" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                      placeholder="e.g. Kwara" className={inputClass} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                    className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner />
          ) : institutions.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Building2 className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No institutions yet.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Add the University of Ilorin first so students and coordinators can register.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {institutions.map((inst) => (
                <div key={inst._id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl bg-unilorin-primary/10 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-unilorin-primary dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{inst.name}</p>
                      <p className="text-xs text-gray-400">
                        {inst.acronym && `${inst.acronym} · `}
                        {inst.address?.city}, {inst.address?.state}
                        {' · '}<span className="capitalize">{inst.type?.replace('_', ' ')}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(inst)}
                        className="p-2 text-gray-400 hover:text-unilorin-primary dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteConfirmId(deleteConfirmId === inst._id ? null : inst._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {deleteConfirmId === inst._id && (
                    <div className="px-4 pb-4 border-t border-red-100 dark:border-red-900/30 pt-3 bg-red-50 dark:bg-red-900/10">
                      <div className="flex items-start gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 dark:text-red-400">
                          Permanently delete <strong>{inst.name}</strong>? This cannot be undone. Students and coordinators linked to this institution will lose their institution reference.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(inst._id)} disabled={deleting}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          {deleting ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                        <button onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}