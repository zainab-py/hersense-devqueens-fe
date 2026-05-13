import Layout from '@/components/Layout';
import { useHerSenseStore, phaseLabel } from '@/stores/useHerSenseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Brain, Download, Loader2, MapPin, Navigation, Phone, Hospital, Activity, ShieldAlert, FileText, Info, LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

const MOCK_DOCTORS = [
  { name: "Dr. Sarah Khan (OB-GYN)", distance: "0.8 km", contact: "+91 98480 22338", status: "Open Now", type: "Clinical" },
  { name: "Sultan-ul-Uloom Health Center", distance: "0.4 km", contact: "040-2328-0222", status: "Open 24/7", type: "Emergency" },
  { name: "Apollo Cradle Women's Hospital", distance: "3.5 km", contact: "1860-500-4424", status: "Emergency Ready", type: "Hospital" },
  { name: "Dr. Priya Reddy (Endocrinology)", distance: "5.2 km", contact: "+91 91234 56789", status: "Available", type: "Endocrine" },
  { name: "Metro Women's Specialist Clinic", distance: "6.1 km", contact: "040-6677-8899", status: "Closing Soon", type: "Specialist" }
];

const NeuralMap3D = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.2;
  });
  return (
    <Float speed={2}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#ff2d55" wireframe transparent opacity={0.3} emissive="#ff2d55" emissiveIntensity={0.5} />
      </mesh>
      <Sphere args={[0.06, 16, 16]} position={[1, 0.5, 1]}><meshBasicMaterial color="#00f2ff" /></Sphere>
      <Sphere args={[0.06, 16, 16]} position={[-0.8, -1, 0.5]}><meshBasicMaterial color="#00f2ff" /></Sphere>
    </Float>
  );
};

const ClinicalVault = () => {
  const store = useHerSenseStore();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>(MOCK_DOCTORS);

  useEffect(() => {
    fetch('http://localhost:8000/engine/sos/doctors')
      .then(res => res.json())
      .then(data => { if (data && data.length > 1) setDoctors(data); })
      .catch(() => console.log("Using Mock Data"));
  }, []);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("http://localhost:8000/engine/generate-report");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HerSense_Clinical_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      toast({ title: "Clinical Export Successful", description: "Physician-ready PDF generated." });
    } catch (error) {
      toast({ title: "Offline Preview", description: "Backend not detected.", variant: "destructive" });
    } finally { setIsDownloading(false); }
  };

  const handleNavigate = (name: string) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(name)}`, '_blank');
  };

  const radarData = [
    { metric: 'Energy', value: store.energy },
    { metric: 'Stress', value: store.stress },
    { metric: 'Hydration', value: store.hydration },
    { metric: 'Sleep', value: store.sleep * 10 }, 
  ];

  return (
    <Layout>
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6 text-left">
        {/* Header with Download Button */}
        <header className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-foreground">Clinical Vault</h1>
          <button 
            onClick={handleDownloadReport} 
            disabled={isDownloading}
            className="p-2.5 bg-primary/10 rounded-xl text-primary active:scale-90 transition-all border border-primary/20 shadow-lg shadow-primary/5"
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </button>
        </header>

        {/* --- SECTION 1: RADAR METRICS --- */}
        <section className="glass-card p-4 h-64 border border-white/5 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary blur-[80px]" />
           </div>
           <div className="relative z-10 h-full flex flex-col">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                <Activity size={12} className="text-primary" /> Neural Balance Radar
              </h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                   <RadarChart data={radarData}>
                     <PolarGrid stroke="rgba(255,255,255,0.08)" />
                     <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#aaa', fontWeight: 'bold' }} />
                     <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                   </RadarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </section>

        {/* --- SECTION 2: PHYSICIAN SUMMARY & INSIGHT --- */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="glass-card-strong p-4 border-l-4 border-primary bg-secondary/10">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Physician Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-background/40 rounded-xl p-3 border border-white/5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Current Phase</p>
                <p className="font-medium text-foreground">{phaseLabel(store.cyclePhase)}</p>
              </div>
              <div className="bg-background/40 rounded-xl p-3 border border-white/5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Alert Status</p>
                <p className="font-medium text-green-400">Stable</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex gap-3">
            <Brain size={20} className="text-primary shrink-0" />
            <div className="space-y-1 text-left">
              <h4 className="text-[10px] font-bold uppercase text-primary tracking-tight">AI Clinical Insight</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                "Biological variance detected. {store.stress > 50 ? 'Stress markers are elevated; consider clinical-grade relaxation.' : 'Overall autonomic stability is high for the ' + phaseLabel(store.cyclePhase) + ' phase.'}"
              </p>
            </div>
          </motion.div>
        </div>

        {/* --- SECTION 3: 3D SCANNER & DOCTOR LIST --- */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <LocateFixed size={14} className="text-primary" /> Neural Facility Scan
            </h3>
            <span className="text-[8px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold">GPS: ACTIVE</span>
          </div>

          <div className="relative h-48 rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 shadow-2xl">
            <Canvas camera={{ position: [0, 0, 4] }}><ambientLight intensity={0.5} /><NeuralMap3D /></Canvas>
            <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end pointer-events-none">
              <div className="text-left">
                <span className="text-[8px] font-black text-primary uppercase tracking-widest block">System Analysis</span>
                <p className="text-[10px] text-white/80 font-bold uppercase">{doctors.length} Hubs Found</p>
              </div>
              <MapPin size={18} className="text-primary animate-bounce" />
            </div>
          </div>

          <div className="space-y-3">
            {doctors.map((doc, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card-strong p-4 space-y-4 border border-white/5 hover:border-primary/20 transition-all text-left">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-md font-bold uppercase">{doc.type}</span>
                       <h4 className="text-sm font-bold text-foreground">{doc.name}</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium italic">
                      {doc.status} • {doc.distance} away
                    </p>
                  </div>
                  <Hospital size={14} className="text-primary/40" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.open(`tel:${doc.contact}`)} className="flex-1 py-2.5 bg-secondary/30 rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-2">
                    <Phone size={14} /> Call
                  </button>
                  <button onClick={() => handleNavigate(doc.name)} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    <Navigation size={14} /> Navigate
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex gap-3 text-left">
          <ShieldAlert className="text-red-500 shrink-0" size={18} />
          <p className="text-[9px] leading-relaxed text-muted-foreground italic">
            <strong>Emergency Protocol:</strong> Direct navigation does not notify authorities. Use SOS trigger for coordination.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ClinicalVault;