import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ dark, onToggle }) {
  return <button className="icon-button" onClick={onToggle} title="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>;
}

