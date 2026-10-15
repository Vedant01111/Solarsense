// All LLM code lives here. Calculations stay in code; the model only explains and answers.
// Uses the Groq API (OpenAI-compatible chat completions with tool calling).
import { definitions, implementations } from './tools.js';

const URL = 'https://api.groq.com/openai/v1/chat/completions';
const EXPLAIN_RULES = `You explain solar proposals to customers. Use ONLY the numbers provided. Never calculate or invent figures. Keep it under 120 words, in simple language. End with the assumptions used.`;
const ADVISE_RULES = `You advise on a solar monitoring alert. Give likely causes (dust, shading, inverter fault, weather), what to check first, and when to call a technician. Under 100 words. Say it is a suggestion, not a diagnosis.`;
const ASK_RULES = `You answer questions about one customer's solar system. Use the tools for any data. Never guess numbers. Only answer solar-related questions. Keep answers short.`;

// tools.js keeps one neutral format; convert it to the OpenAI/Groq tool format here.
const tools = definitions.map((d) => ({
  type: 'function',
  function: { name: d.name, description: d.description, parameters: d.input_schema },
}));

async function post(body) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile', max_tokens: 400, ...body }),
  });
  if (!res.ok) throw new Error('LLM error ' + res.status + ' ' + (await res.text()));
  return res.json();
}
const messageOf = (data) => data.choices[0].message;

if (!process.env.GROQ_API_KEY) console.warn('GROQ_API_KEY is not set. Check server/.env and restart the server.');

export async function explainProposal(p) {
  try {
    const data = await post({ messages: [
      { role: 'system', content: EXPLAIN_RULES },
      { role: 'user', content: 'Proposal data (JSON): ' + JSON.stringify(p) },
    ] });
    return messageOf(data).content;
  } catch (err) {
    console.error('Groq explain failed:', err.message);
    return `Recommended system: ${p.systemKw} kW. Estimated payback: ${p.paybackYears} years. (AI explanation unavailable.)`;
  }
}

export async function adviseAlert(alert) {
  try {
    const data = await post({ messages: [
      { role: 'system', content: ADVISE_RULES },
      { role: 'user', content: 'Alert (JSON): ' + JSON.stringify(alert) },
    ] });
    return messageOf(data).content;
  } catch (err) {
    console.error('Groq advise failed:', err.message);
    return 'Check the panels for dust or shading, then inspect the inverter. Call a technician if output stays low.';
  }
}

export async function askSystem(question) {
  const messages = [{ role: 'system', content: ASK_RULES }, { role: 'user', content: question }];
  try {
    for (let step = 0; step < 5; step++) {                  // tool-calling loop with a hard cap
      const msg = messageOf(await post({ messages, tools }));
      if (!msg.tool_calls?.length) return msg.content;      // no tool needed: this is the final answer
      messages.push(msg);
      for (const call of msg.tool_calls) {
        const args = JSON.parse(call.function.arguments || '{}');
        const result = implementations[call.function.name]?.(args) ?? { error: 'unknown tool' };
        messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
      }
    }
    return 'Sorry, I could not finish that request.';
  } catch (err) {
    console.error('Groq ask failed:', err.message);
    return 'The assistant is unavailable right now. Please try again later.';
  }
}
