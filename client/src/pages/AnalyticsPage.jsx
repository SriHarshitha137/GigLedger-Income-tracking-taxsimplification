import EarningHeatmap from '../charts/EarningHeatmap';
import MonthlyTrendChart from '../charts/MonthlyTrendChart';
import PlatformComparisonChart from '../charts/PlatformComparisonChart';
import { useAnalytics } from '../hooks/useAnalytics';

const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const AnalyticsPage = () => {
  const trend = useAnalytics('/api/analytics/monthly-trend');
  const platform = useAnalytics('/api/analytics/platform-comparison');
  const heatmap = useAnalytics('/api/analytics/earning-heatmap');

  const bestDay = (heatmap.data || []).reduce((best, item) => (item.avgAmount > (best?.avgAmount || 0) ? item : best), null);
  const bestPlatform = (platform.data || [])[0];

  return (
    <main className="page-shell">
      <div><p className="text-sm font-semibold text-blue-700">Monthly wise performance</p><h1 className="text-[30px] font-bold text-slate-900">Analytics</h1></div>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="stat-card border-l-4 border-l-blue-600"><p className="text-sm text-slate-500">Best earning day</p><p className="mt-2 text-xl font-bold text-slate-900">{bestDay ? `${bestDay.dayName} · ${rupees(bestDay.avgAmount)}` : 'Loading...'}</p></div>
        <div className="stat-card border-l-4 border-l-orange-500"><p className="text-sm text-slate-500">Best earning platform</p><p className="mt-2 text-xl font-bold text-slate-900">{bestPlatform ? `${bestPlatform.platform} · ${rupees(bestPlatform.total)}` : 'Loading...'}</p></div>
      </section>
      <section className="app-card"><h2 className="mb-3 text-xl font-semibold">Monthly collections</h2>{trend.loading ? <div className="skeleton h-72" /> : trend.error ? <p className="text-red-700">{trend.error}</p> : <MonthlyTrendChart data={trend.data || []} />}</section>
      <section className="app-card"><h2 className="mb-3 text-xl font-semibold">Platform comparison</h2>{platform.loading ? <div className="skeleton h-72" /> : platform.error ? <p className="text-red-700">{platform.error}</p> : <PlatformComparisonChart data={platform.data || []} />}</section>
      <section className="app-card"><h2 className="mb-3 text-xl font-semibold">Earning heatmap</h2>{heatmap.loading ? <div className="skeleton h-24" /> : heatmap.error ? <p className="text-red-700">{heatmap.error}</p> : <EarningHeatmap data={heatmap.data || []} />}</section>
    </main>
  );
};

export default AnalyticsPage;
