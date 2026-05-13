import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import NeuralCore from '@/components/NeuralCore';
import RadialGauge from '@/components/RadialGauge';
import { useHerSenseStore, phaseLabel, phaseEmoji, CyclePhase } from '@/stores/useHerSenseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Brain, Moon, SmilePlus, X, Sparkles, AlertCircle, Info } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const sparkData = Array.from({ length: 24 }, (_, i) => ({
  t: i,
  energy: 40 + Math.sin(i * 0.5) * 30 + Math.random() * 10,
  stress: 30 + Math.cos(i * 0.4) * 25 + Math.random() * 10,
}));

const CommandCenter = () => {
  const store = useHerSenseStore();
  const { toast } = useToast();
  const [showZenModal, setShowZenModal] = useState(false);
  const [activeZenTask, setActiveZenTask] = useState("");
  const [cycleStatus, setCycleStatus] = useState<any>(null);

  // 1. Fetch Dynamic Cycle Status & Adjust Gauges
  useEffect(() => {
    // Fetch cycle metadata from the new backend endpoint
    fetch(`http://localhost:8000/engine/cycle/status?phase=${store.cyclePhase}`)
      .then(res => res.json())
      .then(data => setCycleStatus(data))
      .catch(() => console.error("Cycle status offline"));

    // Bio-Reactive Gauge Logic: Shift stats based on Phase
    if (store.cyclePhase === 'follicular' || store.cyclePhase === 'ovulation') {
      store.setEnergy(Math.min(95, store.energy + 10));
      store.setStress(Math.max(20, store.stress - 5));
    } else if (store.cyclePhase === 'luteal' || store.cyclePhase === 'menstrual') {
      store.setEnergy(Math.max(40, store.energy - 15));
      store.setStress(Math.min(90, store.stress + 10));
    }
  }, [store.cyclePhase]);

  const waterInLiters = (store.hydration * 3) / 100; 
  const isHydrationGoalMet = store.hydration >= 100;

  const zenTasks = [
    "Take 3 deep breaths. Imagine your stress leaving as blue mist.",
    "Think of something funny: A penguin trying to use a toaster.",
    "Quick Joke: Why don't scientists trust atoms? Because they make up everything!",
    "Close your eyes and name 3 things you can hear right now.",
    "Smile for 10 seconds. It trickily tells your brain you're happy!"
  ];

  // Stress Sentinel
  useEffect(() => {
    if (store.stress >= 60 && store.stress < 85) {
      toast({
        title: "High Stress Detected ⚠️",
        description: "Your system is under load. Consider a Zen Moment.",
        variant: "destructive",
      });
    } else if (store.stress >= 85) {
      toast({
        title: "Critical Stress 🚨",
        description: "Immediate relaxation recommended. Use the Meditate tool.",
        variant: "destructive",
      });
    }
  }, [store.stress, toast]);

  const handleMeditate = () => {
    const randomTask = zenTasks[Math.floor(Math.random() * zenTasks.length)];
    setActiveZenTask(randomTask);
    setShowZenModal(true); 
    const currentStress = store.stress;
    store.setStress(Math.max(0, currentStress - 20)); 
  };

  const handleAddWater = () => {
    store.addWater();
    if (store.hydration + 10 >= 100 && !isHydrationGoalMet) {
      toast({
        title: "Goal Reached! 💧",
        description: "You've hit your 3L hydration target for today.",
      });
    }
  };

  const handleLogMood = () => {
    const currentStress = store.stress;
    store.setStress(Math.min(100, currentStress + 15));
    toast({
      title: "Mood Logged",
      description: "Hormonal shift detected. Stress level adjusted.",
    });
  };

  return (
    <Layout>
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5 text-left">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Bio-Status</p>
            <h1 className="font-display text-xl font-bold text-foreground">Welcome back, {store.userName || 'Sam'}</h1>
          </div>
          <div className="glass-card px-3 py-1.5 flex items-center gap-1.5 border-primary/20">
            <span>{phaseEmoji(store.cyclePhase)}</span>
            <span className="text-xs font-bold text-primary">{phaseLabel(store.cyclePhase)}</span>
            <span className="text-xs text-muted-foreground">• Day {store.cycleDay}</span>
          </div>
        </motion.div>

        {/* Phase Selector */}
        <div className="flex gap-2">
          {(['menstrual', 'follicular', 'ovulation', 'luteal'] as CyclePhase[]).map((p) => (
            <button
              key={p}
              onClick={() => store.setCyclePhase(p)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                store.cyclePhase === p
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
              }`}
            >
              {phaseEmoji(p)} {phaseLabel(p)}
            </button>
          ))}
        </div>

        {/* 🩸 PERIOD TRACKER WIDGET - Only shows during Menstrual Phase with Active Status */}
        <AnimatePresence>
          {store.cyclePhase === 'menstrual' && cycleStatus?.status === "Active" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card-strong p-4 border-l-4 border-rose-500 bg-gradient-to-r from-rose-500/10 to-transparent space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-rose-500" />
                    <span className="text-[10px] font-bold uppercase text-foreground">Active Flow • {cycleStatus.days_remaining} Days Left</span>
                  </div>
                  <AlertCircle size={14} className="text-rose-500" />
                </div>
                <div className="flex gap-2">
                  {['Light', 'Medium', 'Heavy'].map(f => (
                    <button key={f} className="flex-1 py-1.5 rounded-lg bg-background/40 border border-white/5 text-[9px] font-bold uppercase hover:bg-rose-500/20 hover:text-rose-500 transition-all">
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex items-start gap-2 p-2 bg-background/50 rounded-lg">
                   <Info size={12} className="mt-0.5 text-rose-400" />
                   <p className="text-[10px] text-muted-foreground italic leading-relaxed">"{cycleStatus.intensity_alert} {cycleStatus.action}"</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Neural Core */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card-strong rounded-3xl overflow-hidden relative"
          style={{ height: 260 }}
        >
          <NeuralCore />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        </motion.div>

        {/* Gauges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-around items-center pt-2">
          <RadialGauge value={store.energy} label="Energy" />
          <RadialGauge value={store.stress} label="Stress" />
          <RadialGauge value={store.hydration} label="Water" unit="%" />
          <RadialGauge value={store.sleep * (100 / 10)} label="Sleep" unit="h" max={100} />
        </motion.div>

        {/* Hydration Progress Text */}
        <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Current Intake: <span className={isHydrationGoalMet ? "text-primary font-bold shadow-primary/50 drop-shadow-md" : "text-foreground"}>
                  {waterInLiters.toFixed(1)}L / 3.0L
                </span>
            </p>
        </div>

        {/* Sparklines */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-4 border border-white/5">
          <h3 className="font-display text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">24h Neural Trends</h3>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="energy" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="stress" stroke="#ff4444" strokeWidth={1} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Dock */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-3">
          <button onClick={handleLogMood} className="flex-1 glass-card p-3 flex flex-col items-center gap-2 hover:bg-primary/5 active:scale-95 transition-all">
            <SmilePlus size={20} className="text-primary" />
            <span className="text-[9px] font-bold uppercase text-muted-foreground">Log Mood</span>
          </button>
          
          <button onClick={handleAddWater} className="flex-1 glass-card p-3 flex flex-col items-center gap-2 hover:bg-blue-400/5 active:scale-95 transition-all">
            <Droplets size={20} className="text-blue-400" />
            <span className="text-[9px] font-bold uppercase text-muted-foreground">Add Water</span>
          </button>

          <button onClick={handleMeditate} className="flex-1 glass-card p-3 flex flex-col items-center gap-2 hover:bg-purple-400/5 active:scale-95 transition-all">
            <Moon size={20} className="text-purple-400" />
            <span className="text-[9px] font-bold uppercase text-muted-foreground">Meditate</span>
          </button>
        </motion.div>

        {/* Zen Task Modal */}
        <AnimatePresence>
          {showZenModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-lg"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }}
                className="glass-card-strong p-8 w-full max-w-xs text-center relative"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="text-primary" size={32} />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">Zen Moment</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  {activeZenTask}
                </p>
                <button 
                  onClick={() => setShowZenModal(false)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                  Done
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cycle Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h3 className="font-display text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3 text-left">Cycle Timeline</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {Array.from({ length: 28 }, (_, i) => {
              const day = i + 1;
              const isToday = day === store.cycleDay;
              const phase: CyclePhase = day <= 5 ? 'menstrual' : day <= 13 ? 'follicular' : day <= 16 ? 'ovulation' : 'luteal';
              return (
                <button
                  key={day}
                  onClick={() => store.setCycleDay(day)}
                  className={`flex-shrink-0 w-10 h-12 rounded-xl flex flex-col items-center justify-center text-xs transition-all ${
                    isToday ? 'bg-primary/20 text-primary ring-1 ring-primary/40 scale-110' : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  <span className="text-[10px]">{phaseEmoji(phase)}</span>
                  <span className="font-medium">{day}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CommandCenter;