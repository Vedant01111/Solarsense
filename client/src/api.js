// Every network call lives here.
async function request(url, options) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
const post = (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) });

export const createProposal = (form) => post('/api/proposals', form);
export const getReadings = (days = 2) => request(`/api/readings?days=${days}`);
export const getAlerts = () => request('/api/alerts');
export const explain = (proposal) => post('/api/ai/explain', { proposal });
export const advise = (alert) => post('/api/ai/advise', { alert });
export const ask = (question) => post('/api/ai/ask', { question });
