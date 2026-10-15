// Rule: midday output more than 30% below expected raises one alert per day.
export function getAlerts(readings) {
  const seen = new Set(), out = [];
  for (const r of readings) {
    if (r.hour < 9 || r.hour > 15 || r.expectedKw <= 0 || r.actualKw >= 0.7 * r.expectedKw) continue;
    const day = r.ts.slice(0, 10);
    if (seen.has(day)) continue;
    seen.add(day);
    const drop = Math.round((1 - r.actualKw / r.expectedKw) * 100);
    out.push({ id: day, ts: r.ts, drop, severity: drop > 50 ? 'high' : 'medium', message: `Output ${drop}% below expected on ${day}` });
  }
  return out;
}
