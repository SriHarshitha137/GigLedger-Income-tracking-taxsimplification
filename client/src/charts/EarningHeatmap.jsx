const shades = [
  'bg-slate-100 text-slate-700',
  'bg-blue-100 text-blue-900',
  'bg-blue-200 text-blue-900',
  'bg-blue-300 text-blue-950',
  'bg-blue-400 text-white',
  'bg-blue-600 text-white'
];

const EarningHeatmap = ({ data = [] }) => {
  const max = Math.max(...data.map((item) => item.avgAmount || 0), 0);

  return (
    <div className="grid grid-cols-7 gap-2">
      {data.map((day) => {
        const ratio = max ? (day.avgAmount || 0) / max : 0;
        const index = day.avgAmount ? Math.min(Math.ceil(ratio * (shades.length - 1)), shades.length - 1) : 0;
        return (
          <div key={day.dayName} title={`${day.dayName}: ₹${Number(day.avgAmount || 0).toLocaleString('en-IN')}`} className={`rounded-md p-3 text-center ${shades[index]}`}>
            <p className="text-xs font-semibold">{day.dayName.slice(0, 3)}</p>
            <p className="mt-1 text-[11px]">₹{Number(day.avgAmount || 0).toLocaleString('en-IN')}</p>
          </div>
        );
      })}
    </div>
  );
};

export default EarningHeatmap;
