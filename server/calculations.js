// Pure sizing logic. Every number the customer sees comes from here, never from the AI.
export const SUN_HOURS = { mumbai: 5.2, pune: 5.5, delhi: 5.3, bengaluru: 5.4, hyderabad: 5.6, chennai: 5.5, ahmedabad: 5.8 };
export const ASSUMPTIONS = {
  tariff: 8,               // INR per unit (kWh)
  performanceRatio: 0.8,   // real-world losses
  areaPerKw: 10,           // m2 of roof per kW
  defaultSunHours: 5.3,
  costPerKw: { home: 55000, commercial: 48000, industrial: 42000 }, // INR, illustrative
};

export function calculateProposal({ monthlyBill, roofArea, city, propertyType }) {
  const bill = Number(monthlyBill), area = Number(roofArea);
  if (!(bill > 0) || !(area > 0)) throw new Error('Monthly bill and roof area must be positive numbers');
  const type = ASSUMPTIONS.costPerKw[propertyType] ? propertyType : 'home';
  const sunHours = SUN_HOURS[String(city).toLowerCase()] ?? ASSUMPTIONS.defaultSunHours;

  const unitsPerDay = bill / ASSUMPTIONS.tariff / 30;
  const neededKw = unitsPerDay / (sunHours * ASSUMPTIONS.performanceRatio);
  const roofLimitKw = area / ASSUMPTIONS.areaPerKw;
  const systemKw = Math.round(Math.min(neededKw, roofLimitKw) * 10) / 10;

  const yearlyGenerationKwh = Math.round(systemKw * sunHours * ASSUMPTIONS.performanceRatio * 365);
  const estimatedCost = Math.round(systemKw * ASSUMPTIONS.costPerKw[type]);
  const yearlySavings = Math.round(yearlyGenerationKwh * ASSUMPTIONS.tariff);
  const paybackYears = yearlySavings ? Math.round((estimatedCost / yearlySavings) * 10) / 10 : null;

  return {
    city, propertyType: type, monthlyBill: bill, roofArea: area, sunHours,
    systemKw, limitedByRoof: neededKw > roofLimitKw,
    yearlyGenerationKwh, estimatedCost, yearlySavings, paybackYears,
    assumptions: { tariff: ASSUMPTIONS.tariff, performanceRatio: ASSUMPTIONS.performanceRatio, costPerKw: ASSUMPTIONS.costPerKw[type] },
  };
}
