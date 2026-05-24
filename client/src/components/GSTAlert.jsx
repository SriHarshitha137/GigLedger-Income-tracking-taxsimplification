import { AlertTriangle } from 'lucide-react';

const GSTAlert = ({ show }) => {
  if (!show) return null;

  return (
    <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
      <AlertTriangle className="mt-0.5 shrink-0" size={20} />
      <div>
        <p className="font-semibold">GST threshold crossed</p>
        <p className="text-sm">Your gross receipts are above Rs. 20,00,000. Please review GST registration with a tax professional.</p>
      </div>
    </div>
  );
};

export default GSTAlert;
