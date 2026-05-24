import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlatformSelector from '../components/PlatformSelector';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [platforms, setPlatforms] = useState([]);
  const [details, setDetails] = useState({ vehicleType: 'bike', city: '', workingSince: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!platforms.length) nextErrors.platforms = 'Select at least one platform';
    if (!details.vehicleType) nextErrors.vehicleType = 'Vehicle type is required';
    if (!details.city.trim()) nextErrors.city = 'City is required';
    if (!details.workingSince) nextErrors.workingSince = 'Working since date is required';
    if (Object.keys(nextErrors).length) setError('All fields are required');
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const complete = async () => {
    if (!validate()) return;
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      const payload = { ...details, platforms: platforms.map((name) => ({ name })) };
      const { data } = await api.patch('/api/auth/onboarding', payload);
      setUser(data.user);
      localStorage.setItem('gigledger_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      const nextErrors = {};
      (err.response?.data?.errors || []).forEach((item) => {
        nextErrors[item.path] = item.msg;
      });
      setFieldErrors(nextErrors);
      setError(err.response?.data?.message || 'Could not save onboarding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl page-shell">
      <div className="app-card">
        <div className="mb-6 flex items-center gap-4">
          {[1, 2].map((item) => <div key={item} className={`flex flex-1 items-center gap-3 rounded-2xl border p-3 ${step === item ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-500'}`}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-current text-sm font-bold text-white"><span className="text-white">{item}</span></span><span className="text-sm font-semibold">{item === 1 ? 'Platforms' : 'Work profile'}</span></div>)}
        </div>
        <p className="text-sm font-semibold text-blue-700">Step {step} of 2</p>
        <h1 className="mt-1 text-[30px] font-bold text-slate-900">Set up your work profile</h1>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {step === 1 ? (
          <div className="mt-6">
            <h2 className="font-semibold text-slate-900">Select platforms</h2>
            <div className="mt-3"><PlatformSelector value={platforms} onChange={setPlatforms} /></div>
            {fieldErrors.platforms && <p className="mt-2 text-xs text-red-600">{fieldErrors.platforms}</p>}
            <button onClick={() => setStep(2)} disabled={!platforms.length} className="btn-primary mt-6">Continue</button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Vehicle type<select value={details.vehicleType} onChange={(e) => setDetails({ ...details, vehicleType: e.target.value })} className={`field mt-2 w-full ${fieldErrors.vehicleType ? 'field-error' : ''}`}><option value="">Select vehicle</option><option value="bike">Bike</option><option value="car">Car</option><option value="bicycle">Bicycle</option><option value="none">None</option></select>{fieldErrors.vehicleType && <span className="mt-1 block text-xs text-red-600">{fieldErrors.vehicleType}</span>}</label>
            <label className="block text-sm font-semibold text-slate-700">City<input value={details.city} onChange={(e) => setDetails({ ...details, city: e.target.value })} className={`field mt-2 w-full ${fieldErrors.city ? 'field-error' : ''}`} />{fieldErrors.city && <span className="mt-1 block text-xs text-red-600">{fieldErrors.city}</span>}</label>
            <label className="block text-sm font-semibold text-slate-700">Working since<input type="date" value={details.workingSince} onChange={(e) => setDetails({ ...details, workingSince: e.target.value })} className={`field mt-2 w-full ${fieldErrors.workingSince ? 'field-error' : ''}`} />{fieldErrors.workingSince && <span className="mt-1 block text-xs text-red-600">{fieldErrors.workingSince}</span>}</label>
            <div className="flex gap-3"><button onClick={() => setStep(1)} className="btn-secondary">Back</button><button onClick={complete} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Finish setup'}</button></div>
          </div>
        )}
      </div>
    </main>
  );
};

export default OnboardingPage;
