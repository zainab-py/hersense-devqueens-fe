import Layout from '@/components/Layout';
import { useHerSenseStore, Mood } from '@/stores/useHerSenseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Music, Sparkles, Loader2, Play, Pause, Volume2, Heart, Quote } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { useToast } from '@/hooks/use-toast';
import * as THREE from 'three';

// 💎 Smooth 3D Breathing Sphere Component
const BreathingSphere = ({ targetScale }: { targetScale: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale * 1.5, targetScale * 1.5, targetScale * 1.5), 0.05);
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial color="hsl(var(--primary))" speed={3} distort={0.4} radius={1} opacity={0.6} transparent />
      </Sphere>
    </Float>
  );
};

// 💌 Deep Motivation/Reframing Content
const PERSPECTIVES: Record<string, { title: string, text: string }> = {
  anxious: {
    title: "Why am I on edge?",
    text: "Your body isn't failing you; it's protecting you. This sensitivity is a biological superpower meant to keep you alert. Today, your only job is to tell your nervous system: 'We are safe.'"
  },
  sad: {
    title: "Why do I feel so low?",
    text: "Low estrogen isn't a flaw; it's a clearing. Like a forest after rain, your mind is shedding what it no longer needs to carry. Let the tears fall—they are literally washing away stress hormones."
  },
  tired: {
    title: "Why am I so unproductive?",
    text: "You are not a machine; you are a garden. You cannot bloom in every season. This 'slowness' is your body building the energy it needs for your next peak. Rest is the work today."
  },
  energetic: {
    title: "I feel unstoppable!",
    text: "This is your biological 'Glow' phase. Your brain and heart are in perfect sync. Use this fire to build, to speak, and to remind yourself that you are capable of anything."
  },
  calm: {
    title: "Finding the center.",
    text: "In this stillness, you are hearing your body clearly. This harmony is your natural state. Anchor this feeling in your memory so you can find your way back during the storms."
  },
  grateful: {
    title: "The Body is a Miracle.",
    text: "Think of the millions of processes happening right now just to keep you breathing. You are a living, breathing masterpiece of evolution. You are exactly where you need to be."
  }
};

const Sanctuary = () => {
  const store = useHerSenseStore();
  const { toast } = useToast();
  const [breathePhase, setBreathePhase] = useState('Inhale');
  const [targetScale, setTargetScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [vibeTitle, setVibeTitle] = useState("Awaiting Mood...");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timer: any;
    const cycle = () => {
      setBreathePhase('Inhale'); setTargetScale(1.5);
      timer = setTimeout(() => {
        setBreathePhase('Hold');
        timer = setTimeout(() => {
          setBreathePhase('Exhale'); setTargetScale(1.0);
          timer = setTimeout(cycle, 2500);
        }, 2000);
      }, 2000);
    };
    cycle();
    return () => clearTimeout(timer);
  }, []);

  const handleMoodSelect = (mood: string) => {
    const selectedMood = mood.toLowerCase();
    store.setMood(selectedMood as Mood);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const newAudio = new Audio(`/music/${selectedMood}.mp3`);
    newAudio.loop = true;
    newAudio.play().then(() => {
      setIsPlaying(true);
      audioRef.current = newAudio;
    }).catch(() => setIsPlaying(false));

    const moodVibes: Record<string, string> = {
      anxious: "Cortisol-Calm Protocol",
      tired: "Dopamine-Rise Energy",
      sad: "Serotonin-Boost Brightness",
      energetic: "Bio-Focus Harmony",
      calm: "Deep Zen Connection",
      happy: "Oxytocin Glow Mode"
    };
    setVibeTitle(moodVibes[selectedMood]);
    
    toast({ 
      title: "Bio-Frequency Synced", 
      description: `Transitioning to ${selectedMood} harmony.` 
    });
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <Layout>
      <div className="px-4 pt-6 pb-20 max-w-lg mx-auto space-y-6 text-center">
        <h1 className="font-display text-xl font-bold">Sanctuary</h1>

        {/* 3D Visualizer */}
        <div className="h-64 w-full relative glass-card overflow-hidden bg-primary/5">
          <Suspense fallback={<Loader2 className="animate-spin text-primary" />}>
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <BreathingSphere targetScale={targetScale} />
            </Canvas>
          </Suspense>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <motion.p key={breathePhase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-display font-bold tracking-[0.2em] uppercase text-primary">
              {breathePhase}
            </motion.p>
          </div>
        </div>

        {/* Mood Grid */}
        <div className="glass-card p-4 grid grid-cols-3 gap-2">
          {['Anxious', 'Tired', 'Sad', 'Calm', 'Happy', 'Energetic'].map((m) => (
            <button 
              key={m} 
              onClick={() => handleMoodSelect(m)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                store.mood === m.toLowerCase() ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'bg-secondary/30 border-transparent'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-tight">{m}</span>
            </button>
          ))}
        </div>

        {/* Audio Player UI */}
        <div className="glass-card-strong p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
             <div className={`p-2.5 rounded-full bg-primary/10 ${isPlaying ? 'animate-pulse' : ''}`}>
                <Volume2 size={18} className="text-primary" />
             </div>
             <div>
                <p className="text-[10px] uppercase tracking-tighter text-primary font-bold">{vibeTitle}</p>
                <p className="text-xs font-medium text-foreground/70">Neural frequency matching</p>
             </div>
          </div>
          <button onClick={toggleMusic} className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </button>
        </div>

        {/* ✨ NEW: Perspective Shift (The 'Why Me' Section) */}
        <AnimatePresence mode="wait">
          {store.mood && PERSPECTIVES[store.mood] && (
            <motion.div
              key={store.mood}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-left space-y-4 pt-4"
            >
              <div className="flex items-center gap-2 text-primary">
                <Heart size={16} fill="currentColor" className="opacity-70" />
                <h3 className="text-sm font-bold uppercase tracking-wider">{PERSPECTIVES[store.mood].title}</h3>
              </div>
              
              <div className="relative glass-card p-6 border-l-4 border-primary/50">
                <Quote className="absolute -top-2 -left-2 text-primary/20" size={32} />
                <p className="text-sm leading-relaxed text-foreground/80 italic">
                  {PERSPECTIVES[store.mood].text}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-primary/60 font-bold uppercase tracking-widest">
                  <Sparkles size={10} />
                  <span>You are more than your hormones</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Sanctuary;