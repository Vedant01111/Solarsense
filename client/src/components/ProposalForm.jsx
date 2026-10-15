import { useState } from 'react';
import { createProposal } from '../api.js';

const empty = { monthlyBill: '', roofArea: '', city: 'Mumbai', propertyType: 'home' };

export default function ProposalForm({ onCreated }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try { onCreated(await createProposal(form)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit}>
      <label>Monthly electricity bill (₹)<input type="number" min="1" value={form.monthlyBill} onChange={set('monthlyBill')} required /></label>
      <label>Roof area (m²)<input type="number" min="1" value={form.roofArea} onChange={set('roofArea')} required /></label>
      <label>City<input value={form.city} onChange={set('city')} required /></label>
      <label>Property type
        <select value={form.propertyType} onChange={set('propertyType')}>
          <option value="home">Home</option><option value="commercial">Commercial</option><option value="industrial">Industrial</option>
        </select>
      </label>
      {error && <p className="error">{error}</p>}
      <button disabled={loading}>{loading ? 'Calculating…' : 'Calculate proposal'}</button>
    </form>
  );
}
