import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.phone.trim() || !form.password) nextErrors.form = 'All fields are required';
    if (!form.phone.trim()) nextErrors.phone = 'Phone is required';
    if (!form.password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    setErrors({});
    try {
      const { data } = await api.post('/api/auth/login', form);
      login(data.token, data.user);
      navigate(data.user.onboardingDone ? '/dashboard' : '/onboarding');
    } catch (err) {
      const next = {};
      (err.response?.data?.errors || []).forEach((item) => {
        next[item.path] = item.msg;
      });
      next.form = err.response?.data?.message || next.form || 'Login failed';
      setErrors(next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="gig-hero">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50">GigLedger</div>
          <h1 className="mt-8 text-[32px] font-bold leading-tight">Daily rides, deliveries, payouts, and loan-readiness in one clean ledger.</h1>
          <p className="mt-4 text-sm leading-6 text-blue-50/85">Track monthly performance for gig workers across Swiggy, Zomato, Ola, Uber, Rapido, Dunzo, and local UPI payouts.</p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {['44ADA tax', 'Loan score', 'PDF proof'].map((item) => <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-center text-xs font-semibold">{item}</span>)}
          </div>
        </div>
        <div className="rider-scene" />
        <div className="absolute bottom-10 right-10 z-10 rounded-2xl bg-white p-4 text-slate-900 shadow-2xl">
          <p className="text-xs text-slate-500">This month</p>
          <p className="text-2xl font-bold">₹42,850</p>
          <p className="text-xs font-semibold text-green-600">Loan profile improving</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-4 md:p-10">
        <form onSubmit={submit} noValidate className="app-card w-full max-w-md">
          <div className="mb-6">
            <p className="text-sm font-semibold text-blue-700">Welcome back</p>
            <h1 className="mt-1 text-[30px] font-bold text-slate-900">Login to GigLedger</h1>
            
          </div>
          {errors.form && <p className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>}
          <label className="block text-sm font-semibold text-slate-700">
            Phone number
            <div className="mt-2 flex overflow-hidden rounded-[10px] border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <span className="flex h-12 items-center border-r border-slate-200 px-3 text-sm font-semibold text-slate-500">+91</span>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="h-12 flex-1 px-3 text-sm outline-none" />
            </div>
            {errors.phone && <span className="mt-1 block text-xs text-red-600">{errors.phone}</span>}
          </label>
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Password
            <div className="mt-2 flex items-center rounded-[10px] border border-slate-200 bg-white pr-2 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-12 flex-1 px-3 text-sm outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            {errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password}</span>}
          </label>
          <div className="mt-3 text-right"><button type="button" className="text-sm font-semibold text-blue-700">Forgot password?</button></div>
          <button disabled={saving} className="btn-primary mt-5 w-full">{saving ? <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : 'Sign in'}</button>
          <div className="my-5 h-px bg-slate-200" />
          <p className="text-center text-sm text-slate-600">New here? <Link className="font-semibold text-blue-700" to="/register">Create account</Link></p>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck size={15} /> Passwords are stored as secure hashes.</p>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
