import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, History, Users, Coins, CreditCard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { path: '/dashboard', label: 'Accueil', icon: Wallet },
  { path: '/history', label: 'Historique', icon: History },
  { path: '/debts', label: 'Dettes', icon: Users },
  { path: '/tontines', label: 'Tontines', icon: Coins },
  { path: '/premium', label: 'Premium', icon: CreditCard },
  { path: '/settings', label: 'Paramètres', icon: Settings },
];

export default function DesktopSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-border bg-card h-screen sticky top-0">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Wallet className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-extrabold text-foreground">MONAYA</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-accent text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
