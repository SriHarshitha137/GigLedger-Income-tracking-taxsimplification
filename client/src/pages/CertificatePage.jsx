import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';
import api from '../lib/axios';

const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const CertificatePage = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('6months');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const summary = useAnalytics('/api/analytics/summary');
  const platform = useAnalytics('/api/analytics/platform-comparison');

  const months = Number(period.replace('months', ''));
  const total = summary.data?.thisYear || 0;
  const avgMonthly = total / Math.max(months, 1);

  const download = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await api.get('/api/pdf/certificate', { params: { period }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'income-certificate.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Could not download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const share = () => {
    const text = `GigLedger income certificate summary for ${user?.name}: period ${period}, income ${rupees(total)}, average monthly ${rupees(avgMonthly)}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="page-shell">
      <div><p className="text-sm font-semibold text-blue-700">Income proof</p><h1 className="text-[30px] font-bold text-slate-900">Certificate</h1></div>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="app-card">
          <div className="mb-5 flex flex-wrap gap-2">{['3months', '6months', '12months'].map((item) => <button key={item} onClick={() => setPeriod(item)} className={`pill border ${period === item ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}>{item.replace('months', ' months')}</button>)}</div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Document preview</h2>
            {summary.loading || platform.loading ? <div className="skeleton h-80" /> : (
              <div className="grid gap-4 md:grid-cols-2">
                <div><p className="text-sm text-slate-500">Worker name</p><p className="font-semibold text-slate-900">{user?.name}</p></div>
                <div><p className="text-sm text-slate-500">Period</p><p className="font-semibold text-slate-900">{period.replace('months', ' months')}</p></div>
                <div><p className="text-sm text-slate-500">Total income</p><p className="font-semibold text-slate-900">{rupees(total)}</p></div>
                <div><p className="text-sm text-slate-500">Avg monthly</p><p className="font-semibold text-slate-900">{rupees(avgMonthly)}</p></div>
                <div className="md:col-span-2"><p className="mb-2 text-sm text-slate-500">Platform breakdown</p><div className="space-y-2">{(platform.data || []).map((row) => <div key={row.platform} className="flex justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm"><span>{row.platform}</span><span>{rupees(row.total)} · {row.percentage.toFixed(1)}%</span></div>)}</div></div>
              </div>
            )}
          </div>
        </section>
        <aside className="app-card h-fit">
          <h2 className="text-xl font-semibold">Actions</h2>
          <p className="mt-2 text-sm text-slate-500">Use this certificate as a self-reported support document for rent, loan, or income discussions.</p>
          {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
          <div className="mt-5 grid gap-3"><button onClick={download} disabled={downloading} className="btn-primary">{downloading ? 'Downloading...' : 'Download PDF Certificate'}</button><button onClick={share} className="btn-secondary">Share via WhatsApp</button></div>
        </aside>
      </div>
    </main>
  );
};

export default CertificatePage;
