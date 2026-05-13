import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'reveal'>('loading');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setPhase('reveal');
          setTimeout(onComplete, 800);
          return 100;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'reveal' || progress < 100 ? (
        <motion.div
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-8"
        >
          {/* Animated logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 100 }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center"
              style={{ boxShadow: '0 0 60px hsla(var(--primary) / 0.3), inset 0 0 30px hsla(var(--primary) / 0.1)' }}
            >
              <Sparkles className="text-primary" size={36} />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ background: 'radial-gradient(circle, hsla(var(--primary) / 0.2), transparent)' }}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center">
            <h1 className="font-display text-4xl font-bold text-foreground glow-text mb-2">HerSense</h1>
            <p className="text-sm text-muted-foreground">Bio-Intelligence Operating System</p>
          </motion.div>

          {/* Progress bar */}
          <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 200 }} transition={{ delay: 0.5 }} className="relative">
            <div className="w-[200px] h-1 bg-secondary/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              {progress < 30 ? 'Initializing neural core...' : progress < 60 ? 'Syncing bio-data...' : progress < 90 ? 'Calibrating wellness engine...' : 'Ready'}
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
