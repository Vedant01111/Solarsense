import { useState } from 'react';
import { explain } from '../api.js';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function ProposalSummary({ proposal }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  if (!proposal) return <p className="muted">Fill in the form to see a proposal.</p>;

  async function onExplain() {
    setLoading(true);
    try { setText((await explain(proposal)).text); } finally { setLoading(false); }
  }

  return (
    <div>
      <dl>
        <dt>Recommended system</dt><dd>{proposal.systemKw} kW{proposal.limitedByRoof && ' (limited by roof area)'}</dd>
        <dt>Estimated cost</dt><dd>{inr(proposal.estimatedCost)}</dd>
        <dt>Yearly savings</dt><dd>{inr(proposal.yearlySavings)}</dd>
        <dt>Payback</dt><dd>{proposal.paybackYears} years</dd>
      </dl>
      <p className="muted">Assumes ₹{proposal.assumptions.tariff}/unit and {proposal.sunHours} sun hours/day.</p>
      <button onClick={onExplain} disabled={loading}>{loading ? 'Explaining…' : 'Explain this to me'}</button>
      {text && <p className="ai">{text}<small>AI-generated explanation of the numbers above.</small></p>}
    </div>
  );
}
