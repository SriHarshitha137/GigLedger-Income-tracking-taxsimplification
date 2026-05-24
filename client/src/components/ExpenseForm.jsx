import { useEffect, useState } from 'react';
import api from '../lib/axios';

const categories = [
  ['fuel', 'Fuel'],
  ['vehicle_emi', 'Vehicle EMI'],
  ['phone_recharge', 'Phone recharge'],
  ['vehicle_repair', 'Vehicle repair'],
  ['food_while_working', 'Food while working'],
  ['insurance', 'Insurance'],
  ['other', 'Other']
];

const today = () => new Date().toISOString().slice(0, 10);

const ExpenseForm = ({ open, onClose, onSaved, initialData }) => {
  const [form, setForm] = useState({ category: 'fuel', amount: '', date: today(), description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialData) setForm({ ...initialData, date: initialData.date ? String(initialData.date).slice(0, 10) : today() });
    else setForm({ category: 'fuel', amount: '', date: today(), description: '' });
  }, [initialData, open]);

  if (!open) return null;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (form._id) await api.put(`/api/expenses/${form._id}`, payload);
      else await api.post('/api/expenses', payload);
      onSaved();
      onClose();
      setForm({ category: 'fuel', amount: '', date: today(), description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
      <form onSubmit={submit} className="w-full rounded-t-[24px] bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-[24px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{form._id ? 'Edit expense' : 'Add expense'}</h2>
          <button type="button" onClick={onClose} className="btn-secondary py-2">Close</button>
        </div>
        {error && <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Category
            <select value={form.category} onChange={(e) => update('category', e.target.value)} className="field mt-1 w-full">
              {categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Date
            <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="field mt-1 w-full" required />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Amount
            <input type="number" min="1" value={form.amount} onChange={(e) => update('amount', e.target.value)} className="field mt-1 w-full" required />
          </label>
        </div>
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Description
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="mt-1 w-full rounded-[10px] border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" rows="3" />
        </label>
        <button disabled={saving} className="btn-primary mt-4 w-full">{saving ? <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : 'Save expense'}</button>
      </form>
    </div>
  );
};

export default ExpenseForm;
