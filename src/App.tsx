import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useHerSenseStore } from "@/stores/useHerSenseStore";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Pages
import SplashScreen from "./pages/SplashScreen";
import AuthPage from "./pages/AuthPage";
import CommandCenter from "./pages/CommandCenter";
import InsightLab from "./pages/InsightLab";
import Sanctuary from "./pages/Sanctuary";
import ClinicalVault from "./pages/ClinicalVault";
import CareHub from "./pages/CareHub";
import VisionScanner from "./pages/VisionScanner";
import ProfilePage from "./pages/Profile"; // Make sure the file is exactly "pages/Profile.tsx"
import NotFound from "./pages/NotFound";

// Components
import AIChatbot from "./components/AIChatbot";

const queryClient = new QueryClient();

// Keep this for other pages
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useHerSenseStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAuthenticated = useHerSenseStore((s) => s.isAuthenticated);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} />
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><InsightLab /></ProtectedRoute>} />
          <Route path="/sanctuary" element={<ProtectedRoute><Sanctuary /></ProtectedRoute>} />
          <Route path="/clinical" element={<ProtectedRoute><ClinicalVault /></ProtectedRoute>} />
          <Route path="/care" element={<ProtectedRoute><CareHub /></ProtectedRoute>} />
          <Route path="/vision" element={<ProtectedRoute><VisionScanner /></ProtectedRoute>} />
          
          {/* Temporary Direct Route for Testing */}
          <Route path="/profile" element={<ProfilePage />} /> 
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {isAuthenticated && <AIChatbot />}
    </>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const login = useHerSenseStore((s) => s.login);
  const isAuthenticated = useHerSenseStore((s) => s.isAuthenticated);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && !isAuthenticated) {
        const name = session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User';
        login(name);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User';
        login(name);
      }
    });

    return () => subscription.unsubscribe();
  }, [isAuthenticated, login]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;