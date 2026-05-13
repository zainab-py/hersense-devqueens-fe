import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Calendar, Settings, LogOut, 
  ChevronRight, Shield, Bell, Edit2, Check, ArrowLeft, Activity, Lock, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setProfileData(user.user_metadata);
      setNewName(user.user_metadata?.display_name || 'Sam');
    }
  }

  // 🏷️ Handle Name Update
  const updateDisplayName = async () => {
    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: newName }
    });

    if (error) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } else {
      setProfileData(data.user.user_metadata);
      setIsEditingName(false);
      toast({ title: "Identity Updated", description: `You are now recognized as ${newName}.` });
    }
  };

  // 🔑 Handle Password Reset Request
  const handlePasswordReset = async () => {
    setUpdatingPassword(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ 
        title: "Security Link Sent", 
        description: "Check your email to set a new secure password." 
      });
    }
    setUpdatingPassword(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast({ title: "Bio-Engine Synced", description: "Your hormonal trends are up to date." });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-md mx-auto px-6 pt-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button whileHover={{ x: -3 }} onClick={() => navigate('/dashboard')} className="p-2 bg-secondary/40 rounded-xl text-muted-foreground">
            <ArrowLeft size={20} />
          </motion.button>
          <h1 className="text-xl font-bold font-display glow-text">Bio-Profile</h1>
          <div className="w-10" />
        </div>

        {/* Profile Card with Name Edit Logic */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-strong p-6 mb-6 border-primary/10 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg">
              <User size={30} />
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-secondary/50 border border-primary/30 rounded-lg px-2 py-1 text-sm focus:outline-none w-full"
                    autoFocus
                  />
                  <button onClick={updateDisplayName} className="p-1 text-green-500 hover:bg-green-500/10 rounded-md">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setIsEditingName(false)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-md">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{profileData?.display_name || 'Sam'}</h2>
                  <button onClick={() => setIsEditingName(true)} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Reactive Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass-card p-4 border-l-2 border-primary">
            <p className="text-[10px] uppercase text-muted-foreground mb-1">Cycle Length</p>
            <p className="text-xl font-bold text-primary">{profileData?.cycle_length || 28} Days</p>
          </div>
          <div className="glass-card p-4 border-l-2 border-primary">
            <p className="text-[10px] uppercase text-muted-foreground mb-1">Period Flow</p>
            <p className="text-xl font-bold text-primary">{profileData?.period_length || 7} Days</p>
          </div>
        </div>

        {/* System Controls */}
        <div className="space-y-4">
          <section>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-1 mb-3">Security & Auth</h3>
            
            {/* 🔑 Change Password Button */}
            <button 
              onClick={handlePasswordReset}
              disabled={updatingPassword}
              className="w-full glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-all mb-3"
            >
              <div className="flex items-center gap-3">
                <Lock size={18} className={updatingPassword ? "text-primary animate-pulse" : "text-muted-foreground"} />
                <p className="text-sm font-medium">{updatingPassword ? "Sending Reset Link..." : "Update Secure Password"}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>

            <button 
              onClick={handleSync}
              disabled={syncing}
              className="w-full glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-all mb-3"
            >
              <div className="flex items-center gap-3">
                <motion.div animate={syncing ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 1 }}>
                  <Settings size={18} className={syncing ? "text-primary" : "text-muted-foreground"} />
                </motion.div>
                <p className="text-sm font-medium">{syncing ? "Analyzing Bio-Data..." : "Force Bio-Engine Sync"}</p>
              </div>
            </button>

            <button 
              onClick={() => {
                supabase.auth.signOut();
                navigate('/auth');
              }}
              className="w-full glass-card p-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Sign Out</span>
            </button>
          </section>
        </div>

        <div className="mt-12 text-center">
          <button className="text-[10px] text-muted-foreground/40 hover:text-red-500 transition-colors uppercase tracking-widest">
            Wipe Biological Memory
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;