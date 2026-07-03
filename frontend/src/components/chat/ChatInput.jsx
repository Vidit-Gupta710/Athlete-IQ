import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled }) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !disabled) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-800 focus-within:border-emerald-500/80 transition duration-200">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? 'Waiting for response...' : 'Ask about hamstring stretches, training frequency, pain...'}
        className="flex-1 bg-transparent border-0 px-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!inputText.trim() || disabled}
        className="h-10 w-10 shrink-0 rounded-lg bg-emerald-500 hover:opacity-90 active:scale-95 text-slate-950 flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100"
      >
        <Send className="h-4.5 w-4.5" />
      </button>
    </form>
  );
}
