import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { pageVariants } from './presets';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a page component with enter/exit slide+scale animation.
 *
 * Usage:
 *   const MyPage = () => (
 *     <PageTransition>
 *       <h1>Hello</h1>
 *     </PageTransition>
 *   );
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
