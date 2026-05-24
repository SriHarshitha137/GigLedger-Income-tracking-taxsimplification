import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const MonthlyTrendChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    month: item.month || item.monthName,
    amount: item.amount ?? item.total ?? 0
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tickFormatter={rupees} tick={{ fill: '#64748b', fontSize: 12 }} width={86} />
          <Tooltip formatter={(value) => [rupees(value), 'Income']} />
          <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;
