import { PanelLeftOpen, ShieldCheck } from 'lucide-react';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import ToneSelector from './ToneSelector';
import WelcomeScreen from './WelcomeScreen';

export default function ChatWindow({ conversation, tone, onTone, onSend, onRegenerate, isStreaming, error, collapsed, onToggleSidebar }) {
  return (
    <main className="chat-area">
      <header className="chat-header">
        {collapsed && (
          <button className="sidebar-toggle icon-button" onClick={onToggleSidebar} title="Open sidebar">
            <PanelLeftOpen size={20} />
          </button>
        )}
        <div><p className="header-label">Workspace</p><h2>Nexus AI <span>·</span> <ToneSelector tone={tone} onChange={onTone} disabled={isStreaming} /></h2></div>
        <div className="secure-label"><ShieldCheck size={15} /> Private workspace</div>
      </header>
      <section className="messages-area">
        {conversation?.messages?.length ? conversation.messages.map((message, index) => <MessageBubble key={message._id || `${message.role}-${index}`} message={message} canRegenerate={!isStreaming && message.role === 'assistant' && index === conversation.messages.length - 1} onRegenerate={() => onRegenerate(message._id)} />) : <WelcomeScreen onPrompt={onSend} />}
        {error && <div className="error-banner">{typeof error === 'string' ? error : String(error?.message || error)}</div>}
      </section>
      <footer className="composer"><ChatInput onSend={onSend} disabled={isStreaming} /><p className="disclaimer">Nexus AI can make mistakes. Check important information.</p></footer>
    </main>
  );
}

