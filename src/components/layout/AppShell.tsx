
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from '@/components/ui/sidebar';
import DesktopSidebar from './DesktopSidebar';
import MobileNavbar from './MobileNavbar';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {!isMobile && <DesktopSidebar />}
        
        <main className="flex-1 flex flex-col min-h-screen">
          <div className="flex-1 container pt-6 pb-16 md:py-8 px-4 md:px-8">
            {children}
          </div>
          
          {isMobile && <MobileNavbar />}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppShell;
