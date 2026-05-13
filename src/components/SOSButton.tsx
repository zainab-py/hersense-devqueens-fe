import { useHerSenseStore } from '@/stores/useHerSenseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Wind, Phone, X, ShieldAlert, Send, MapPin, Loader2, Stethoscope, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const SOSButton = () => {
  const { sosActive, setSosActive } = useHerSenseStore();

  return (
    <>
      <button
        onClick={() => setSosActive(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-destructive flex items-center justify-center animate-sos-pulse hover:scale-110 transition-transform shadow-xl shadow-destructive/40"
        aria-label="SOS"
      >
        <span className="text-white font-display font-bold text-sm tracking-tighter">SOS</span>
      </button>

      <AnimatePresence>
        {sosActive && <SOSOverlay onClose={() => setSosActive(false)} />}
      </AnimatePresence>
    </>
  );
};

const SOSOverlay = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
  const store = useHerSenseStore();
  const [activeView, setActiveView] = useState<'main' | 'breathing' | 'cramps' | 'doctors'>('main');
  const [breathePhase, setBreathePhase] = useState<'in' | 'hold' | 'out'>('in');
  const [count, setCount] = useState(4);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🫁 Breathing Logic
  useEffect(() => {
    if (activeView !== 'breathing') return;
    const phases: Array<{ phase: 'in' | 'hold' | 'out'; duration: number }> = [
      { phase: 'in', duration: 4 }, { phase: 'hold', duration: 4 }, { phase: 'out', duration: 4 }
    ];
    let idx = 0;
    let c = phases[0].duration;
    
    const interval = setInterval(() => {
      c--;
      if (c <= 0) {
        idx = (idx + 1) % phases.length;
        c = phases[idx].duration;
        setBreathePhase(phases[idx].phase);
      }
      setCount(c);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeView]);

  // 📧 Mock Email Emergency Alert
  const handleEmergencyAlert = async () => {
    const email = "syed.fakru06@gmail.com";
    const subject = encodeURIComponent("🚨 EMERGENCY: HerSense SOS Alert");
    const body = encodeURIComponent(
      `URGENT: This is an automated emergency signal from HerSense.\n\n` +
      `User: ${store.userName || 'Sam'}\n` +
      `Current Biological Phase: ${store.cyclePhase.toUpperCase()}\n` +
      `Last Known Location: [Banjara Hills, Hyderabad]\n\n` +
      `The user has triggered a distress signal. Please check in immediately.`
    );

    toast({ title: "Establishing Connection...", description: "Opening secure emergency email channel." });

    // ✨ Mock Email Deep Link
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      await fetch('http://localhost:8000/engine/sos/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_name: "Fakruddin Syed", location: "Banjara Hills, Hyd" })
      });
    } catch (e) {
      console.log("Email intent triggered locally.");
    }
  };

  // 🏥 Fetch Doctors
  const handleFetchDoctors = async () => {
    setActiveView('doctors');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/engine/sos/doctors');
      const data = await res.json();
      setDoctors(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-3xl">
      
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="glass-card-strong max-w-sm w-full p-6 text-center relative border-red-500/20 shadow-2xl shadow-red-500/10"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-white p-2">
          <X size={20} />
        </button>

        <div className="flex items-center justify-center gap-2 mb-6 text-red-500">
          <ShieldAlert size={24} className="animate-pulse" />
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">SOS Protocol</h2>
        </div>

        <AnimatePresence mode="wait">
          {/* 🔘 MAIN VIEW */}
          {activeView === 'main' && (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <button onClick={handleEmergencyAlert} className="w-full p-5 glass-card-strong border-red-500/40 bg-red-500/10 flex items-center gap-4 active:scale-95 transition-all">
                <div className="p-3 bg-red-500 rounded-xl text-white"><Mail size={20}/></div>
                <div className="text-left">
                  <p className="font-bold text-sm">Alert Contact</p>
                  <p className="text-[10px] uppercase text-red-400 font-bold">Fakruddin Syed</p>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setActiveView('breathing')} className="p-4 glass-card flex flex-col items-center gap-2 hover:bg-blue-400/5 transition-colors">
                  <Wind size={20} className="text-blue-400" />
                  <span className="text-[10px] font-bold uppercase">Breath</span>
                </button>
                <button onClick={() => setActiveView('cramps')} className="p-4 glass-card flex flex-col items-center gap-2 hover:bg-orange-400/5 transition-colors">
                  <Heart size={20} className="text-orange-400" />
                  <span className="text-[10px] font-bold uppercase">Cramps</span>
                </button>
              </div>

              <button onClick={handleFetchDoctors} className="w-full p-4 glass-card flex items-center justify-center gap-3 border-primary/20">
                <Stethoscope size={20} className="text-primary" />
                <span className="text-xs font-bold uppercase">Nearby Help</span>
              </button>
            </motion.div>
          )}

          {/* 🫁 BREATHING VIEW */}
          {activeView === 'breathing' && (
            <motion.div key="breath" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
              <motion.div 
                animate={{ scale: breathePhase === 'in' ? 1.4 : breathePhase === 'hold' ? 1.4 : 1 }}
                className="w-24 h-24 rounded-full border-4 border-blue-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(96,165,250,0.3)]"
              >
                <span className="text-3xl font-bold text-blue-400">{count}</span>
              </motion.div>
              <p className="text-lg font-bold uppercase tracking-widest text-blue-400 mb-8">{breathePhase}...</p>
              <button onClick={() => setActiveView('main')} className="text-[10px] font-bold uppercase text-muted-foreground underline">Back</button>
            </motion.div>
          )}

          {/* 🏥 DOCTORS VIEW */}
          {activeView === 'doctors' && (
            <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {loading ? <Loader2 size={24} className="animate-spin text-primary mx-auto py-10" /> : doctors.map((doc, i) => (
                <div key={i} className="glass-card p-3 text-left border-primary/10">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-bold">{doc.name}</p>
                    <span className="text-[8px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full font-bold uppercase">{doc.status}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                    <MapPin size={10} /> {doc.distance}
                  </div>
                  <a href={`tel:${doc.contact}`} className="w-full py-2 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-2">
                    <Phone size={12} /> Call Clinic
                  </a>
                </div>
              ))}
              <button onClick={() => setActiveView('main')} className="text-[10px] font-bold uppercase text-muted-foreground py-2">Back to Menu</button>
            </motion.div>
          )}

          {/* 💊 CRAMP CARE VIEW */}
          {activeView === 'cramps' && (
            <motion.div key="cramp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-left space-y-4">
              <h3 className="font-bold text-orange-400 uppercase text-sm tracking-tighter text-center">Physical Relief</h3>
              <div className="glass-card p-4 space-y-3">
                <p className="text-[11px] leading-relaxed italic text-foreground/80">• Sip warm water with a pinch of Ginger or Ajwain.</p>
                <p className="text-[11px] leading-relaxed italic text-foreground/80">• Apply heat pack to lower abdomen for 15 mins.</p>
                <p className="text-[11px] leading-relaxed italic text-foreground/80">• Try 'Child's Pose' yoga to relax pelvic nerves.</p>
              </div>
              <button onClick={() => setActiveView('main')} className="w-full py-3 text-[10px] font-bold uppercase text-muted-foreground">Back</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SOSButton;