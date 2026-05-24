import { useState } from 'react';
import GSTAlert from '../components/GSTAlert';
import { useAnalytics } from '../hooks/useAnalytics';
import api from '../lib/axios';

const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const TaxPage = () => {
  const { data, loading, error, refetch } = useAnalytics('/api/analytics/summary');
  const [advice, setAdvice] = useState('');
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState('');

  const getAdvice = async () => {
    setAdviceLoading(true);
    setAdviceError('');
    try {
      const response = await api.get('/api/ai/tax-advisory');
      setAdvice(response.data.data.advice);
      refetch();
    } catch (err) {
      setAdviceError(err.response?.data?.message || 'Could not load advice');
    } finally {
      setAdviceLoading(false);
    }
  };

  if (loading) return <p className="p-4">Loading tax summary...</p>;
  if (error) return <p className="p-4 text-red-700">{error}</p>;

  const tax = data.taxSnapshot;
  const flow = [
    ['Gross Income', tax.grossIncome],
    ['Minus 50% 44ADA deduction', tax.presumptiveDeduction],
    ['Minus deductible expenses', tax.expenseDeductions],
    ['Taxable Income', tax.taxableIncome],
    ['Tax Payable', tax.estimatedTaxLiability]
  ];

  return (
    <main className="page-shell">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-blue-700">Tax and compliance</p><h1 className="text-[30px] font-bold text-slate-900">Tax flow</h1></div><button onClick={refetch} className="btn-secondary">Refresh calculation</button></div>
      <GSTAlert show={tax.gstThresholdAlert} />
      <section className="grid gap-3 md:grid-cols-5">
        {flow.map(([label, value], index) => <div key={label} className="stat-card relative"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className={`mt-2 text-xl font-bold ${index === 4 ? 'text-blue-700' : 'text-slate-900'}`}>{rupees(value)}</p>{index < flow.length - 1 && <span className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-blue-600 text-center text-sm font-bold leading-6 text-white md:block">→</span>}</div>)}
      </section>
      <section className="app-card border-blue-100 bg-gradient-to-br from-white to-blue-50">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-semibold">Local advisory card</h2><p className="text-sm text-slate-500">No external API key required. Uses your ledger numbers to explain 44ADA, ITR, expenses, and GST.</p></div><button onClick={getAdvice} disabled={adviceLoading} className="btn-primary">{adviceLoading ? <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : 'Get advice'}</button></div>
      </section>
      {adviceError && <p className="rounded-md bg-red-50 p-3 text-red-700">{adviceError}</p>}
      {advice && <section className="app-card leading-7 text-blue-950">{advice}</section>}
    </main>
  );
};

export default TaxPage;
