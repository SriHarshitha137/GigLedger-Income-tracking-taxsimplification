import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d'];
const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const PlatformComparisonChart = ({ data = [] }) => {
  const sorted = [...data].sort((a, b) => b.total - a.total);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={sorted} layout="vertical" margin={{ top: 8, right: 18, left: 20, bottom: 8 }}>
          <XAxis type="number" tickFormatter={rupees} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis type="category" dataKey="platform" tick={{ fill: '#334155', fontSize: 12 }} width={96} />
          <Tooltip formatter={(value) => [rupees(value), 'Income']} />
          <Bar dataKey="total" radius={[0, 6, 6, 0]}>
            {sorted.map((entry, index) => <Cell key={entry.platform} fill={COLORS[index % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlatformComparisonChart;
