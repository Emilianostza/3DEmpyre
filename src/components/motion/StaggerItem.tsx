import React from 'react';
import { motion } from 'framer-motion';
import { staggerItem } from './presets';

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Individual item inside a <StaggerContainer>.
 * Fades up with a slight scale when the container animates.
 *
 * Usage:
 *   <StaggerContainer>
 *     <StaggerItem><Card /></StaggerItem>
 *     <StaggerItem><Card /></StaggerItem>
 *   </StaggerContainer>
 */
const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = '' }) => (
  <motion.div variants={staggerItem} className={className}>
    {children}
  </motion.div>
);

export default StaggerItem;
