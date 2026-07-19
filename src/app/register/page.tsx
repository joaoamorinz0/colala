'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppBrand, PublicLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CONTROL_HEIGHT, LIST_STACK } from '@/constants/design';
import { cn } from '@/lib/utils';
import { useSupabase } from '@/providers';
import { signUpWithEmail } from '@/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const { client, user } = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/admin');
    }
  }, [user, router]);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (!client) throw new Error('Supabase não configurado');
      await signUpWithEmail(client, email, password, `${window.location.origin}/admin`);
      setMessage('Cadastro realizado! Verifique seu e-mail ou complete a autenticação.');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col justify-center">
        <AppBrand className="mb-section" />

        <form className="space-y-stack-lg" onSubmit={handleRegister}>
          <h1 className="text-3xl font-bold">Criar conta</h1>
          <p className="text-muted-foreground">Crie sua conta para acessar o painel administrativo.</p>

          <div className={LIST_STACK}>
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
              <Input
                className={cn(CONTROL_HEIGHT, 'bg-card rounded-control px-card text-base')}
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <Button type="submit" className={cn(CONTROL_HEIGHT, 'rounded-control w-full text-base font-bold')} disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>

          <p className="text-muted-foreground mt-section text-center text-sm">
            Já tem conta?{' '}
            <Link className="text-primary font-bold" href="/login">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </PublicLayout>
  );
}
