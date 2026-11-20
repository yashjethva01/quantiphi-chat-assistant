import { ArrowUpRight, Sparkles } from 'lucide-react';

const prompts = ['Explain a complex idea simply', 'Help me plan my next project', 'Write a polished professional email'];

export default function WelcomeScreen({ onPrompt }) {
  return (
    <div className="welcome">
      <div className="welcome-icon"><Sparkles size={26} /></div>
      <p className="eyebrow">WELCOME TO NEXUS AI</p>
      <h1>How can I help you today?</h1>
      <p className="welcome-copy">Ask anything. Get thoughtful, useful answers that move your work forward.</p>
      <div className="prompt-grid">
        {prompts.map((prompt) => <button className="prompt-card" key={prompt} onClick={() => onPrompt(prompt)}>{prompt}<ArrowUpRight size={16} /></button>)}
      </div>
    </div>
  );
}

