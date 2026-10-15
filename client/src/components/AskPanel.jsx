import { useState } from 'react';
import { ask } from '../api.js';

export default function AskPanel() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function send(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setQuestion(''); setLoading(true);
    try { const { text } = await ask(q); setMessages((m) => [...m, { role: 'assistant', text }]); }
    catch (err) { setMessages((m) => [...m, { role: 'assistant', text: err.message }]); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="chat">
        {!messages.length && <p className="muted">Try: “How much did I save in the last 7 days?”</p>}
        {messages.map((m, i) => <p key={i} className={m.role}>{m.text}</p>)}
        {loading && <p className="assistant muted">Thinking…</p>}
      </div>
      <form className="row" onSubmit={send}>
        <input value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={300} placeholder="Ask about savings or alerts" />
        <button disabled={loading}>Send</button>
      </form>
    </div>
  );
}
