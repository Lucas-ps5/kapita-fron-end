import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import DesktopSidebar from './DesktopSidebar';

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export default function AppLayout({ children, hideNav }: AppLayoutProps) {
  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />
      <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
