import { motion } from 'framer-motion';

export default function EmptyState({ message = 'У вас пока нет задач' }: { message?: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center mb-6">
        <span className="text-4xl">📋</span>
      </div>
      <p className="text-muted-foreground text-center text-sm font-medium">{message}</p>
    </motion.div>
  );
}
