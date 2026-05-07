import BottomNav from "@/components/BottomNav";
import DesktopSidebar from "@/components/DesktopSidebar";
import { Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout() {
  const { authenticated, loading, userInfo } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />
      <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
