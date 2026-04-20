import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, LogOut, Save } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('FCFA');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: profile } = await supabase.from('profiles').select('name').eq('user_id', user.id).maybeSingle();
      const { data: prefs } = await supabase.from('user_preferences').select('currency').eq('user_id', user.id).maybeSingle();
      if (profile) setName(profile.name);
      if (prefs) setCurrency(prefs.currency);
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({ name }).eq('user_id', user.id);
    await supabase.from('user_preferences').update({ currency }).eq('user_id', user.id);
    toast.success('Paramètres sauvegardés');
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <header className="flex items-center gap-3 px-5 pt-6 pb-4 md:px-8">
        <button onClick={() => navigate('/dashboard')} className="rounded-full p-2 hover:bg-muted transition-colors md:hidden">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground md:text-xl">Paramètres</h1>
      </header>

      <div className="flex-1 px-5 space-y-5 md:px-8 md:max-w-lg">
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 text-base" />
            </div>
            <div className="space-y-2">
              <Label>Devise</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-12 text-base" />
            </div>
            <Button className="h-14 w-full text-base font-semibold gap-2" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Enregistrement...' : 'Sauvegarder'}
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="h-14 w-full text-base font-semibold gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 md:hidden"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </Button>
      </div>
    </AppLayout>
  );
}
