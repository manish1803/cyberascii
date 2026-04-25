import React, { useState, useRef, useEffect } from 'react';

export interface ChatMessage {
  senderId: string;
  message: string;
  timestamp: number;
}

interface ChatPanelProps {
  isOpen: boolean;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  isOpen, 
  messages, 
  onSendMessage, 
  onClose 
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-title">TACTICAL_CHAT</div>
        <button className="chat-close" onClick={onClose}>×</button>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-placeholder">SIGNAL_LINK_STABLE: NO_MESSAGES</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.senderId === 'ME' ? 'sent' : 'received'}`}>
            <div className="chat-meta">
              <span className="chat-sender">{msg.senderId}</span>
              <span className="chat-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="chat-text">{msg.message}</div>
          </div>
        ))}
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input 
          type="text"
          className="chat-input"
          placeholder="ENTER_DATA..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          autoFocus
        />
        <button type="submit" className="chat-send">SEND</button>
      </form>

      <style>{`
        .chat-panel {
          position: fixed;
          right: 20px;
          top: 80px;
          bottom: 40px;
          width: 380px;
          background: rgba(9, 18, 9, 0.98);
          border: 1px solid var(--neon-primary);
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0, 255, 65, 0.05);
          display: flex;
          flex-direction: column;
          z-index: 500;
          animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .chat-header {
          padding: 12px 16px;
          background: var(--neon-primary);
          color: var(--void);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .chat-close {
          background: none;
          border: none;
          color: var(--void);
          font-size: 20px;
          cursor: pointer;
          font-weight: bold;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-placeholder {
          color: var(--text-ghost);
          font-size: 10px;
          text-align: center;
          margin-top: 40px;
          letter-spacing: 0.1em;
        }

        .chat-bubble {
          max-width: 85%;
          display: flex;
          flex-direction: column;
        }

        .chat-bubble.sent { align-self: flex-end; align-items: flex-end; }
        .chat-bubble.received { align-self: flex-start; align-items: flex-start; }

        .chat-meta {
          display: flex;
          gap: 8px;
          font-size: 8px;
          margin-bottom: 4px;
          font-family: var(--font-ui);
        }

        .chat-sender { color: var(--neon-hot); font-weight: 700; }
        .chat-time { color: var(--text-dim); }

        .chat-text {
          padding: 10px 14px;
          font-size: 13px;
          background: rgba(0, 255, 65, 0.05);
          border: 1px solid var(--green-900);
          color: var(--text-primary);
          line-height: 1.5;
          word-break: break-word;
          font-family: var(--font-terminal);
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 8px 100%, 0% calc(100% - 8px));
        }

        .sent .chat-text {
          border-color: var(--neon-primary);
          background: rgba(0, 255, 65, 0.15);
        }

        .chat-input-area {
          padding: 12px;
          background: var(--surface);
          border-top: 1px solid var(--green-800);
          display: flex;
          gap: 8px;
        }

        .chat-input {
          flex: 1;
          background: var(--void);
          border: 1px solid var(--green-600);
          color: var(--neon-primary);
          padding: 8px 12px;
          font-family: var(--font-terminal);
          font-size: 11px;
          outline: none;
        }

        .chat-input:focus { border-color: var(--neon-primary); box-shadow: 0 0 5px rgba(0, 255, 65, 0.3); }

        .chat-send {
          background: var(--neon-primary);
          color: var(--void);
          border: none;
          padding: 0 12px;
          font-family: var(--font-ui);
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: var(--void); }
        .chat-messages::-webkit-scrollbar-thumb { background: var(--green-800); }
      `}</style>
    </div>
  );
};
