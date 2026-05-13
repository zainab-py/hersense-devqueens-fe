import { useHerSenseStore, Mood } from '@/stores/useHerSenseStore';
import { motion } from 'framer-motion';

const MOODS: { emoji: string; label: string; value: Mood }[] = [
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '⚡', label: 'Energetic', value: 'energetic' },
  { emoji: '😤', label: 'Irritable', value: 'irritable' },
];

const QUICK_SYMPTOMS = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Back Pain', 'Mood Swings'];

const DailyBioLog = () => {
  const store = useHerSenseStore();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 space-y-4">
      <h3 className="font-display text-sm font-semibold text-foreground">Daily Bio-Log</h3>

      {/* Stress 1-10 */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Stress</span><span>{Math.round(store.stress / 10)}/10</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <button key={i} onClick={() => store.setStress((i + 1) * 10)}
              className={`flex-1 h-6 rounded-md transition-all text-[10px] ${
                store.stress >= (i + 1) * 10 ? 'bg-primary/60 text-primary-foreground' : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Energy 1-10 */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Energy</span><span>{Math.round(store.energy / 10)}/10</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <button key={i} onClick={() => store.setEnergy((i + 1) * 10)}
              className={`flex-1 h-6 rounded-md transition-all text-[10px] ${
                store.energy >= (i + 1) * 10 ? 'bg-primary/60 text-primary-foreground' : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Emojis */}
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Mood</p>
        <div className="flex gap-1.5">
          {MOODS.map(m => (
            <button key={m.value} onClick={() => store.setMood(m.value)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all ${
                store.mood === m.value ? 'bg-primary/20 ring-1 ring-primary/30 scale-105' : 'bg-secondary/30 hover:bg-secondary/50'
              }`}>
              <span className="text-base">{m.emoji}</span>
              <span className="text-[9px] text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Symptoms */}
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Symptoms</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SYMPTOMS.map(s => (
            <button key={s} onClick={() => store.toggleSymptom(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                store.symptoms.includes(s) ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DailyBioLog;
