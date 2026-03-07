import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  content,
  isOpen,
  onToggle,
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden transition-all duration-300 ${
        isOpen ? 'shadow-soft border-l-2 border-l-brand-500' : 'border-l-2 border-l-transparent'
      } ${className}`}
    >
      <button
        onClick={onToggle}
        className={`w-full px-5 py-4 flex items-center justify-between text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset ${
          isOpen ? 'bg-zinc-800/40' : 'hover:bg-zinc-800/60'
        }`}
        aria-expanded={isOpen}
      >
        <span className={`font-semibold pr-4 text-base leading-snug transition-colors duration-300 ${
          isOpen ? 'text-white' : 'text-zinc-300'
        }`}>{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-600 flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'rotate-180 text-brand-500' : ''
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5 text-sm text-zinc-400 border-t border-zinc-800 pt-4 leading-relaxed [&_p]:m-0">
          {content}
        </div>
      </div>
    </div>
  );
};

interface AccordionProps {
  items: {
    title: string;
    content: React.ReactNode;
  }[];
  allowMultiple?: boolean;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ items, allowMultiple = false, className = '' }) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const handleToggle = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.title}
          title={item.title}
          content={item.content}
          isOpen={openIndexes.includes(index)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
};

export default Accordion;
