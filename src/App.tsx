
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
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
import { HelmetProvider } from "react-helmet-async";
import "./i18n/i18n"; // Import i18n configuration

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

// Separate component to use useLocation hook
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Map routes to their titles and descriptions
  const pageMeta = {
    "/": { 
      title: "TaskBlossom | Today",
      description: "Stay organized with TaskBlossom's daily task manager. Plan your day and boost productivity."
    },
    "/calendar": { 
      title: "TaskBlossom | Calendar",
      description: "View and manage your tasks in a calendar view. Plan ahead and stay on schedule."
    },
    "/tasks": { 
      title: "TaskBlossom | Tasks", 
      description: "Manage all your tasks in one place. Create, organize, and complete tasks efficiently."
    },
    "/categories": { 
      title: "TaskBlossom | Categories",
      description: "Organize tasks by categories. Create custom categories for better task management."
    },
    "/settings": { 
      title: "TaskBlossom | Settings",
      description: "Customize your TaskBlossom experience. Set preferences and manage your account."
    },
    "/fitness": { 
      title: "TaskBlossom | Fitness",
      description: "Track your fitness goals and workouts. Stay healthy and motivated."
    },
    "/social": { 
      title: "TaskBlossom | Social",
      description: "Connect with friends and share your productivity journey."
    },
  };
  
  // Get meta for the current path or use default
  const currentMeta = pageMeta[location.pathname as keyof typeof pageMeta] || {
    title: "TaskBlossom | Personal Task Manager",
    description: "Boost your productivity with TaskBlossom. A beautiful and intuitive task management app."
  };
  
  return (
    <>
      <Helmet>
        <title>{currentMeta.title}</title>
        <meta name="description" content={currentMeta.description} />
        <meta property="og:title" content={currentMeta.title} />
        <meta property="og:description" content={currentMeta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TaskBlossom" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentMeta.title} />
        <meta name="twitter:description" content={currentMeta.description} />
      </Helmet>
      
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
    </>
  );
};

// New App component that properly orders the providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <FirebaseProvider>
            <ThemeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppShell>
                  <AnimatedRoutes />
                </AppShell>
              </TooltipProvider>
            </ThemeProvider>
          </FirebaseProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
