import { useState } from 'react';
import api from '../lib/axios';
import IncomeForm from './IncomeForm';

const confidenceClass = (confidence) => {
  if (confidence > 0.8) return 'bg-green-100 text-green-700';
  if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const confidenceLabel = (confidence) => {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
};

const SMSParser = ({ onSaved }) => {
  const [smsText, setSmsText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const parse = async () => {
    setLoading(true);
    setError('');
    setParsed(null);
    try {
      const { data } = await api.post('/api/income/parse-sms', { smsText });
      if (data.data.error) {
        setError(data.data.error);
        return;
      }
      setParsed(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not parse SMS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="app-card">
      <div className="mb-3 flex items-center justify-between">
        <div><h2 className="text-xl font-semibold text-slate-900">SMS parser</h2><p className="text-sm text-slate-500">Paste a payout message to extract amount, date, and platform.</p></div>
        {parsed && <span className={`pill ${confidenceClass(parsed.confidence)}`}>{confidenceLabel(parsed.confidence)} confidence</span>}
      </div>
      <textarea
        value={smsText}
        onChange={(e) => setSmsText(e.target.value)}
        placeholder="Paste your payout SMS here"
        className="h-28 w-full rounded-[10px] border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
      {error && <p className="mt-2 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      {parsed && (
        <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
          <p className="font-semibold">Parsed payout</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <span>Platform: {parsed.platform}</span>
            <span>Amount: ₹{Number(parsed.amount).toLocaleString('en-IN')}</span>
            <span>Date: {parsed.date}</span>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-secondary mt-3 py-2">Use this data</button>
        </div>
      )}
      <button onClick={parse} disabled={loading || !smsText.trim()} className="btn-primary mt-3">
        {loading ? <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : 'Parse SMS'}
      </button>
      <IncomeForm open={showForm} onClose={() => setShowForm(false)} onSaved={onSaved} initialData={parsed ? { ...parsed, source: 'sms_parsed' } : null} />
    </section>
  );
};

export default SMSParser;
