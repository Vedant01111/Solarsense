// Functions the AI chat may call. They read data; the model never calculates.
import { readings } from './simulator.js';
import { getAlerts } from './alerts.js';
import { ASSUMPTIONS } from './calculations.js';

export const lastDays = (days) => readings.filter((r) => new Date(r.ts).getTime() >= Date.now() - days * 86400e3);

export function dailyTotals(days = 7) {
  const m = {};
  for (const r of lastDays(days)) { const d = r.ts.slice(0, 10); m[d] = (m[d] || 0) + r.actualKw; }
  return Object.entries(m).map(([date, kwh]) => ({ date, kwh: +kwh.toFixed(1) }));
}

export const implementations = {
  getSavings: ({ days = 7 }) => {
    const kwh = dailyTotals(days).reduce((s, d) => s + d.kwh, 0);
    return { days, kwh: +kwh.toFixed(1), savingsInr: Math.round(kwh * ASSUMPTIONS.tariff) };
  },
  getDailyGeneration: ({ days = 7 }) => dailyTotals(days),
  getAlerts: () => getAlerts(readings),
};

const daysSchema = { type: 'object', properties: { days: { type: 'number', description: 'How many past days' } } };
export const definitions = [
  { name: 'getSavings', description: 'Energy generated (kWh) and money saved (INR) over the last N days', input_schema: daysSchema },
  { name: 'getDailyGeneration', description: 'Energy generated per day over the last N days', input_schema: daysSchema },
  { name: 'getAlerts', description: 'Low-output alerts raised for the system', input_schema: { type: 'object', properties: {} } },
];
