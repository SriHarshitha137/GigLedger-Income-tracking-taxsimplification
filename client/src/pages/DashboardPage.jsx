import { useState } from 'react';
import GSTAlert from '../components/GSTAlert';
import IncomeForm from '../components/IncomeForm';
import MonthlyTrendChart from '../charts/MonthlyTrendChart';
import PlatformComparisonChart from '../charts/PlatformComparisonChart';
import { useAnalytics } from '../hooks/useAnalytics';
import { useIncome } from '../hooks/useIncome';
import api from '../lib/axios';

const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const dateText = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const loanStatus = (monthlyIncome, netAfterExpenses) => {
  if (monthlyIncome >= 35000 && netAfterExpenses > 25000) return { label: 'Strong loan profile', tone: 'text-green-700 bg-green-50 border-green-100', note: 'Stable monthly collections look healthy.' };
  if (monthlyIncome >= 18000) return { label: 'Building eligibility', tone: 'text-orange-700 bg-orange-50 border-orange-100', note: 'Keep adding entries for a stronger proof trail.' };
  return { label: 'Needs more history', tone: 'text-slate-700 bg-slate-50 border-slate-200', note: 'More consistent income records will help.' };
};

const DashboardPage = () => {
  const [open, setOpen] = useState(false);
  const [loanType, setLoanType] = useState('bike');
  const [loanResult, setLoanResult] = useState(null);
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanError, setLoanError] = useState('');
  const summary = useAnalytics('/api/analytics/summary');
  const trend = useAnalytics('/api/analytics/monthly-trend');
  const platform = useAnalytics('/api/analytics/platform-comparison');
  const income = useIncome({ limit: 5 });

  const refresh = () => {
    summary.refetch();
    trend.refetch();
    platform.refetch();
    income.refetch();
  };

  const checkLoan = async (type) => {
    setLoanType(type);
    setLoanLoading(true);
    setLoanError('');
    setLoanResult(null);
    try {
      const { data } = await api.get('/api/analytics/loan-eligibility', { params: { type } });
      setLoanResult(data.data);
    } catch (err) {
      setLoanError(err.response?.data?.message || 'Could not calculate loan eligibility');
    } finally {
      setLoanLoading(false);
    }
  };

  if (summary.loading) return <p className="p-4 text-slate-600">Loading dashboard...</p>;
  if (summary.error) return <p className="p-4 text-red-700">{summary.error}</p>;

  const loan = loanStatus(summary.data.thisMonth, summary.data.netAfterExpenses);
  const stats = [
    ['Total this month', summary.data.thisMonth, 'border-l-blue-600'],
    ['Total this year', summary.data.thisYear, 'border-l-orange-500'],
    ['Net after expenses', summary.data.netAfterExpenses, 'border-l-green-600'],
    ['Estimated tax', summary.data.estimatedTax, 'border-l-slate-900']
  ];

  return (
    <main className="page-shell">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><p className="text-sm font-semibold text-blue-700">Good to see you</p><h1 className="text-[30px] font-bold text-slate-900">Performance dashboard</h1><p className="text-sm text-slate-500">Monthly collections, platform mix, tax estimate, and loan-readiness signals.</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary">Quick add income</button>
      </div>
      <GSTAlert show={summary.data.gstThresholdAlert} />
      <section className="app-card overflow-hidden bg-slate-950 text-white">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm text-blue-100">Loan eligibility snapshot</p>
            <h2 className="mt-2 text-2xl font-bold">{loan.label}</h2>
            <p className="mt-2 text-sm text-slate-300">{loan.note} Banks and NBFCs usually look for consistent monthly collections, low expense pressure, and proof documents.</p>
          </div>
          <div className={`rounded-2xl border p-4 ${loan.tone}`}>
            <p className="text-sm font-semibold">Monthly collection</p>
            <p className="mt-1 text-3xl font-bold">{rupees(summary.data.thisMonth)}</p>
            <p className="mt-2 text-xs">Use Certificate page to generate income proof.</p>
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, border]) => <div key={label} className={`stat-card border-l-4 ${border}`}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{rupees(value)}</p></div>)}
      </section>
      <section className="app-card">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Loan eligibility</h2>
            <p className="text-sm text-slate-500">Calculated from your real income entries from the last 6 months.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['bike', 'car', 'home', 'education'].map((type) => (
              <button key={type} onClick={() => checkLoan(type)} className={`pill border px-4 py-2 capitalize ${loanType === type ? 'border-green-600 bg-green-50 text-green-700' : 'border-slate-200 bg-white text-slate-700'}`}>
                {type}
              </button>
            ))}
          </div>
        </div>
        {!loanResult && !loanLoading && !loanError && <button onClick={() => checkLoan(loanType)} className="btn-primary mt-4">Check eligibility</button>}
        {loanLoading && <div className="skeleton mt-4 h-32" />}
        {loanError && <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{loanError}</p>}
        {loanResult && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className={`rounded-2xl border p-5 ${loanResult.eligible ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
              <p className="text-sm font-semibold">{loanResult.label}</p>
              <p className="mt-2 text-2xl font-bold">{loanResult.eligible ? 'Eligible' : 'Not eligible'}</p>
              <p className="mt-2 text-sm">{loanResult.reason}</p>
              {!loanResult.eligible && <p className="mt-2 text-sm font-semibold">Income gap: {rupees(loanResult.requiredIncomeGap)} per month</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Avg monthly income</p><p className="mt-1 text-xl font-bold">{rupees(loanResult.averageMonthlyIncome)}</p></div>
              <div className="rounded-2xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Max loan amount</p><p className="mt-1 text-xl font-bold">{rupees(loanResult.maxLoanAmount)}</p></div>
              <div className="rounded-2xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Interest rate</p><p className="mt-1 text-xl font-bold">{loanResult.interestRate.toFixed(2)}%</p></div>
              <div className="rounded-2xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Income entries</p><p className="mt-1 text-xl font-bold">{loanResult.entryCount}</p></div>
              <div className="sm:col-span-2 rounded-2xl border border-slate-200 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-700">Tenure options</p>
                <div className="grid gap-2 sm:grid-cols-4">{loanResult.tenureOptions.map((option) => <div key={option.months} className="rounded-xl bg-slate-50 p-3 text-sm"><p className="font-semibold">{option.months} months</p><p>{rupees(option.emi)} EMI</p></div>)}</div>
              </div>
            </div>
          </div>
        )}
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="app-card"><h2 className="mb-3 text-xl font-semibold text-slate-900">Monthly collections</h2>{trend.loading ? <div className="skeleton h-72" /> : <MonthlyTrendChart data={(trend.data || []).slice(-6)} />}</div>
        <div className="app-card"><h2 className="mb-3 text-xl font-semibold text-slate-900">Gig app performance</h2>{platform.loading ? <div className="skeleton h-72" /> : <PlatformComparisonChart data={platform.data || []} />}</div>
      </section>
      <section className="app-card">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Recent entries</h2>
        {income.loading ? <p>Loading...</p> : (
          <div className="overflow-x-auto"><table className="fin-table"><thead><tr><th>Date</th><th>Platform</th><th>Amount</th></tr></thead><tbody>{income.entries.map((entry) => <tr key={entry._id}><td>{dateText(entry.date)}</td><td>{entry.platform}</td><td className="font-semibold">{rupees(entry.amount)}</td></tr>)}</tbody></table></div>
        )}
      </section>
      <IncomeForm open={open} onClose={() => setOpen(false)} onSaved={refresh} />
    </main>
  );
};

export default DashboardPage;
