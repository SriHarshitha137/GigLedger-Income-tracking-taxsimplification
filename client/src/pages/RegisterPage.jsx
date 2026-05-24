import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

const RegisterPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim() || !form.phone.trim() || !form.password || !form.confirmPassword) {
      nextErrors.form = 'All fields are required';
    }
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    else if (form.name.trim().length < 6) nextErrors.name = 'Name must be at least 6 characters';
    if (!form.phone.trim()) nextErrors.phone = 'Phone is required';
    else if (!/^[0-9]{10}$/.test(form.phone.trim())) nextErrors.phone = 'Phone must be exactly 10 digits';
    if (!form.password) nextErrors.password = 'Password is required';
    else if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    else if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]`;']/.test(form.password)) nextErrors.password = 'Password must include at least one special character';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Confirm password is required';
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setErrors({});
    try {
      const { data } = await api.post('/api/auth/register', { name: form.name, phone: form.phone, password: form.password });
      login(data.token, data.user);
      navigate('/onboarding');
    } catch (err) {
      const nextErrors = {};
      (err.response?.data?.errors || []).forEach((item) => {
        nextErrors[item.path] = item.msg;
      });
      if (err.response?.data?.message) nextErrors.form = err.response.data.message;
      setErrors(Object.keys(nextErrors).length ? nextErrors : { form: 'Registration failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="gig-hero">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">GigLedger for Indian gig workers</div>
          <h1 className="mt-8 text-[32px] font-bold leading-tight">Build a cleaner income history for taxes, certificates, and loan conversations.</h1>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {['90 days sample', '7 platforms', 'PDF certificate'].map((item) => <div key={item} className="rounded-2xl bg-white/10 p-4"><p className="text-lg font-bold">{item.split(' ')[0]}</p><p className="text-xs text-blue-50/80">{item}</p></div>)}
          </div>
        </div>
        <div className="rider-scene" />
      </section>
      <section className="flex items-center justify-center p-4 md:p-10">
        <form onSubmit={submit} noValidate className="app-card w-full max-w-xl">
          <p className="text-sm font-semibold text-blue-700">Step 1 of 2</p>
          <h1 className="mt-1 text-[30px] font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Your dashboard will calculate monthly performance and loan-readiness signals.</p>
          <div className="mt-5 h-2 rounded-full bg-slate-100"><div className="h-2 w-1/2 rounded-full bg-blue-600" /></div>
          {errors.form && <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`field mt-2 w-full ${errors.name ? 'field-error' : ''}`} />{errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name}</span>}</label>
            <label className="text-sm font-semibold text-slate-700">Phone number<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className={`field mt-2 w-full ${errors.phone ? 'field-error' : ''}`} />{errors.phone && <span className="mt-1 block text-xs text-red-600">{errors.phone}</span>}</label>
            <label className="text-sm font-semibold text-slate-700">Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`field mt-2 w-full ${errors.password ? 'field-error' : ''}`} />{errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password}</span>}</label>
            <label className="text-sm font-semibold text-slate-700">Confirm password<input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={`field mt-2 w-full ${errors.confirmPassword ? 'field-error' : ''}`} />{errors.confirmPassword && <span className="mt-1 block text-xs text-red-600">{errors.confirmPassword}</span>}</label>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div><p className="text-xs font-semibold text-slate-500">Password strength</p><div className="mt-2 h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${form.password.length >= 8 ? 'w-full bg-green-600' : 'w-1/2 bg-orange-500'}`} /></div></div>
            <p className={`rounded-2xl px-3 py-2 text-xs font-semibold ${form.confirmPassword && form.password === form.confirmPassword ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{form.confirmPassword && form.password === form.confirmPassword ? 'Passwords match' : 'Match indicator waiting'}</p>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm text-slate-600"><input type="checkbox" className="h-4 w-4 rounded border-slate-300" required /> I agree to keep my income records accurate.</label>
          <button disabled={saving} className="btn-primary mt-5 w-full">{saving ? <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : 'Create account'}</button>
          <p className="mt-4 text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-blue-700" to="/login">Sign in</Link></p>
        </form>
      </section>
    </main>
  );
};

export default RegisterPage;
