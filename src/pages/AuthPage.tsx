import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Mail, Lock, User, Calendar, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CONDITIONS = ['PCOS', 'PCOD', 'Endometriosis', 'Anemia', 'Thyroid', 'PMDD', 'Fibroids', 'Adenomyosis', 'None'];

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState(0); // 0=creds, 1=profile (signup only)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [conditions, setConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const toggleCondition = (c: string) => {
    if (c === 'None') { setConditions(['None']); return; }
    setConditions(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev.filter(x => x !== 'None'), c]
    );
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      setTransitioning(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  };

  const handleSignup = async () => {
    if (step === 0) {
      if (!email || !password || !name) {
        toast({ title: 'Please fill all fields', variant: 'destructive' });
        return;
      }
      setStep(1);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: name,
          last_period_date: lastPeriodDate,
          cycle_length: parseInt(cycleLength),
          period_length: parseInt(periodLength),
          conditions,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Signup failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome to HerSense!', description: 'Check your email to verify your account.' });
      setTransitioning(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

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
        animate={{ opacity: transitioning ? 0 : 1, y: transitioning ? -20 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 glass-card-strong p-8 w-full max-w-sm mx-4"
      >
        <div className="text-center mb-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="inline-flex mb-3">
            <Sparkles className="text-primary" size={28} />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-foreground glow-text mb-1">HerSense</h1>
          <p className="text-muted-foreground text-xs">Bio-Intelligence Operating System</p>
        </div>

        {/* Mode toggle */}
        <div className="flex mb-5 bg-secondary/30 rounded-xl p-1">
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setStep(0); }}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${mode === m ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3.5 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3.5 text-muted-foreground" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Password" className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <button onClick={handleLogin} disabled={loading || !email || !password}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 glow-border flex items-center justify-center gap-2">
                {loading ? 'Signing in...' : <><span>Enter HerSense</span><ArrowRight size={16} /></>}
              </button>
            </motion.div>
          ) : (
            <motion.div key={`signup-${step}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {step === 0 ? (
                <div className="space-y-3">
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-3.5 text-muted-foreground" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3.5 text-muted-foreground" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3.5 text-muted-foreground" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <button onClick={handleSignup} disabled={!email || !password || !name}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 glow-border flex items-center justify-center gap-2">
                    <span>Next: Health Profile</span><ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button onClick={() => setStep(0)} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                    <ArrowLeft size={12} /> Back
                  </button>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar size={12} /> Last Period Date</label>
                    <input type="date" value={lastPeriodDate} onChange={e => setLastPeriodDate(e.target.value)}
                      className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Cycle Length</label>
                      <select value={cycleLength} onChange={e => setCycleLength(e.target.value)}
                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                        {Array.from({ length: 20 }, (_, i) => i + 21).map(d => <option key={d} value={d}>{d} days</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Period Length</label>
                      <select value={periodLength} onChange={e => setPeriodLength(e.target.value)}
                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                        {Array.from({ length: 8 }, (_, i) => i + 2).map(d => <option key={d} value={d}>{d} days</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Stethoscope size={12} /> Health Conditions</label>
                    <div className="flex flex-wrap gap-2">
                      {CONDITIONS.map(c => (
                        <button key={c} onClick={() => toggleCondition(c)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            conditions.includes(c) ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
                          }`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleSignup} disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 glow-border">
                    {loading ? 'Creating account...' : 'Launch HerSense ✨'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;
