"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Subtle entrance animation that fully disables itself for reduced-motion users. */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
