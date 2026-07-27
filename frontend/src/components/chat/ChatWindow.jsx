import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Loader2 } from 'lucide-react';

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 rounded-full neu-pressed flex items-center justify-center text-theme-primary mb-4 animate-bounce">
            💡
          </div>
          <h3 className="text-lg font-bold text-theme-heading">Start your Copilot Chat</h3>
          <p className="text-sm text-theme-muted font-medium max-w-sm mt-1">
            Ask specific questions about pain management, rehab exercises, training load targets, or upload knee scans.
          </p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))
      )}

      {isLoading && (
        <div className="flex items-center gap-3 neu-pressed p-4 mr-12 w-fit border border-[var(--accent-primary)]/20 animate-pulse">
          <Loader2 className="h-4 w-4 text-theme-primary animate-spin" />
          <span className="text-sm font-semibold text-theme-muted">Athlete AI is designing recovery response...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
