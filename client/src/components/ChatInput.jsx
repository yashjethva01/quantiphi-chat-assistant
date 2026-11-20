import { ArrowUp, Paperclip } from 'lucide-react';
import { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const submit = () => { if (value.trim()) { onSend(value.trim()); setValue(''); } };
  return (
    <div className="input-shell">
      <textarea value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder="Message Nexus AI..." rows="1" disabled={disabled} />
      <div className="input-footer"><span><Paperclip size={15} /> Shift + Enter for new line</span><button className="send-button" onClick={submit} disabled={disabled || !value.trim()}><ArrowUp size={18} /></button></div>
    </div>
  );
}

