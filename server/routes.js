import { Router } from 'express';
import { calculateProposal } from './calculations.js';
import { getAlerts } from './alerts.js';
import { readings, state, setSystem } from './simulator.js';
import { dailyTotals, lastDays, implementations } from './tools.js';
import { explainProposal, adviseAlert, askSystem } from './ai.js';

const router = Router();
const proposals = [];

router.post('/proposals', (req, res) => {
  try {
    const p = { id: Date.now(), ...calculateProposal(req.body) };
    proposals.push(p);
    setSystem({ systemKw: p.systemKw, sunHours: p.sunHours });   // monitoring now simulates this proposal
    res.status(201).json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
router.get('/proposals', (_req, res) => res.json(proposals));

router.get('/readings', (req, res) => {
  const days = Math.min(Number(req.query.days) || 2, 7);
  res.json({
    hourly: lastDays(days), daily: dailyTotals(days), savings: implementations.getSavings({ days }),
    fault: state.fault,
    system: { kw: state.systemKw, sunHours: state.sunHours, fromProposal: state.fromProposal },
  });
});
router.get('/alerts', (_req, res) => res.json(getAlerts(readings)));

// Demo controls: start or stop a simulated panel fault.
router.post('/simulate/fault', (_req, res) => { state.fault = true; res.json({ fault: true }); });
router.post('/simulate/clear', (_req, res) => { state.fault = false; res.json({ fault: false }); });

router.post('/ai/explain', async (req, res) => res.json({ text: await explainProposal(req.body.proposal) }));
router.post('/ai/advise', async (req, res) => res.json({ text: await adviseAlert(req.body.alert) }));
router.post('/ai/ask', async (req, res) => {
  const q = String(req.body.question || '').trim().slice(0, 300);
  if (!q) return res.status(400).json({ error: 'Question is required' });
  res.json({ text: await askSystem(q) });
});

export default router;
