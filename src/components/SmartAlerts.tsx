import { useHerSenseStore, phaseLabel } from '@/stores/useHerSenseStore';
import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, Zap, Moon } from 'lucide-react';
import { useMemo } from 'react';

interface Alert {
  type: 'warning' | 'tip' | 'info';
  icon: React.ReactNode;
  message: string;
}

const SmartAlerts = () => {
  const store = useHerSenseStore();

  const alerts = useMemo<Alert[]>(() => {
    const a: Alert[] = [];

    // Cortisol spike detection
    if (store.stress > 70 && store.cycleDay >= 22) {
      a.push({
        type: 'warning',
        icon: <AlertTriangle size={14} />,
        message: `Cortisol Spike Detected: You're on Day ${store.cycleDay}, high risk of PMS anxiety. Try Magnesium tonight.`,
      });
    }

    // Low energy during luteal
    if (store.energy < 40 && store.cyclePhase === 'luteal') {
      a.push({
        type: 'tip',
        icon: <Zap size={14} />,
        message: `Energy dip in ${phaseLabel(store.cyclePhase)} phase. Complex carbs + B6 can boost serotonin production.`,
      });
    }

    // Dehydration warning
    if (store.hydration < 35) {
      a.push({
        type: 'warning',
        icon: <AlertTriangle size={14} />,
        message: 'Dehydration alert! You\'re at risk of headaches and fatigue. Drink 2 glasses of water now.',
      });
    }

    // Sleep suggestion
    if (store.sleep < 6) {
      a.push({
        type: 'tip',
        icon: <Moon size={14} />,
        message: `Only ${store.sleep}h sleep logged. Melatonin production peaks during ${phaseLabel(store.cyclePhase)}—try sleep by 10:30 PM.`,
      });
    }

    // Phase-specific tips
    if (store.cyclePhase === 'ovulation' && store.energy > 60) {
      a.push({
        type: 'info',
        icon: <Lightbulb size={14} />,
        message: 'Peak energy detected! Great time for HIIT or strength training. Your body is primed for performance.',
      });
    }

    if (store.cyclePhase === 'menstrual' && store.symptoms.includes('Cramps')) {
      a.push({
        type: 'tip',
        icon: <Lightbulb size={14} />,
        message: 'Cramps active: Warm compress + ginger tea. Avoid cold drinks. Gentle stretching over intense exercise.',
      });
    }

    if (a.length === 0) {
      a.push({
        type: 'info',
        icon: <Lightbulb size={14} />,
        message: 'All vitals look balanced! Keep maintaining your current routine.',
      });
    }

    return a;
  }, [store.stress, store.energy, store.hydration, store.sleep, store.cycleDay, store.cyclePhase, store.symptoms]);

  const colorMap = {
    warning: 'border-destructive/30 bg-destructive/5',
    tip: 'border-phase-ovulation/30 bg-phase-ovulation/5',
    info: 'border-primary/30 bg-primary/5',
  };
  const iconColor = { warning: 'text-destructive', tip: 'text-phase-ovulation', info: 'text-primary' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
        <Zap size={14} className="text-primary" /> Smart Alerts
      </h3>
      {alerts.map((alert, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
          className={`p-3 rounded-xl border ${colorMap[alert.type]} flex items-start gap-2`}>
          <span className={`mt-0.5 ${iconColor[alert.type]}`}>{alert.icon}</span>
          <p className="text-xs text-foreground/80 leading-relaxed">{alert.message}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SmartAlerts;
