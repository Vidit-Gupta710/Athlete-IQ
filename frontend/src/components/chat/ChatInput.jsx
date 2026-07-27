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
    <form onSubmit={handleSubmit} className="flex gap-3 p-2 neu-pressed focus-within:ring-1 focus-within:ring-[var(--accent-primary)]/50 transition duration-200">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? 'Waiting for response...' : 'Ask about hamstring stretches, training frequency, pain...'}
        className="flex-1 bg-transparent border-0 px-3 text-sm text-theme-main font-semibold placeholder:text-theme-muted focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!inputText.trim() || disabled}
        className="h-10 w-10 shrink-0 neu-blue-button flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer"
      >
        <Send className="h-4.5 w-4.5" />
      </button>
    </form>
  );
}
