import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

/**
 * Drop-in replacement for React Router's <Outlet> that wraps
 * the current route element in <AnimatePresence> so pages can
 * animate in and out on navigation.
 *
 * The `key` is set to `location.pathname` so Framer Motion detects
 * route changes and triggers the exit → enter cycle.
 *
 * Usage in App.tsx:
 *   <Route element={<AnimatedOutlet />}>
 *     <Route path="/" element={<Home />} />
 *   </Route>
 */
const AnimatedOutlet: React.FC = () => {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {element && React.cloneElement(element as React.ReactElement, { key: location.pathname })}
    </AnimatePresence>
  );
};

export default AnimatedOutlet;
