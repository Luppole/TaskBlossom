
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Fitness from "./pages/Fitness";
import Social from "./pages/Social";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppShell from "./components/layout/AppShell";
import PageTransition from "./components/common/PageTransition";
import { SupabaseProvider, useSupabase } from "./contexts/SupabaseContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FirebaseProvider } from "./contexts/FirebaseContext"; // We keep this for now for backward compatibility
import "./i18n/i18n";
import ParticleBackground from "./components/common/ParticleBackground";
import Achievements from "./pages/Achievements";
import AdminLayout from "./components/layout/AdminLayout";
import AdminAchievements from "./pages/admin/AdminAchievements";
import AdminBadges from "./pages/admin/AdminBadges";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useSupabase();
  
  if (loading) {
    return null;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        
        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute><AppShell><div className="px-4 sm:px-6 md:px-8"><Index /></div></AppShell></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><AppShell><div className="px-4 sm:px-6 md:px-8"><Calendar /></div></AppShell></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><AppShell><div className="px-4 sm:px-6 md:px-8"><Tasks /></div></AppShell></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><AppShell><div className="px-4 sm:px-6 md:px-8"><Categories /></div></AppShell></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><AppShell><div className="px-4 sm:px-6 md:px-8"><Settings /></div></AppShell></PrivateRoute>} />
        <Route path="/fitness" element={<PrivateRoute><AppShell><div className="px-4 sm:px-6 md:px-8"><Fitness /></div></AppShell></PrivateRoute>} />
        <Route path="/social" element={<PrivateRoute><AppShell><div className="px-4 sm:px-6 md:px-8"><Social /></div></AppShell></PrivateRoute>} />
        <Route path="/achievements" element={<PrivateRoute><AppShell><div className="px-4 sm:px-6 md:px-8"><Achievements /></div></AppShell></PrivateRoute>} />
        <Route path="/profile/:userId" element={<PrivateRoute><AppShell><div className="px-4 sm:px-6 md:px-8"><Profile /></div></AppShell></PrivateRoute>} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/admin/achievements" replace />} />
          <Route path="achievements" element={<AdminAchievements />} />
          <Route path="badges" element={<AdminBadges />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
        
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SupabaseProvider>
          <FirebaseProvider>
            <ThemeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <ParticleBackground />
                <AnimatedRoutes />
              </TooltipProvider>
            </ThemeProvider>
          </FirebaseProvider>
        </SupabaseProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
