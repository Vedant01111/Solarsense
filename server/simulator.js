// Fake IoT data: 7 days of hourly readings for a 5 kW demo system. Clearly simulated.
export const DEMO_KW = 5;
export const readings = [];

const expectedKw = (h) => DEMO_KW * 0.8 * Math.max(0, Math.sin((Math.PI * (h - 6)) / 12));

(function seed() {
  const now = new Date(); now.setMinutes(0, 0, 0);
  for (let i = 167; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600e3);
    const h = d.getHours(), exp = expectedKw(h);
    const dipDay = i >= 72 && i < 96;                       // one day with a fault
    const factor = dipDay && h >= 9 && h <= 15 ? 0.55 : 0.9 + Math.random() * 0.1;
    readings.push({ ts: d.toISOString(), hour: h, expectedKw: +exp.toFixed(2), actualKw: +(exp * factor).toFixed(2) });
  }
})();
