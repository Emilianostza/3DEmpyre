import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer } from './presets';

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Trigger animation when component enters the viewport (default: true) */
  viewport?: boolean;
}

/**
 * Wraps children in a stagger-animated container.
 * Each direct child should be a <StaggerItem>.
 *
 * Usage:
 *   <StaggerContainer className="grid grid-cols-2 gap-4">
 *     {items.map(item => (
 *       <StaggerItem key={item.id}>
 *         <Card>{item.name}</Card>
 *       </StaggerItem>
 *     ))}
 *   </StaggerContainer>
 */
const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  viewport = true,
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      {...(viewport
        ? { whileInView: 'visible', viewport: { once: true, margin: '-40px' } }
        : { animate: 'visible' })}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default StaggerContainer;
