// components/ui/insight-card.tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface InsightCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subtext?: string;
  colorClass?: string;
}

export const InsightCard = ({ icon, label, value, subtext, colorClass = 'from-blue-500 to-blue-700' }: InsightCardProps) => (
  <motion.div
    className={`bg-gradient-to-br ${colorClass} text-white rounded-xl shadow-lg p-4 flex flex-col items-start space-y-1`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-center space-x-2">
      <div className="text-white/80">{icon}</div>
      <span className="text-sm font-medium opacity-90">{label}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {subtext && <p className={`text-sm font-medium text-white px-2 py-0.5 rounded-md inline-block ${
    label === "Paling Diminati"
      ? "bg-black/30"
      : "bg-white/20"
  }`}>{subtext}</p>}
  </motion.div>
);