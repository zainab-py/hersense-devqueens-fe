import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import { useHerSenseStore, phaseLabel } from '@/stores/useHerSenseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Leaf, Search, Shield, ShieldAlert, Zap, Sparkles, Loader2, Activity, Apple, FlaskConical, Beaker, AlertTriangle, Pill, Stethoscope, ChevronRight, ShieldCheck, CloudSun, Droplets, ThermometerSnowflake, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const INGREDIENTS_DB: Record<string, { risk: 'safe' | 'caution' | 'high-risk'; note: string }> = {
  retinol: { risk: 'high-risk', note: 'Skin barrier is thinnest now. Avoid to prevent chemical burns.' },
  'salicylic acid': { risk: 'caution', note: 'BHA can be too drying when estrogen is low.' },
  niacinamide: { risk: 'safe', note: 'Safe in all phases. Strengthens barrier.' },
  vitamin_c: { risk: 'safe', note: 'Best used now to boost collagen.' },
  hyaluronic: { risk: 'safe', note: 'Ideal for all phases. Essential for hydration.' },
};

const CareHub = () => {
  const store = useHerSenseStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<'intelligence' | 'pathology' | 'safety'>('intelligence');
  const [backendData, setBackendData] = useState<any>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [dynamicFix, setDynamicFix] = useState<any>(null);
  const [clinicalRisk, setClinicalRisk] = useState<any>(null);
  const [skincareProtocol, setSkincareProtocol] = useState<any>(null);
  const [searchIngredient, setSearchIngredient] = useState('');
  const [loading, setLoading] = useState(true);

  // 🌍 Climate Simulator State (0 = Arctic, 100 = Equator)
  const [climateValue, setClimateValue] = useState(50);

  const fetchBioData = async () => {
    // Map slider 0-100 to realistic weather variables
    const simulatedTemp = Math.floor(10 + (climateValue * 0.3)); // 10°C to 40°C
    const simulatedHumidity = climateValue; // 0% to 100%
    const simulatedUV = (climateValue / 10).toFixed(1); // 0.0 to 10.0

    try {
      const [baseRes, riskRes, skinRes] = await Promise.all([
        fetch(`http://localhost:8000/engine/care-hub?phase=${store.cyclePhase}`),
        fetch(`http://localhost:8000/engine/care-hub/clinical-prediction`),
        fetch(`http://localhost:8000/engine/care-hub/skincare-protocol?phase=${store.cyclePhase}&temp=${simulatedTemp}&uv=${simulatedUV}&humidity=${simulatedHumidity}`)
      ]);
      
      if (baseRes.ok) setBackendData(await baseRes.json());
      if (riskRes.ok) setClinicalRisk(await riskRes.json());
      if (skinRes.ok) setSkincareProtocol(await skinRes.json());
    } catch (e) {
      console.error("Backend offline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBioData();
  }, [store.cyclePhase, climateValue]); // Re-fetch when slider moves!

  const handleSymptomClick = async (symptom: string) => {
    setSelectedSymptom(symptom);
    try {
      const res = await fetch(`http://localhost:8000/engine/care-hub/symptom-fix?phase=${store.cyclePhase}&symptom=${symptom.toLowerCase()}`);
      if (res.ok) setDynamicFix(await res.json());
    } catch (e) {
      toast({ variant: "destructive", title: "Connection Error" });
    }
  };

  const ingredientResult = searchIngredient.trim() ? INGREDIENTS_DB[searchIngredient.toLowerCase().trim()] : null;

  return (
    <Layout>
      <PageTransition>
        <div className="px-4 pt-6 pb-24 max-w-md mx-auto space-y-6 text-left">
          
          <header className="flex justify-between items-start">
            <div className="space-y-1 text-left">
              <h1 className="font-display text-2xl font-black tracking-tight text-foreground">Care Hub</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest italic">
                  {phaseLabel(store.cyclePhase)} Engine Active
                </p>
              </div>
            </div>
            <div className="glass-card px-3 py-1.5 border-primary/20 bg-primary/5 rounded-xl">
               <span className="text-[9px] font-black text-primary uppercase tracking-tighter">AI-Managed</span>
            </div>
          </header>

          <div className="flex gap-1 p-1 bg-secondary/20 backdrop-blur-md rounded-2xl border border-white/5">
            {[{ key: 'intelligence', label: 'Lifestyle', icon: Sparkles },
              { key: 'pathology', label: 'Diagnosis', icon: FlaskConical },
              { key: 'safety', label: 'Safety', icon: Shield }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all ${tab === t.key ? 'bg-background shadow-lg text-primary border border-white/5' : 'text-muted-foreground'}`}>
                <t.icon size={16} className="mb-1" />
                <span className="text-[8px] font-black uppercase tracking-tighter">{t.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {loading && !skincareProtocol ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="text-primary animate-spin" size={32} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syncing Bio-Data...</p>
              </div>
            ) : (
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {tab === 'intelligence' && (
                  <div className="space-y-6">
                    
                    {/* 🌍 CLIMATE SIMULATOR SLIDER */}
                    <section className="glass-card p-5 border-white/5 bg-secondary/10 rounded-[24px]">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <CloudSun size={14} className="text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Climate Simulator</h3>
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase italic">
                          {climateValue < 30 ? '❄️ Arctic' : climateValue < 70 ? '🌤️ Moderate' : '🔥 Equator'}
                        </span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={climateValue} 
                        onChange={(e) => setClimateValue(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary mb-2"
                      />
                      <div className="flex justify-between px-1">
                        <ThermometerSnowflake size={12} className="text-blue-400" />
                        <Sun size={12} className="text-orange-400" />
                      </div>
                    </section>

                    {/* 🌤️ SUNSCREEN GUARDIAN */}
                    <motion.section className="glass-card-strong p-6 border-white/5 bg-[#12131A] rounded-[32px] overflow-hidden relative shadow-2xl">
                      <div className="absolute -right-4 -top-4 h-24 w-24 bg-yellow-500/10 blur-3xl" />
                      <div className="flex justify-between items-start mb-6 relative z-10 text-left">
                        <div>
                          <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1 italic">Prescribed for {skincareProtocol?.temp || "32°C"}</p>
                          <h2 className="text-3xl font-black text-white">{skincareProtocol?.temp || "32°C"}</h2>
                        </div>
                        <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">UV: {skincareProtocol?.uv_index || "7.2"}</span>
                        </div>
                      </div>
                      <div className="p-5 rounded-3xl border border-primary/20 bg-primary/5 text-left relative z-10">
                        <p className="text-sm font-bold text-foreground italic">{skincareProtocol?.spf_required || "SPF 50"} Required ✨</p>
                      </div>
                    </motion.section>

                    {/* 🧴 3-STEP ROUTINE */}
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-left ml-1">Today's Routine</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { label: 'Step 1: Cleanse', value: skincareProtocol?.cleanser || 'Gentle Wash', icon: Droplets },
                          { label: 'Step 2: Treat', value: skincareProtocol?.serum || 'Vitamin C Serum', icon: Zap },
                          { label: 'Step 3: Seal', value: skincareProtocol?.moisturizer || 'Gel Cream', icon: Beaker }
                        ].map((step, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-2xl border border-white/5 text-left">
                            <div className="p-3 bg-background rounded-xl border border-white/10"><step.icon size={18} className="text-muted-foreground" /></div>
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{step.label}</p>
                              <p className="text-xs font-bold text-foreground">{step.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-left">
                        <p className="text-[9px] text-primary font-black uppercase mb-1 tracking-tighter italic">AI Insights</p>
                        <p className="text-[11px] text-foreground/90 leading-relaxed italic">"{skincareProtocol?.special_note || "Loading profile..."}"</p>
                      </div>
                    </section>

                    <section className="space-y-3 text-left">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Symptom Fixer</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Cramps', 'Brain Fog', 'Bloating', 'Low Energy'].map(s => (
                          <button key={s} onClick={() => handleSymptomClick(s)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${selectedSymptom === s ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-secondary/40 text-muted-foreground border-white/5'}`}>{s}</button>
                        ))}
                      </div>
                    </section>

                    <AnimatePresence mode="wait">
                      {dynamicFix && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 gap-3">
                          <div className="glass-card p-4 border-l-4 border-primary bg-primary/5 text-left">
                              <p className="text-[9px] font-black uppercase text-primary mb-1">Desi Approach</p>
                              <p className="text-xs font-medium italic text-foreground/90 leading-relaxed">"{dynamicFix.desi}"</p>
                          </div>
                          <div className="glass-card p-4 border-l-4 border-blue-400 bg-blue-400/5 text-left">
                              <p className="text-[9px] font-black uppercase text-blue-400 mb-1">Western Approach</p>
                              <p className="text-xs font-medium italic text-foreground/90 leading-relaxed">"{dynamicFix.western}"</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="glass-card p-5 space-y-3 border-l-4 border-orange-400 bg-orange-400/5 transition-all text-left">
                        <div className="flex items-center gap-2"><Apple size={16} className="text-orange-400" /><h3 className="text-[10px] font-black uppercase text-orange-400 tracking-widest">Nutritional Strategy</h3></div>
                        <p className="text-xs text-foreground/80 leading-relaxed italic">{backendData?.diet || "Optimization in progress..."}</p>
                    </div>
                  </div>
                )}

                {/* 🩺 DIAGNOSIS & MANAGEMENT TAB */}
                {tab === 'pathology' && (
                  <div className="space-y-5 text-left">
                    <div className="glass-card-strong p-5 border-t-4 border-purple-500 bg-gradient-to-br from-purple-500/10 to-transparent">
                      <div className="flex justify-between items-center mb-4 text-left">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-purple-400">Clinical Pattern</h3>
                        <span className="text-[8px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-tighter">AI Scanned</span>
                      </div>
                      <div className="p-4 bg-background/60 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Status</p>
                        <p className="text-sm font-black text-purple-300">{clinicalRisk?.condition || "Stability Detected"}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed italic pt-2 border-t border-white/5 mt-2 text-left">
                          "{clinicalRisk?.insight || "No chronic markers found in recent logs."}"
                        </p>
                      </div>
                    </div>
                    {clinicalRisk?.condition?.includes("Risk") && (
                      <div className="grid grid-cols-1 gap-3">
                         <div className="glass-card p-4 border-l-4 border-emerald-500 bg-emerald-500/5 text-left">
                            <p className="text-[9px] font-black uppercase text-emerald-400 mb-1">Medical Action</p>
                            <p className="text-xs italic">{clinicalRisk.med_note}</p>
                         </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 🛡️ SAFETY SEARCH TAB */}
                {tab === 'safety' && (
                  <div className="space-y-4 text-left">
                    <div className="glass-card p-5 space-y-5 border border-white/5">
                      <div className="flex items-center gap-2 mb-2"><Beaker size={16} className="text-primary" /><h3 className="text-[10px] font-black uppercase tracking-widest">Phase-Safe Actives</h3></div>
                      <div className="relative">
                        <input type="text" value={searchIngredient} onChange={e => setSearchIngredient(e.target.value)} placeholder="Search: Retinol, BHA..." 
                          className="w-full bg-secondary/40 border border-white/10 rounded-2xl px-4 py-4 text-sm outline-none placeholder:text-muted-foreground/50" />
                        <Search className="absolute right-4 top-4 text-muted-foreground/60" size={18} />
                      </div>
                      {ingredientResult && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-2xl border ${ingredientResult.risk === 'high-risk' ? 'bg-red-500/10 border-red-500/20' : 'bg-primary/10 border-primary/20'}`}>
                          <p className="text-[11px] italic font-medium">{ingredientResult.note}</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default CareHub;