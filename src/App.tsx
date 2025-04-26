
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import AppShell from "./components/layout/AppShell";
import PageTransition from "./components/common/PageTransition";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./i18n/i18n"; // Import i18n configuration

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><div className="px-4 sm:px-6 md:px-8"><Index /></div></PageTransition>} />
        <Route path="/calendar" element={<PageTransition><div className="px-4 sm:px-6 md:px-8"><Calendar /></div></PageTransition>} />
        <Route path="/tasks" element={<PageTransition><div className="px-4 sm:px-6 md:px-8"><Tasks /></div></PageTransition>} />
        <Route path="/categories" element={<PageTransition><div className="px-4 sm:px-6 md:px-8"><Categories /></div></PageTransition>} />
        <Route path="/settings" element={<PageTransition><div className="px-4 sm:px-6 md:px-8"><Settings /></div></PageTransition>} />
        <Route path="/fitness" element={<PageTransition><div className="px-4 sm:px-6 md:px-8"><Fitness /></div></PageTransition>} />
        <Route path="/social" element={<PageTransition><div className="px-4 sm:px-6 md:px-8"><Social /></div></PageTransition>} />
        <Route path="/profile/:userId" element={<PageTransition><div className="px-4 sm:px-6 md:px-8"><Profile /></div></PageTransition>} />
        <Route path="*" element={<PageTransition><div className="px-4 sm:px-6 md:px-8"><NotFound /></div></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppShell>
              <AnimatedRoutes />
            </AppShell>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </FirebaseProvider>
  </QueryClientProvider>
);

export default App;
