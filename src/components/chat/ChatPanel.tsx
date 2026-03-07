import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { springs } from '@/components/motion/presets';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { getQuickActions } from './chatResponses';
import ChatMessage, { TypingIndicator } from './ChatMessage';
import type { ChatMessage as ChatMessageType, ChatContext } from './types';

const panelVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transformOrigin: 'bottom right',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

interface ChatPanelProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onClose: () => void;
  context: ChatContext;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isTyping,
  onSendMessage,
  onClose,
  context,
}) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEscapeKey(onClose);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = getQuickActions(context);
  const showQuickActions = messages.length <= 1;

  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed bottom-24 right-6 z-[60] w-[380px] max-h-[520px] max-sm:w-[calc(100vw-2rem)] max-sm:right-4 max-sm:left-4 flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-modal overflow-hidden"
      role="dialog"
      aria-label="Quote Assistant"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] bg-gradient-to-r from-brand-600/10 to-purple-600/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white">Quote Assistant</p>
            <p className="text-[10px] text-zinc-500">Powered by AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-zinc-700/60 flex items-center justify-center transition-colors"
          aria-label="Close chat"
        >
          <X className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 scrollbar-thin"
        role="log"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showQuickActions && quickActions.length > 0 && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          {quickActions.map((qa) => (
            <button
              key={qa.id}
              type="button"
              onClick={() => onSendMessage(qa.query)}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/15 hover:border-brand-500/30 transition-all whitespace-nowrap cursor-pointer flex-shrink-0"
            >
              {qa.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="w-full pr-10 p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all text-sm"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-brand-400 hover:bg-brand-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPanel;
