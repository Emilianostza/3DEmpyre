import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { buttonInteraction } from '@/components/motion/presets';
import { getResponse, WELCOME_MESSAGE } from './chatResponses';
import ChatPanel from './ChatPanel';
import type { ChatMessage, ChatContext } from './types';

let msgId = 0;
const nextId = () => `msg-${++msgId}`;

interface ChatBubbleProps {
  context: ChatContext;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);

    // Add welcome message on first open
    if (!initialized) {
      setMessages([
        {
          id: nextId(),
          role: 'assistant',
          content: WELCOME_MESSAGE,
          timestamp: Date.now(),
        },
      ]);
      setInitialized(true);
    }
  }, [initialized]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSendMessage = useCallback(
    (text: string) => {
      // Add user message
      const userMsg: ChatMessage = {
        id: nextId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Simulate AI typing delay
      const delay = 600 + Math.random() * 600;
      setTimeout(() => {
        const response = getResponse(text, context);
        const assistantMsg: ChatMessage = {
          id: nextId(),
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);

        // Show unread dot if panel is closed
        if (!isOpen) {
          setHasUnread(true);
        }
      }, delay);
    },
    [context, isOpen],
  );

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <ChatPanel
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onClose={close}
            context={context}
          />
        )}
      </AnimatePresence>

      {/* Floating Bubble */}
      <motion.button
        type="button"
        onClick={() => (isOpen ? close() : open())}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-glow flex items-center justify-center transition-colors"
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
        {...buttonInteraction}
      >
        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-zinc-950 animate-pulse" />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default ChatBubble;
