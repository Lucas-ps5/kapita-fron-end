import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, History, Users, Coins, CreditCard } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Accueil', icon: Wallet },
  { path: '/history', label: 'Historique', icon: History },
  { path: '/debts', label: 'Dettes', icon: Users },
  { path: '/tontines', label: 'Tontines', icon: Coins },
  { path: '/premium', label: 'Premium', icon: CreditCard },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card px-2 py-3 safe-area-bottom md:hidden">
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className={`text-xs ${active ? 'font-medium' : ''}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
