import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { springs } from '@/components/motion/presets';
import type { ChatMessage as ChatMessageType } from './types';

const messageVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.snappy,
  },
};

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isUser
            ? 'bg-brand-600/20 border border-brand-500/20'
            : 'bg-zinc-700/60 border border-zinc-600/30'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-brand-400" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-zinc-400" />
        )}
      </div>
      <div
        className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-600/15 border border-brand-500/20 text-zinc-200 rounded-2xl rounded-tr-md'
            : 'bg-zinc-800/60 border border-zinc-700/30 text-zinc-300 rounded-2xl rounded-tl-md'
        }`}
      >
        {message.content.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {renderMarkdownBold(line)}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};

/** Simple bold markdown renderer — replaces **text** with <strong> */
function renderMarkdownBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const TypingIndicator: React.FC = () => (
  <motion.div
    variants={messageVariants}
    initial="hidden"
    animate="visible"
    className="flex gap-2.5"
  >
    <div className="w-7 h-7 rounded-lg bg-zinc-700/60 border border-zinc-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Bot className="w-3.5 h-3.5 text-zinc-400" />
    </div>
    <div className="bg-zinc-800/60 border border-zinc-700/30 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  </motion.div>
);

export default ChatMessage;
