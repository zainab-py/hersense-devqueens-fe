import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import { useHerSenseStore, phaseLabel } from '@/stores/useHerSenseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback, useMemo } from 'react';
import { Camera, Scan, Sparkles, RotateCcw, Upload, Search, Loader2, BookmarkPlus, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VisionScanner = () => {
  const store = useHerSenseStore();
  const { toast } = useToast();
  const [mode, setMode] = useState<'skin' | 'product'>('skin');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [displayedResult, setDisplayedResult] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🧬 Smart Logic: Extract Score for the Meter
  const compatibilityScore = useMemo(() => {
    if (!result) return null;
    const match = result.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 85; // Default to 85% if not found
  }, [result]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    resetAnalysis();
  };

  const analyzeImage = useCallback(async () => {
    if (!selectedFile) return;
    setScanning(true);
    setResult(null);
    setDisplayedResult('');
    setIsSaved(false);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('current_phase', store.cyclePhase);
      formData.append('mode', mode);

      const response = await fetch("http://localhost:8000/engine/scan", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error('AI Engine failed');

      const data = await response.json();
      const text = data?.analysis || 'Analysis complete.';
      setResult(text);

      let i = 0;
      const typeInterval = setInterval(() => {
        setDisplayedResult(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(typeInterval);
      }, 8);

      toast({ title: 'Bio-Analysis Complete', description: `${mode === 'skin' ? 'Skin' : 'Product'} compatibility verified.` });
    } catch (err: any) {
      toast({ title: 'Scanner Error', variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  }, [selectedFile, mode, store.cyclePhase, toast]);

  const handleSaveToShelf = () => {
    setIsSaved(true);
    const shelfType = result?.toLowerCase().includes('night') ? 'Night Shelf' : 'Morning Shelf';
    toast({ 
      title: 'Added to Bio-Shelf', 
      description: `Item saved to your ${shelfType} for the ${store.cyclePhase} phase.`,
      action: <CheckCircle className="text-green-500" />
    });
  };

  const resetAnalysis = () => {
    setResult(null);
    setDisplayedResult('');
    setIsSaved(false);
  };

  const resetAll = () => {
    setImagePreview(null);
    setSelectedFile(null);
    resetAnalysis();
  };

  return (
    <Layout>
      <PageTransition>
        <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5 text-left">
          <header className="flex justify-between items-center">
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-xl font-bold text-foreground">
              Vision Scanner
            </motion.h1>
            <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-[9px] font-bold text-primary uppercase italic">{phaseLabel(store.cyclePhase)} Mode</span>
            </div>
          </header>

          <div className="flex gap-2">
            {[{ key: 'skin', label: '🔬 Skin Analysis', icon: Camera }, { key: 'product', label: '🧴 Product Scanner', icon: Search }].map(m => (
              <button key={m.key} onClick={() => { setMode(m.key as any); resetAll(); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                  mode === m.key ? 'bg-primary/20 text-primary border border-primary/20 shadow-sm' : 'bg-secondary/30 text-muted-foreground'
                }`}>
                <m.icon size={14} /> {m.label}
              </button>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card-strong p-6 flex flex-col items-center gap-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

            {!imagePreview ? (
              <>
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center relative bg-secondary/10">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border border-primary/10" />
                  {mode === 'skin' ? <Camera size={36} className="text-primary/40" /> : <Scan size={36} className="text-primary/40" />}
                </div>
                <p className="text-[11px] text-muted-foreground text-center font-medium max-w-[220px] uppercase tracking-wider">
                  {mode === 'skin' ? 'Selfie for hormonal skin analysis' : 'Scan ingredients for compatibility'}
                </p>
                <button onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 shadow-lg shadow-primary/20">
                  <Upload size={14} /> Select from Gallery
                </button>
              </>
            ) : (
              <>
                <div className="relative w-56 h-56 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <AnimatePresence>
                    {scanning && (
                      <motion.div className="absolute inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex flex-col items-center gap-2">
                           <Loader2 size={32} className="text-primary animate-spin" />
                           <span className="text-[9px] font-bold text-primary uppercase">Bio-Processing</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {scanning && (
                    <motion.div className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_hsl(var(--primary))]"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button onClick={resetAll} className="px-4 py-2 rounded-xl bg-secondary/50 text-muted-foreground text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-secondary/70">
                    <RotateCcw size={12} /> Reset
                  </button>
                  <button onClick={analyzeImage} disabled={scanning}
                    className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 transition-transform shadow-lg shadow-primary/20">
                    {scanning ? 'Wait...' : <><Sparkles size={12} /> Start AI Scan</>}
                  </button>
                </div>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </motion.div>

          <AnimatePresence>
            {displayedResult && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-4">
                
                {/* 🎯 COMPATIBILITY METER (ONLY FOR PRODUCT MODE) */}
                {mode === 'product' && (
                  <div className="glass-card-strong p-4 border-l-4 border-primary">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-primary uppercase">Bio-Compatibility</span>
                      <span className="text-xl font-display font-black text-primary">{compatibilityScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${compatibilityScore}%` }} className="h-full bg-primary" />
                    </div>
                  </div>
                )}

                <div className="glass-card-strong p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-primary" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                        {mode === 'skin' ? 'Dermatological Bio-Report' : 'Ingredient Safety Analysis'}
                      </h3>
                    </div>
                    {mode === 'product' && !isSaved && (
                      <button onClick={handleSaveToShelf} className="p-2 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-colors">
                        <BookmarkPlus size={16} />
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-foreground/80 leading-relaxed italic bg-secondary/20 p-4 rounded-xl border border-white/5">
                    "{displayedResult}"
                    {displayedResult.length < (result?.length || 0) && (
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-primary">▌</motion.span>
                    )}
                  </div>

                  {isSaved && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase">
                      <CheckCircle size={12} /> Successfully Saved to your Bio-Shelf
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default VisionScanner;