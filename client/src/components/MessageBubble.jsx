import { Bot, Check, Copy, RefreshCw, User } from 'lucide-react';
import { useState } from 'react';

export default function MessageBubble({ message, canRegenerate, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <article className={`message-row ${isUser ? 'user-row' : ''}`}>
      <div className={`avatar ${isUser ? 'user-avatar' : ''}`}>{isUser ? <User size={16} /> : <Bot size={17} />}</div>
      <div className="message-content">
        <div className="message-meta"><strong>{isUser ? 'You' : 'Nexus AI'}</strong><time>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div>
        <div className={`message-bubble ${isUser ? 'user-bubble' : ''}`}>{message.content || <span className="typing"><i /><i /><i /></span>}</div>
        {!isUser && message.content && <div className="message-actions"><button onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}</button>{canRegenerate && <button onClick={onRegenerate}><RefreshCw size={14} /> Regenerate</button>}</div>}
      </div>
    </article>
  );
}

