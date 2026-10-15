# SolarSense

A solar proposal generator and monitoring dashboard with an AI layer. Inspired by what solar companies like Oorjan do: site assessment, proposals, and remote monitoring with maintenance alerts. All monitoring data is simulated.

## Run it
```
cd server && npm install && cp .env.example .env   # add your ANTHROPIC_API_KEY
npm run dev                                        # http://localhost:3001
cd client && npm install && npm run dev            # http://localhost:5173
```
The app works without an API key; AI features fall back to plain text.

## Where things live
- `server/calculations.js` sizing, cost, savings, payback (all numbers come from here)
- `server/alerts.js` low-output rule, `server/simulator.js` fake readings
- `server/tools.js` + `server/ai.js` the AI layer (tool calling, prompts, fallbacks)
- `client/src/api.js` every fetch call, `client/src/components/` one file per UI piece

## Practice changes (time yourself, 15 minutes each)
1. Add a battery storage option (new input, one formula).
2. Add time-of-day tariffs to the savings calculation.
3. Raise an alert when output is zero during the day.
4. Add a search or filter to the alerts list.
5. Add a roof tilt field through the form, API and summary.
6. Make the AI explanation shorter, or add Hindi/Marathi output.
7. Add a `getMonthlyGeneration` tool.
8. Cache the AI explanation so it is not regenerated on every click.
9. Add pagination to the saved proposals list.
10. Show a warning when payback is longer than 6 years.
