import { useState } from 'react';
import ProposalForm from './components/ProposalForm.jsx';
import ProposalSummary from './components/ProposalSummary.jsx';
import LiveChart from './components/LiveChart.jsx';
import AlertsPanel from './components/AlertsPanel.jsx';
import AskPanel from './components/AskPanel.jsx';

export default function App() {
  const [proposal, setProposal] = useState(null);
  return (
    <main className="page">
      <header><h1>SolarSense</h1><p>Size a solar system, then watch how it performs.</p></header>
      <section className="grid">
        <div className="card"><h2>Get a proposal</h2><ProposalForm onCreated={setProposal} /></div>
        <div className="card"><h2>Your proposal</h2><ProposalSummary proposal={proposal} /></div>
      </section>
      <section className="card"><h2>System performance (simulated data)</h2><LiveChart /></section>
      <section className="grid">
        <div className="card"><h2>Alerts</h2><AlertsPanel /></div>
        <div className="card"><h2>Ask about your system</h2><AskPanel /></div>
      </section>
    </main>
  );
}
