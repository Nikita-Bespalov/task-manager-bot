import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  className?: string;
}

export default function ScreenHeader({ title, onBack, className }: ScreenHeaderProps) {
  return (
    <motion.header
      className={cn('glass-panel sticky top-0 z-40 px-5 py-4 flex items-center gap-3', className)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </motion.header>
  );
}
