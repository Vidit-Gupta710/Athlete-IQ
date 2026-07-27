import React from 'react';
import { User, Cpu } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
      {/* Avatar Node */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
        isUser 
          ? 'neu-button text-neon-green' 
          : 'neu-pressed text-theme-primary border border-[var(--accent-primary)]/30'
      }`}>
        {isUser ? <User className="h-4.5 w-4.5 text-neon-green" /> : <Cpu className="h-4 w-4 text-theme-primary" />}
      </div>

      {/* Bubble Box */}
      <div className={`p-4 text-sm leading-relaxed ${
        isUser
          ? 'neu-button text-theme-main font-bold rounded-2xl rounded-tr-none border border-[var(--accent-primary)]/20'
          : 'neu-pressed text-theme-main font-medium rounded-2xl rounded-tl-none border border-[var(--accent-primary)]/10'
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span className="block text-[10px] opacity-70 mt-1.5 text-right font-bold text-theme-muted">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
