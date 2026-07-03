import React from 'react';
import { User, Cpu } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
      {/* Avatar Node */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
        isUser 
          ? 'bg-slate-900 border-slate-800 text-slate-300' 
          : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400'
      }`}>
        {isUser ? <User className="h-4.5 w-4.5" /> : <Cpu className="h-4 w-4" />}
      </div>

      {/* Bubble Box */}
      <div className={`rounded-2xl p-4 text-sm leading-relaxed shadow-md ${
        isUser
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-medium rounded-tr-none'
          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span className="block text-[10px] opacity-60 mt-1.5 text-right font-medium">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
