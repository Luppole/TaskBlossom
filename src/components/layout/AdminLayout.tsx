
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavLink } from 'react-router-dom';

// List of admin emails - in production this should be stored in the database
const ADMIN_EMAILS = ['admin@example.com'];

const AdminLayout: React.FC = () => {
  const { user, loading } = useSupabase();
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p>Loading...</p>
      </div>
    );
  }
  
  // Check if user is authenticated and has admin email
  const isAdmin = user && ADMIN_EMAILS.includes(user.email as string);
  
  // If not admin, redirect to home
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access the admin area.
          </AlertDescription>
        </Alert>
        <Navigate to="/" replace />
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <NavLink to="/admin/achievements">
              {({ isActive }) => (
                <TabsTrigger 
                  value="achievements" 
                  className={isActive ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                >
                  Achievements
                </TabsTrigger>
              )}
            </NavLink>
            <NavLink to="/admin/badges">
              {({ isActive }) => (
                <TabsTrigger 
                  value="badges" 
                  className={isActive ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                >
                  Badges
                </TabsTrigger>
              )}
            </NavLink>
            <NavLink to="/admin/users">
              {({ isActive }) => (
                <TabsTrigger 
                  value="users" 
                  className={isActive ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                >
                  Users
                </TabsTrigger>
              )}
            </NavLink>
          </TabsList>
        </Tabs>
      </header>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
