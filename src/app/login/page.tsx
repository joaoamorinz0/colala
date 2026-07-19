'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { AppBrand, PublicLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CONTROL_HEIGHT, LIST_STACK } from '@/constants/design';
import { cn } from '@/lib/utils';
import { useSupabase } from '@/providers';
import { signInWithEmail, signInWithGoogle } from '@/services/auth.service';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.35 11.1H12v2.8h5.05c-.22 1.2-1.05 2.2-2.24 2.86v2.38h3.62c2.12-1.95 3.34-4.82 3.34-8.48 0-.58-.05-1.14-.14-1.68z" fill="#4285F4" />
      <path d="M12 22c2.43 0 4.47-.8 5.96-2.17l-3.62-2.38c-.99.66-2.25 1.05-3.82 1.05-2.94 0-5.43-1.99-6.32-4.67H1.96v2.93C3.46 19.87 7.47 22 12 22z" fill="#34A853" />
      <path d="M5.68 13.83a7.2 7.2 0 0 1 0-3.66V7.24H1.96a10.99 10.99 0 0 0 0 9.52l3.72-2.93z" fill="#FBBC05" />
      <path d="M12 4.6c1.32 0 2.5.45 3.43 1.34l2.57-2.57C16.44 2.12 14.4 1.2 12 1.2 7.47 1.2 3.46 3.33 1.96 7.24l3.72 2.93C6.57 6.59 9.06 4.6 12 4.6z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { client, user } = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/admin');
    }
  }, [user, router]);

  const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!client) throw new Error('Supabase não configurado');
      await signInWithEmail(client, email, password);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!client) throw new Error('Supabase não configurado');
      await signInWithGoogle(client, `${window.location.origin}/admin`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no login com Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col justify-center">
        <AppBrand className="mb-section" />

        <div className={LIST_STACK}>
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className={cn(
              CONTROL_HEIGHT,
              'border-border bg-card text-foreground hover:bg-muted rounded-control w-full border text-base font-bold shadow-none',
            )}
            variant="outline"
            disabled={loading}
          >
            <GoogleIcon />
            Continuar com Google
          </Button>
        </div>

        <div className="text-muted-foreground my-section gap-stack-md flex items-center text-sm">
          <div className="bg-border h-px flex-1" />
          <span>ou continue com e-mail</span>
          <div className="bg-border h-px flex-1" />
        </div>

        <form className="space-y-stack-lg" onSubmit={handleEmailSignIn}>
          <label className="space-y-stack-xs block">
            <span className="text-foreground text-sm font-semibold">E-mail</span>
            <Input
              className={cn(CONTROL_HEIGHT, 'bg-card rounded-control px-card text-base')}
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
            />
          </label>

          <label className="space-y-stack-xs block">
            <span className="text-foreground text-sm font-semibold">Senha</span>
            <div className="relative">
              <Input
                className={cn(CONTROL_HEIGHT, 'bg-card rounded-control px-card pr-12 text-base')}
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <Eye className="text-muted-foreground absolute top-1/2 right-4 size-5 -translate-y-1/2" />
            </div>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="text-right">
            <Link className="text-primary text-sm font-semibold" href="/login">
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            type="submit"
            className={cn(CONTROL_HEIGHT, 'rounded-control w-full text-base font-bold')}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-muted-foreground mt-section text-center text-sm">
          Não tem conta?{' '}
          <Link className="text-primary font-bold" href="/register">
            Criar conta
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}
