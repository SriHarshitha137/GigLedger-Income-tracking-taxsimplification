import { useEffect, useState } from 'react';
import api from '../lib/axios';

const platforms = ['Ola', 'Uber', 'Swiggy', 'Zomato', 'Dunzo', 'Urban Company', 'Rapido', 'Other'];

const today = () => new Date().toISOString().slice(0, 10);

const IncomeForm = ({ open, onClose, onSaved, initialData }) => {
  const [form, setForm] = useState({ platform: 'Swiggy', date: today(), amount: '', hoursWorked: '', tips: '', source: 'manual', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm((current) => ({
        ...current,
        ...initialData,
        date: initialData.date ? String(initialData.date).slice(0, 10) : today()
      }));
    } else {
      setForm({ platform: 'Swiggy', date: today(), amount: '', hoursWorked: '', tips: '', source: 'manual', notes: '' });
    }
  }, [initialData, open]);

  if (!open) return null;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        hoursWorked: Number(form.hoursWorked || 0),
        tips: Number(form.tips || 0)
      };
      if (form._id) await api.put(`/api/income/${form._id}`, payload);
      else await api.post('/api/income', payload);
      onSaved();
      onClose();
      setForm({ platform: 'Swiggy', date: today(), amount: '', hoursWorked: '', tips: '', source: 'manual', notes: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save income');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
      <form onSubmit={submit} className="w-full rounded-t-[24px] bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-[24px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{form._id ? 'Edit income' : 'Add income'}</h2>
          <button type="button" onClick={onClose} className="btn-secondary py-2">Close</button>
        </div>
        {error && <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Platform
            <select value={form.platform} onChange={(e) => update('platform', e.target.value)} className="field mt-1 w-full">
              {platforms.map((platform) => <option key={platform}>{platform}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Date
            <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="field mt-1 w-full" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Amount
            <input type="number" min="1" value={form.amount} onChange={(e) => update('amount', e.target.value)} className="field mt-1 w-full" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Hours
            <input type="number" min="0" step="0.5" value={form.hoursWorked} onChange={(e) => update('hoursWorked', e.target.value)} className="field mt-1 w-full" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Tips
            <input type="number" min="0" value={form.tips} onChange={(e) => update('tips', e.target.value)} className="field mt-1 w-full" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Source
            <select value={form.source} onChange={(e) => update('source', e.target.value)} className="field mt-1 w-full">
              <option value="manual">Manual</option>
              <option value="sms_parsed">SMS parsed</option>
            </select>
          </label>
        </div>
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Notes
          <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="mt-1 w-full rounded-[10px] border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" rows="3" />
        </label>
        <button disabled={saving} className="btn-primary mt-4 w-full">{saving ? <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : 'Save income'}</button>
      </form>
    </div>
  );
};

export default IncomeForm;
