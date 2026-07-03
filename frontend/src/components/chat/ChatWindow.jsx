import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Loader2 } from 'lucide-react';

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
            💡
          </div>
          <h3 className="text-lg font-bold text-slate-200">Start your Copilot Chat</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            Ask specific questions about pain management, rehab exercises, training load targets, or upload knee scans.
          </p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))
      )}

      {isLoading && (
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 mr-12 w-fit animate-pulse">
          <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
          <span className="text-sm text-slate-400">Athlete AI is designing recovery response...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
