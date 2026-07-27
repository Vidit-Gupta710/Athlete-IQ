import React, { useState, useEffect } from 'react';
import useAthlete from '../hooks/useAthlete';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import FileUpload from '../components/chat/FileUpload';
import { sendChatMessage } from '../api/chat';
import { Sparkles } from 'lucide-react';

export default function ChatPage() {
  const { athleteId, profile } = useAthlete();
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!athleteId) return;

    const savedDb = localStorage.getItem('athlete_mock_db');
    if (savedDb) {
      const db = JSON.parse(savedDb);
      if (db.chats && db.chats[athleteId] && db.chats[athleteId].length > 0) {
        setMessages(db.chats[athleteId]);
        return;
      }
    }

    if (profile) {
      const welcomeMsg = [
        {
          sender: 'ai',
          content: `Hi ${profile.name}! I am Athlete AI, your sports rehabilitation copilot. I've analyzed your onboarding profile. You logged target sport "${profile.sport}" with frequency "${profile.trainingFrequency}". Let's start discussing your mobility plans, pain points, or injuries.`,
          timestamp: new Date().toISOString()
        }
      ];
      setMessages(welcomeMsg);

      // Save initial welcome message to database
      let db = savedDb ? JSON.parse(savedDb) : {};
      if (!db.chats) db.chats = {};
      db.chats[athleteId] = welcomeMsg;
      localStorage.setItem('athlete_mock_db', JSON.stringify(db));
    }
  }, [athleteId, profile]);

  const handleSendMessage = async (text) => {
    if (!athleteId) return;
    setError(null);
    const userMsg = {
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    
    // Update local state and persist immediately to localStorage
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      const savedDb = localStorage.getItem('athlete_mock_db');
      let db = savedDb ? JSON.parse(savedDb) : {};
      if (!db.chats) db.chats = {};
      db.chats[athleteId] = updated;
      localStorage.setItem('athlete_mock_db', JSON.stringify(db));
      return updated;
    });

    setIsSending(true);

    try {
      const response = await sendChatMessage(athleteId, text);
      if (response && response.reply) {
        const aiMsg = {
          sender: 'ai',
          content: response.reply,
          timestamp: response.timestamp || new Date().toISOString()
        };

        // Update local state and persist AI response to localStorage
        setMessages((prev) => {
          const updated = [...prev, aiMsg];
          const savedDb = localStorage.getItem('athlete_mock_db');
          let db = savedDb ? JSON.parse(savedDb) : {};
          if (!db.chats) db.chats = {};
          db.chats[athleteId] = updated;
          localStorage.setItem('athlete_mock_db', JSON.stringify(db));
          return updated;
        });
      } else {
        throw new Error('No reply received from Copilot.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to receive response from Copilot. Please check connections.');
    } finally {
      setIsSending(false);
    }
  };

  const handleUploadComplete = async (fileName) => {
    const promptText = `I have uploaded a medical file: "${fileName}". Please analyze this scan report for structural injuries and recommend adjustments to my recovery.`;
    handleSendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto neu-flat relative overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent-primary)] animate-ping"></div>
          <div>
            <h1 className="text-base font-bold text-theme-heading flex items-center gap-1.5">
              Ask Athlete AI <Sparkles className="h-4 w-4 text-theme-primary" />
            </h1>
            <p className="text-xs text-theme-muted font-medium">Memory-backed sports training injury copilot</p>
          </div>
        </div>
        
        {profile?.injuries && profile.injuries.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 neu-pressed px-3 py-1.5 text-xs text-theme-primary font-bold border border-[var(--accent-primary)]/30">
            Injury Focus: {profile.injuries[0].name}
          </div>
        )}
      </div>

      {error && (
        <div className="neu-pressed text-red-500 text-xs px-6 py-3 font-bold text-center m-3">
          {error}
        </div>
      )}

      <ChatWindow messages={messages} isLoading={isSending} />

      <div className="p-4 border-t border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <FileUpload onUploadComplete={handleUploadComplete} disabled={isSending} />
          {profile && (
            <span className="text-[10px] text-theme-muted uppercase tracking-widest font-bold font-sans">
              Coaching {profile.name} • {profile.sport}
            </span>
          )}
        </div>
        
        <ChatInput onSendMessage={handleSendMessage} disabled={isSending} />
      </div>
    </div>
  );
}
