import { useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  BookOpen, MapPin, Camera, CheckCircle, AlertTriangle,
  Loader2, Plus, X, Send,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import CameraCapture from '@/components/camera/CameraCapture';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import useGeolocation from '@/hooks/useGeolocation';
import useApi from '@/hooks/useApi';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';

// MOVED OUTSIDE — prevents re-creation on every render
const Step = ({ number, title, done, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
        {done ? <CheckCircle className="h-4 w-4" /> : number}
      </div>
      <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
    </div>
    {children}
  </div>
);

export default function NewLogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { location, error: geoError, loading: geoLoading, getPosition } = useGeolocation();
  const { data: appsData } = useApi('/applications/mine');
  const approvedApp = appsData?.applications?.find((a) => a.status === 'approved');

  const [form, setForm] = useState({ title: '', description: '', challenges: '', dayNumber: '' });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [portraitImage, setPortraitImage] = useState(null);
  const [environmentImage, setEnvironmentImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = location && portraitImage && environmentImage &&
    form.title && form.description.length >= 50 && form.dayNumber && approvedApp;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
      setSkills((p) => [...p, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setSkills((p) => p.filter((s) => s !== skill));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await api.post('/logs', {
        applicationId: approvedApp._id,
        dateOfActivity: new Date().toISOString(),
        dayNumber: parseInt(form.dayNumber),
        title: form.title,
        description: form.description,
        skillsLearned: skills,
        challenges: form.challenges,
        portraitImage,
        environmentImage,
        geolocation: location,
      });
      toast.success('Log submitted successfully. Awaiting supervisor approval.');
      router.push('/logs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit log. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — New Log Entry</title></Head>
      <AppLayout pageTitle="New Log Entry" allowedRoles={[ROLES.STUDENT]}>
        {!approvedApp ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-heading font-semibold text-gray-800 dark:text-gray-200 mb-2">
              No active SIWES application
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              You must have an approved SIWES application before you can submit daily logs.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
            {/* Step 1: Location */}
            <Step number="1" title="Capture Your Location" done={!!location}>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Your GPS coordinates are required to verify your attendance at your training location.
              </p>
              {geoError && (
                <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{geoError}</p>
                </div>
              )}
              {location ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    Location captured (±{Math.round(location.accuracy)}m accuracy)
                  </span>
                </div>
              ) : (
                <button type="button" onClick={getPosition} disabled={geoLoading}
                  className="flex items-center gap-2 w-full justify-center py-3 px-4 bg-unilorin-primary dark:bg-blue-600 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  {geoLoading ? 'Getting location...' : 'Capture My Location'}
                </button>
              )}
            </Step>

            {/* Step 2: Portrait */}
            <Step number="2" title="Portrait Headshot" done={!!portraitImage}>
              <CameraCapture requiredType="portrait" onCapture={setPortraitImage} confirmed={!!portraitImage} />
            </Step>

            {/* Step 3: Environment */}
            <Step number="3" title="Training Environment Photo" done={!!environmentImage}>
              <CameraCapture requiredType="environment" onCapture={setEnvironmentImage} confirmed={!!environmentImage} />
            </Step>

            {/* Step 4: Log Details */}
            <Step number="4" title="Log Details" done={!!(form.title && form.description.length >= 50 && form.dayNumber)}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Day Number <span className="text-red-500">*</span></label>
                    <input type="number" name="dayNumber" value={form.dayNumber} onChange={handleChange} min="1" max="365" required placeholder="e.g. 23"
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Log Title <span className="text-red-500">*</span></label>
                    <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="What did you work on?"
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Description <span className="text-red-500">*</span>
                    <span className={`ml-2 text-xs font-normal ${form.description.length >= 50 ? 'text-green-500' : 'text-gray-400'}`}>
                      {form.description.length}/50 min
                    </span>
                  </label>
                  <textarea name="description" value={form.description} onChange={handleChange} required rows={5} placeholder="Describe your activities today in detail (minimum 50 characters)..."
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Skills Learned</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      placeholder="Type a skill and press Enter"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
                    <button type="button" onClick={addSkill}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="flex items-center gap-1 px-3 py-1 bg-unilorin-accent dark:bg-blue-900/30 text-unilorin-primary dark:text-blue-400 rounded-full text-xs font-medium">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:opacity-70 transition-opacity"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Challenges Faced</label>
                  <textarea name="challenges" value={form.challenges} onChange={handleChange} rows={2} placeholder="Any difficulties or challenges you encountered today..."
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition resize-none" />
                </div>
              </div>
            </Step>

            {/* Checklist */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Submission Checklist</p>
              <div className="space-y-2">
                {[
                  { done: !!location, label: 'GPS location captured' },
                  { done: !!portraitImage, label: 'Portrait headshot captured' },
                  { done: !!environmentImage, label: 'Environment photo captured' },
                  { done: !!form.dayNumber, label: 'Day number entered' },
                  { done: !!form.title, label: 'Log title entered' },
                  { done: form.description.length >= 50, label: `Description (${form.description.length}/50 chars min)` },
                ].map(({ done, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    {done ? <CheckCircle className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />}
                    <span className={`text-xs ${done ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={!canSubmit || submitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity text-sm">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {submitting ? 'Submitting Log...' : 'Submit Daily Log'}
            </button>
          </form>
        )}
      </AppLayout>
    </>
  );
}