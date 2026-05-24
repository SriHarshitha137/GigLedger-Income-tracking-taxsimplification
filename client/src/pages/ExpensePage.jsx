import { useState } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import { useExpenses } from '../hooks/useExpenses';
import api from '../lib/axios';

const categories = ['', 'fuel', 'vehicle_emi', 'phone_recharge', 'vehicle_repair', 'food_while_working', 'insurance', 'other'];
const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const dateText = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const label = (value) => value.replaceAll('_', ' ');

const ExpensePage = () => {
  const [filters, setFilters] = useState({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { expenses, loading, error, refetch } = useExpenses(filters);
  const deductibleTotal = expenses.filter((expense) => expense.isDeductible).reduce((sum, expense) => sum + expense.amount, 0);

  const remove = async (id) => {
    await api.delete(`/api/expenses/${id}`);
    refetch();
  };

  return (
    <main className="page-shell">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-green-700">Deduction tracker</p><h1 className="text-[30px] font-bold text-slate-900">Expenses</h1></div><button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary">Add expense</button></div>
      <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white shadow-[0_18px_50px_rgba(22,163,74,0.24)]"><p className="text-sm text-green-50">Tax-deductible expenses this year</p><p className="mt-2 text-3xl font-bold">{rupees(deductibleTotal)}</p><p className="mt-2 text-sm text-green-50">Fuel, EMI, repair, insurance, and phone recharge improve your net-income story.</p></div>
      <section className="app-card">
        <div className="mb-4 flex flex-wrap gap-2">{categories.map((c) => <button key={c} onClick={() => setFilters({ category: c || undefined })} className="pill border border-slate-200 bg-white text-slate-700 hover:bg-blue-50">{c ? label(c) : 'All categories'}</button>)}</div>
        {error && <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
        {loading ? <div className="skeleton h-60" /> : <div className="overflow-x-auto"><table className="fin-table"><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th><th>Deductible</th><th>Actions</th></tr></thead><tbody>{expenses.map((expense) => <tr key={expense._id}><td>{dateText(expense.date)}</td><td className="capitalize">{label(expense.category)}</td><td className="font-semibold">{rupees(expense.amount)}</td><td>{expense.description || '-'}</td><td><span className={`pill ${expense.isDeductible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{expense.isDeductible ? 'Tax deductible' : 'Not deductible'}</span></td><td className="space-x-3"><button onClick={() => { setEditing(expense); setOpen(true); }} className="font-semibold text-blue-700">Edit</button><button onClick={() => remove(expense._id)} className="font-semibold text-red-700">Delete</button></td></tr>)}</tbody></table></div>}
      </section>
      <ExpenseForm open={open} onClose={() => setOpen(false)} onSaved={refetch} initialData={editing} />
    </main>
  );
};

export default ExpensePage;
