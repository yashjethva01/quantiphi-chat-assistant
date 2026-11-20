import { MessageSquarePlus, MoreHorizontal, PanelLeftClose, Search, Trash2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ conversations, activeId, query, onQuery, onNew, onSelect, onDelete, dark, onTheme, collapsed, onCollapse }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand"><div className="brand-mark">N</div><span>Nexus AI</span><button className="icon-button sidebar-close" onClick={onCollapse}><PanelLeftClose size={18} /></button></div>
      <button className="new-chat" onClick={onNew}><MessageSquarePlus size={18} /> New conversation</button>
      <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search conversations" /></label>
      <div className="history-heading"><span>Recent conversations</span><MoreHorizontal size={16} /></div>
      <div className="history-list">
        {conversations.length ? conversations.map((item) => <div className={`history-item ${activeId === item._id ? 'active' : ''}`} key={item._id}><button onClick={() => onSelect(item._id)}><span>{item.title}</span><small>{new Date(item.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</small></button><button className="delete-button" onClick={() => onDelete(item._id)} title="Delete conversation"><Trash2 size={14} /></button></div>) : <p className="empty-history">{query ? 'No conversations found.' : 'Your conversations will appear here.'}</p>}
      </div>
      <div className="sidebar-bottom"><ThemeToggle dark={dark} onToggle={onTheme} /><span>{dark ? 'Dark mode' : 'Light mode'}</span></div>
    </aside>
  );
}

