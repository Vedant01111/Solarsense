import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getReadings } from '../api.js';

export default function LiveChart() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(2);

  useEffect(() => { getReadings(days).then(setData).catch(() => setData(null)); }, [days]);
  if (!data) return <p className="muted">Loading readings…</p>;

  const points = data.hourly.map((r) => ({ label: `${r.ts.slice(5, 10)} ${r.hour}h`, Expected: r.expectedKw, Actual: r.actualKw }));
  return (
    <div>
      <div className="row">
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={1}>Last 24 hours</option><option value={2}>Last 2 days</option><option value={7}>Last 7 days</option>
        </select>
        <strong>{data.savings.kwh} kWh generated · saved ₹{data.savings.savingsInr.toLocaleString('en-IN')}</strong>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={points}>
          <XAxis dataKey="label" interval="preserveStartEnd" minTickGap={40} />
          <YAxis unit=" kW" width={60} />
          <Tooltip /><Legend />
          <Line dataKey="Expected" stroke="#9a8f7a" dot={false} strokeDasharray="4 3" />
          <Line dataKey="Actual" stroke="#d98a00" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
