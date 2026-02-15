import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const GlassCard = ({ children, className, hoverable = false, ...props }: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        hoverable ? 'glass-card-hover' : 'glass-card',
        'p-5',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
