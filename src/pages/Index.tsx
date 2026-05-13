import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHerSenseStore } from '@/stores/useHerSenseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const navigate = useNavigate();
  const { login } = useHerSenseStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    let animId: number;

    const particles: { x: number; y: number; vx: number; vy: number; s: number; a: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        s: 1 + Math.random() * 2,
        a: 0.2 + Math.random() * 0.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;
        ctx.beginPath();
        ctx.fillStyle = `rgba(220,80,140,${p.a})`;
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  const handleLogin = () => {
    if (!name.trim()) return;
    setTransitioning(true);
    setTimeout(() => {
      login(name.trim());
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Portal zoom effect */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 50, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeIn' }}
            className="absolute z-20 w-12 h-12 rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent)' }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: transitioning ? 0 : 1, y: transitioning ? -20 : 0, scale: transitioning ? 0.9 : 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 glass-card-strong p-8 w-full max-w-sm mx-4"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-flex mb-4"
          >
            <Sparkles className="text-primary" size={32} />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-foreground glow-text mb-2">HerSense</h1>
          <p className="text-muted-foreground text-sm">Bio-Intelligence Operating System</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your name..."
              className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 glow-border"
          >
            Enter HerSense
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
