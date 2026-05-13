import { ReactNode } from 'react';
import { useHerSenseStore, phaseThemeClass } from '@/stores/useHerSenseStore';
import { Home, FlaskConical, Leaf, FileBarChart, Heart, Eye, User } from 'lucide-react'; // ✅ Added User icon
import NavItem from '@/components/NavItem';
import SOSButton from '@/components/SOSButton';
import { motion } from 'framer-motion';

const Layout = ({ children }: { children: ReactNode }) => {
  const { cyclePhase } = useHerSenseStore();

  return (
    <div className={`min-h-screen flex flex-col ${phaseThemeClass(cyclePhase)}`}>
      <main className="flex-1 pb-20 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card-strong border-t border-border/30 rounded-none">
        <div className="flex justify-around items-center py-1 max-w-md mx-auto">
          <NavItem to="/dashboard" icon={Home} label="Core" />
          <NavItem to="/insights" icon={FlaskConical} label="Insights" />
          <NavItem to="/care" icon={Heart} label="Care" />
          <NavItem to="/vision" icon={Eye} label="Vision" />
          <NavItem to="/sanctuary" icon={Leaf} label="Zen" />
          <NavItem to="/clinical" icon={FileBarChart} label="Clinical" />
          <NavItem to="/profile" icon={User} label="Profile" /> {/* ✅ Added Profile NavItem */}
        </div>
      </nav>

      <SOSButton />
    </div>
  );
};

export default Layout;