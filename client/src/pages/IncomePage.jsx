import { useState } from 'react';
import IncomeForm from '../components/IncomeForm';
import SMSParser from '../components/SMSParser';
import { useIncome } from '../hooks/useIncome';
import api from '../lib/axios';

const platforms = ['', 'Ola', 'Uber', 'Swiggy', 'Zomato', 'Dunzo', 'Urban Company', 'Rapido', 'Other'];
const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const dateText = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const platformClass = (platform) => `pill platform-${platform.toLowerCase().split(' ')[0] || 'default'}`;

const IncomePage = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { entries, meta, loading, error, refetch } = useIncome(filters);

  const remove = async (id) => {
    await api.delete(`/api/income/${id}`);
    refetch();
  };

  const changeFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value || undefined, page: 1 }));

  return (
    <main className="page-shell">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-blue-700">Collections ledger</p><h1 className="text-[30px] font-bold text-slate-900">Income</h1></div><button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary">Add income</button></div>
      <section className="grid gap-3 md:grid-cols-3">
        <div className="stat-card border-l-4 border-l-blue-600"><p className="text-sm text-slate-500">Entries shown</p><p className="mt-2 text-2xl font-bold">{meta.total}</p></div>
        <div className="stat-card border-l-4 border-l-green-600"><p className="text-sm text-slate-500">Page amount</p><p className="mt-2 text-2xl font-bold">{rupees(entries.reduce((sum, entry) => sum + entry.amount, 0))}</p></div>
        <div className="stat-card border-l-4 border-l-orange-500"><p className="text-sm text-slate-500">Loan proof trail</p><p className="mt-2 text-2xl font-bold">{meta.total >= 30 ? 'Strong' : 'Building'}</p></div>
      </section>
      <section className="app-card grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <select onChange={(e) => changeFilter('platform', e.target.value)} className="field">{platforms.map((p) => <option key={p} value={p}>{p || 'All platforms'}</option>)}</select>
        <input type="date" onChange={(e) => changeFilter('startDate', e.target.value)} className="field" />
        <input type="date" onChange={(e) => changeFilter('endDate', e.target.value)} className="field" />
        <button onClick={() => setFilters({ page: 1, limit: 20 })} className="btn-secondary">Clear</button>
      </section>
      {error && <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
      <section className="app-card">
        {loading ? <div className="skeleton h-60" /> : <div className="overflow-x-auto"><table className="fin-table"><thead><tr><th>Date</th><th>Platform</th><th>Amount</th><th>Hours</th><th>Tips</th><th>Source</th><th>Actions</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry._id}><td>{dateText(entry.date)}</td><td><span className={platformClass(entry.platform)}>{entry.platform}</span></td><td className="font-semibold">{rupees(entry.amount)}</td><td>{entry.hoursWorked}</td><td>{rupees(entry.tips)}</td><td><span className="pill bg-slate-100 text-slate-600">{entry.source === 'sms_parsed' ? 'SMS' : 'Manual'}</span></td><td className="space-x-3"><button onClick={() => { setEditing(entry); setOpen(true); }} className="font-semibold text-blue-700">Edit</button><button onClick={() => remove(entry._id)} className="font-semibold text-red-700">Delete</button></td></tr>)}</tbody></table></div>}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600"><span>Page {meta.page} of {meta.pages}</span><div className="space-x-2"><button disabled={meta.page <= 1} onClick={() => setFilters({ ...filters, page: meta.page - 1 })} className="btn-secondary py-2 disabled:opacity-50">Prev</button><button disabled={meta.page >= meta.pages} onClick={() => setFilters({ ...filters, page: meta.page + 1 })} className="btn-secondary py-2 disabled:opacity-50">Next</button></div></div>
      </section>
      <SMSParser onSaved={refetch} />
      <IncomeForm open={open} onClose={() => setOpen(false)} onSaved={refetch} initialData={editing} />
    </main>
  );
};

export default IncomePage;
