// Fake IoT data. The system size and sun hours come from the latest proposal, so the chart
// matches what the customer was quoted. A simulated clock adds one hourly reading every 3 seconds.
import { ASSUMPTIONS } from './calculations.js';

export const readings = [];
export const state = { fault: false, systemKw: 5, sunHours: 5.3, fromProposal: false };
const MAX_READINGS = 336;   // keep 14 days of hourly data

// Scaled so one day's expected energy = kW x sun hours x performance ratio, the same as the proposal maths.
function expectedKw(h) {
  const peak = state.systemKw * ASSUMPTIONS.performanceRatio * state.sunHours * (Math.PI / 24);
  return peak * Math.max(0, Math.sin((Math.PI * (h - 6)) / 12));
}

function makeReading(date, fault) {
  const h = date.getHours(), exp = expectedKw(h);
  const factor = fault && h >= 9 && h <= 15 ? 0.55 : 0.9 + Math.random() * 0.1;
  return { ts: date.toISOString(), hour: h, expectedKw: +exp.toFixed(2), actualKw: +(exp * factor).toFixed(2) };
}

function seed() {
  readings.length = 0;      // mutate in place, other files import this same array
  const now = new Date(); now.setMinutes(0, 0, 0);
  for (let i = 167; i >= 0; i--) {
    readings.push(makeReading(new Date(now.getTime() - i * 3600e3), i >= 24 && i < 48));  // one fault day, about yesterday
  }
}
seed();

// Called when a new proposal is created: re-simulate the history for that system.
export function setSystem({ systemKw, sunHours }) {
  state.systemKw = systemKw; state.sunHours = sunHours; state.fromProposal = true;
  seed();
}

export function tick() {
  const next = new Date(new Date(readings.at(-1).ts).getTime() + 3600e3);
  readings.push(makeReading(next, state.fault));
  if (readings.length > MAX_READINGS) readings.shift();
}
setInterval(tick, 3000);
