import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import DailyBioLog from '@/components/DailyBioLog';
import { useHerSenseStore } from '@/stores/useHerSenseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';
import { Brain, History, CheckCircle2, Loader2, TrendingUp, Calendar, Sparkles, Heart, Copy, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SYMPTOMS = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Nausea', 'Back Pain', 'Mood Swings', 'Insomnia', 'Cravings', 'Acne'];

const InsightLab = () => {
  const store = useHerSenseStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<'log' | 'trends' | 'history'>('log');
  const [pastLogs, setPastLogs] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [forecast, setForecast] = useState<string>("");
  const [partnerMsg, setPartnerMsg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // 🔄 Fetch Real Analytics with Error Handling
  const fetchAnalytics = async () => {
    try {
      const phase = store.cyclePhase;
      
      const [histRes, trendRes, forecastRes, partnerRes] = await Promise.all([
        fetch('http://localhost:8000/engine/insight/history'),
        fetch('http://localhost:8000/engine/insight/trends'),
        fetch(`http://localhost:8000/engine/insight/forecast?phase=${phase}`),
        fetch(`http://localhost:8000/engine/insight/partner-sync?phase=${phase}`)
      ]);

      if (histRes.ok) {
        const data = await histRes.json();
        setPastLogs(Array.isArray(data) ? data.reverse() : []);
      }
      
      if (trendRes.ok) setAiInsight(await trendRes.json());
      if (forecastRes.ok) setForecast((await forecastRes.json()).forecast);
      if (partnerRes.ok) setPartnerMsg((await partnerRes.json()).message);

    } catch (e) {
      console.error("Bio-Engine link failed");
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [tab, store.cyclePhase]);

  const handleLogSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/engine/insight/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stress: store.stress,
          energy: store.energy,
          mood: store.mood || 'Neutral',
          symptoms: store.symptoms,
        }),
      });

      if (res.ok) {
        toast({ title: "Bio-Sync Success", description: "Metrics committed to clinical history." });
        setTab('history');
        fetchAnalytics();
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      window.open('http://localhost:8000/engine/generate-report', '_blank');
      toast({ title: "Report Generated", description: "Opening clinical PDF..." });
    } catch (e) {
      toast({ variant: "destructive", title: "Export Failed" });
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Message ready for your partner." });
  };

  return (
    <Layout>
      <PageTransition>
        <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5">
          <header className="flex justify-between items-end">
            <h1 className="font-display text-xl font-bold text-foreground">Insight Lab</h1>
            <button 
              onClick={handleDownloadReport}
              className="p-2 bg-secondary/50 rounded-lg text-muted-foreground hover:text-primary transition-colors"
            >
              <FileText size={18} />
            </button>
          </header>

          {/* Sub-tabs */}
          <div className="flex gap-2 p-1 bg-secondary/30 rounded-2xl">
            {[{ key: 'log', label: 'Log', icon: Calendar }, { key: 'trends', label: 'Trends', icon: TrendingUp }, { key: 'history', label: 'History', icon: History }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${tab === t.key ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'log' && (
              <motion.div key="log" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <DailyBioLog />
                <div className="glass-card p-4">
                  <h3 className="text-[10px] font-bold uppercase text-muted-foreground mb-3 tracking-widest text-left">Active Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS.map((s) => (
                      <button key={s} onClick={() => store.toggleSymptom(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${store.symptoms.includes(s) ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : 'bg-secondary/40 text-muted-foreground'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleLogSubmit} disabled={isSubmitting} className="w-full bg-primary py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Submit Daily Sync
                </button>
              </motion.div>
            )}

            {tab === 'trends' && (
              <motion.div key="trends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                
                {/* ☁️ HORMONAL WEATHER FORECAST */}
                <div className="glass-card-strong p-4 border-l-4 border-primary bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-primary" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">48h Hormonal Forecast</h3>
                  </div>
                  <p className="text-xs leading-relaxed italic text-foreground/90 text-left">
                    {forecast || "Analyzing biological trajectory..."}
                  </p>
                </div>

                <div className="glass-card-strong p-5 text-center">
                  <Brain className="mx-auto mb-3 text-primary animate-pulse" size={28} />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">AI Pattern Recognition</h3>
                  <p className="text-xs text-foreground/80 leading-relaxed italic">
                    "{aiInsight?.pattern || "Recording data to identify hormonal correlations..."}"
                  </p>
                </div>

                {/* 🤝 PARTNER SYNC */}
                <div className="glass-card p-4 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-left">
                      <Heart size={14} className="text-pink-500" /> Partner Sync
                    </h3>
                    <button onClick={() => copyToClipboard(partnerMsg)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                      <Copy size={14} className="text-primary" />
                    </button>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl">
                    <p className="text-[11px] leading-relaxed text-muted-foreground italic text-left">
                      "{partnerMsg || "Generating sync message..."}"
                    </p>
                  </div>
                </div>

                {/* 📊 CHART SECTION */}
                <div className="glass-card p-4 h-48">
                  {pastLogs.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={pastLogs.slice().reverse()}>
                        <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                        <Area type="monotone" dataKey="energy" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
                        <Line type="monotone" dataKey="stress" stroke="#ff4444" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[10px] uppercase text-muted-foreground">Insufficient data for charting</div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {pastLogs.length > 0 ? (
                  pastLogs.map((log, i) => (
                    <div key={i} className="glass-card p-4 flex justify-between items-center border-l-4 border-primary bg-primary/5">
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-primary uppercase">{log.timestamp}</p>
                        <p className="text-sm font-bold mt-1 capitalize">{log.mood} Mood</p>
                        <div className="flex gap-1 mt-1">
                          {log.symptoms?.map((s: string) => (
                            <span key={s} className="text-[8px] bg-secondary/50 px-1.5 py-0.5 rounded-md border border-white/5">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-red-400">Stress: {log.stress}</p>
                        <p className="text-[10px] font-bold text-green-400">Energy: {log.energy}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-50 uppercase text-[10px]">No bio-logs found</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default InsightLab;