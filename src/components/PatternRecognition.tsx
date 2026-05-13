import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';
import { useHerSenseStore, phaseLabel } from '@/stores/useHerSenseStore';

// Simulated pattern data
const PATTERNS = [
  { trend: 'You consistently lose ~2h of sleep 3 days before your cycle starts.', cycle: 'Recurring', confidence: 87 },
  { trend: 'Energy drops 40% during Days 22-26, correlating with progesterone peak.', cycle: 'Monthly', confidence: 92 },
  { trend: 'Headaches appear 2x more during Luteal phase than any other.', cycle: 'Monthly', confidence: 78 },
  { trend: 'Stress spikes on Mondays correlate with anxiety symptoms by Wednesday.', cycle: 'Weekly', confidence: 71 },
  { trend: 'Hydration below 40% precedes fatigue reports by 6-8 hours.', cycle: 'Daily', confidence: 85 },
];

const PatternRecognition = () => {
  const store = useHerSenseStore();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 space-y-3">
      <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
        <TrendingUp size={14} className="text-primary" /> Pattern Recognition
      </h3>
      <p className="text-xs text-muted-foreground">Based on your {phaseLabel(store.cyclePhase)} phase history:</p>

      <div className="space-y-2">
        {PATTERNS.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-3 rounded-xl bg-secondary/20 border border-border/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                <Calendar size={8} /> {p.cycle}
              </span>
              <span className="text-[10px] text-muted-foreground">{p.confidence}% confidence</span>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{p.trend}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PatternRecognition;
