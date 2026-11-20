import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { useChat } from './hooks/useChat';

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('nexus-theme') !== 'light');
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const chat = useChat();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('nexus-theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => {
    const timer = setTimeout(() => chat.refresh(query).catch(() => {}), 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="app-shell">
      <Sidebar {...chat} conversations={chat.conversations} activeId={chat.conversation?._id} query={query} onQuery={setQuery} onNew={chat.createNewConversation} onSelect={chat.selectConversation} onDelete={(id) => window.confirm('Delete this conversation?') && chat.removeConversation(id)} dark={dark} onTheme={() => setDark((value) => !value)} collapsed={collapsed} onCollapse={() => setCollapsed(true)} />
      <ChatWindow conversation={chat.conversation} tone={chat.tone} onTone={chat.changeTone} onSend={(message) => chat.sendMessage(message)} onRegenerate={(messageId) => chat.sendMessage('', messageId)} isStreaming={chat.isStreaming} error={chat.error} collapsed={collapsed} onToggleSidebar={() => setCollapsed((value) => !value)} />
    </div>
  );
}

