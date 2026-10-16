import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getReadings, startFault, clearFault } from '../api.js';

const label = (ts) => new Date(ts).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit' });

export default function LiveChart() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(2);
  const [error, setError] = useState('');

  // Refresh every 3 seconds, because the server adds a new simulated reading at that pace.
  useEffect(() => {
    const load = () => getReadings(days).then((d) => { setData(d); setError(''); }).catch((e) => setError(e.message));
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [days]);

  async function toggleFault() {
    await (data.fault ? clearFault() : startFault());
    setData(await getReadings(days));
  }

  if (error) return <p className="error">Could not load readings: {error}. Is the server running?</p>;
  if (!data) return <p className="muted">Loading readings…</p>;

  const points = data.hourly.map((r) => ({ label: label(r.ts), Expected: r.expectedKw, Actual: r.actualKw }));
  const { kw, sunHours, fromProposal } = data.system;
  return (
    <div>
      <p className="muted">
        {fromProposal
          ? `Simulating your proposed ${kw} kW system (${sunHours} sun hours/day).`
          : `Demo ${kw} kW system. Calculate a proposal to simulate your own system.`}
      </p>
      <div className="row">
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={1}>Last 24 hours</option><option value={2}>Last 2 days</option><option value={7}>Last 7 days</option>
        </select>
        <strong>{data.savings.kwh} kWh generated · saved ₹{data.savings.savingsInr.toLocaleString('en-IN')}</strong>
        <button onClick={toggleFault}>{data.fault ? 'Clear fault' : 'Simulate fault'}</button>
      </div>
      {data.fault && <p className="error">Simulated fault active: midday output is dropping.</p>}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={points}>
          <XAxis dataKey="label" interval="preserveStartEnd" minTickGap={40} />
          <YAxis unit=" kW" width={60} />
          <Tooltip /><Legend />
          <Line dataKey="Expected" stroke="#9a8f7a" dot={false} strokeDasharray="4 3" isAnimationActive={false} />
          <Line dataKey="Actual" stroke="#d98a00" dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="muted">Simulated data: one new hour of readings every 3 seconds.</p>
    </div>
  );
}
