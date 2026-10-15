import { useEffect, useState } from 'react';
import { getAlerts, advise } from '../api.js';

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [advice, setAdvice] = useState({});

  useEffect(() => { getAlerts().then(setAlerts).catch(() => {}); }, []);

  async function onAdvise(alert) {
    const { text } = await advise(alert);
    setAdvice((a) => ({ ...a, [alert.id]: text }));
  }

  if (!alerts.length) return <p className="muted">No alerts. Your system is performing as expected.</p>;
  return (
    <ul className="alerts">
      {alerts.map((a) => (
        <li key={a.id} className={a.severity}>
          <p>{a.message}</p>
          {advice[a.id]
            ? <p className="ai">{advice[a.id]}<small>AI suggestion, confirm with a technician.</small></p>
            : <button onClick={() => onAdvise(a)}>What should I check?</button>}
        </li>
      ))}
    </ul>
  );
}
