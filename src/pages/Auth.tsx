import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Wallet } from 'lucide-react';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, name);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Vérifiez votre email pour confirmer votre inscription !');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error('Email ou mot de passe incorrect');
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <Wallet className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">MONAYA</h1>
        <p className="text-muted-foreground">Ton argent, simplifié.</p>
      </div>

      <Card className="w-full max-w-sm border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">{isSignUp ? 'Créer un compte' : 'Se connecter'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Commence à suivre tes finances' : 'Accède à ton tableau de bord'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  placeholder="Ton nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 text-base"
              />
            </div>
            <Button type="submit" className="h-14 w-full text-base font-semibold" disabled={submitting}>
              {submitting ? 'Chargement...' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
