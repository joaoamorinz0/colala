"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { AuthLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useToast } from "@/components/ui/toast";
import {
  CARD_SURFACE,
  CONTROL_HEIGHT,
  LIST_STACK,
  SECTION_STACK,
} from "@/constants/design";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import {
  createProfile,
  fetchProfile,
  updateProfile,
  uploadProfileAvatar,
  updateUserMetadata,
} from "@/services/profile.service";
import { signOut } from "@/services/auth.service";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { client, user, isLoading: authLoading } = useSupabase();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!client || !user) {
        throw new Error("Supabase não configurado");
      }

      const foundProfile = await fetchProfile(client, user.id);

      if (foundProfile) {
        return foundProfile;
      }

      const defaultName =
        user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null;
      const defaultUsername = user.email?.split("@")[0] ?? null;
      const createdProfile = await createProfile(client, user.id, {
        name: defaultName,
        username: defaultUsername,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      });

      return createdProfile;
    },
    enabled: Boolean(client && user),
    staleTime: 1000 * 60,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!client || !user) {
        throw new Error("Supabase não configurado");
      }

      await updateProfile(client, user.id, {
        name: name || null,
        username: username || null,
      });

      if (bio !== user.user_metadata?.bio) {
        await updateUserMetadata(client, { bio: bio || null });
      }
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }
      toast.show("Perfil atualizado com sucesso", "success");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar perfil";
      toast.show(message, "error");
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!client || !user) {
        throw new Error("Supabase não configurado");
      }

      const avatarUrl = await uploadProfileAvatar(client, file);
      await updateProfile(client, user.id, { avatar_url: avatarUrl });
      return avatarUrl;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.show("Avatar atualizado com sucesso", "success");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Erro ao enviar avatar";
      toast.show(message, "error");
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name ?? "");
      setUsername(profileQuery.data.username ?? "");
    }
  }, [profileQuery.data]);

  useEffect(() => {
    setBio(user?.user_metadata?.bio ?? "");
  }, [user?.user_metadata?.bio]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(avatarFile);
  }, [avatarFile]);

  const profile = profileQuery.data;
  const avatarUrl = avatarPreview ?? profile?.avatar_url ?? null;
  const initials = useMemo(() => {
    const displayName = profile?.name ?? user?.email?.split("@")[0] ?? "";
    return displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [profile?.name, user?.email]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await updateProfileMutation.mutateAsync();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    await uploadAvatarMutation.mutateAsync(avatarFile);
  };

  const handleSignOut = async () => {
    if (!client) return;

    try {
      await signOut(client);
      router.replace("/");
    } catch {
      toast.show("Não foi possível sair da conta", "error");
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  if (!client || authLoading || !user || profileQuery.isLoading) {
    return (
      <AuthLayout>
        <div className={SECTION_STACK}>
          <SkeletonCard className="mx-auto max-w-3xl" lines={6} />
        </div>
      </AuthLayout>
    );
  }

  if (profileQuery.isError) {
    const errorMessage =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : "Erro ao carregar perfil.";

    return (
      <AuthLayout>
        <div className={SECTION_STACK}>
          <div className="rounded-card-lg p-card border border-red-200 bg-red-50 text-red-700">
            {errorMessage}
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className={cn(SECTION_STACK, "max-w-4xl")}>
        {/* Header com Avatar e Informações Básicas */}
        <header className="text-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile?.name ?? "Avatar"}
              className="border-primary mx-auto size-24 rounded-full border-[3px] object-cover"
            />
          ) : (
            <div className="border-primary bg-primary/10 text-primary mx-auto flex size-24 items-center justify-center rounded-full border-[3px] text-3xl font-bold">
              {initials}
            </div>
          )}
          <h1 className="text-foreground mt-stack-md text-2xl font-extrabold tracking-tight">
            {profile?.name ?? user.email}
          </h1>
          <p className="text-muted-foreground mt-1 text-base">{user.email}</p>
        </header>

        <form className={LIST_STACK} onSubmit={handleSave}>
          {/* Seção: Editar Perfil */}
          <section className={cn(CARD_SURFACE, "space-y-stack-lg p-card")}>
            <div>
              <h2 className="text-foreground text-lg font-bold tracking-tight">
                Editar Perfil
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Atualize suas informações pessoais
              </p>
            </div>

            <div className="gap-stack-md grid md:grid-cols-2">
              <label className="space-y-stack-xs block">
                <span className="text-foreground text-sm font-semibold">
                  Nome Completo
                </span>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </label>
              <label className="space-y-stack-xs block">
                <span className="text-foreground text-sm font-semibold">
                  Usuário
                </span>
                <Input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="username"
                  required
                />
              </label>
            </div>

            <label className="space-y-stack-xs block">
              <span className="text-foreground text-sm font-semibold">Bio</span>
              <textarea
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-control w-full border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Conte algo sobre você"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={3}
              />
            </label>

            <div className="gap-stack-md flex md:justify-end">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className={cn(CONTROL_HEIGHT, "w-full md:w-auto")}
              >
                {updateProfileMutation.isPending
                  ? "Salvando..."
                  : "Salvar Perfil"}
              </Button>
            </div>
          </section>

          {/* Seção: Foto de Perfil */}
          <section className={cn(CARD_SURFACE, "space-y-stack-lg p-card")}>
            <div>
              <h2 className="text-foreground text-lg font-bold tracking-tight">
                Foto de Perfil
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Escolha uma imagem para seu avatar
              </p>
            </div>

            <fieldset className="space-y-stack-md">
              <div className="gap-stack-md grid md:grid-cols-2">
                <div>
                  <label className="space-y-stack-xs block">
                    <span className="text-foreground text-sm font-semibold">
                      Selecionar imagem
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="file:bg-primary file:text-primary-foreground file:rounded-control text-sm file:border-none file:px-3 file:py-2"
                    />
                  </label>
                  {avatarPreview && (
                    <div className="mt-stack-sm">
                      <p className="text-muted-foreground text-xs font-semibold">
                        Pré-visualização:
                      </p>
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="mt-1 size-16 rounded-md object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    disabled={!avatarFile || uploadAvatarMutation.isPending}
                    onClick={handleUploadAvatar}
                    className={cn(CONTROL_HEIGHT, "w-full")}
                  >
                    {uploadAvatarMutation.isPending
                      ? "Enviando..."
                      : "Enviar Foto"}
                  </Button>
                </div>
              </div>
            </fieldset>
          </section>

          {/* Seção: Conta */}
          <section className={cn(CARD_SURFACE, "space-y-stack-lg p-card")}>
            <div>
              <h2 className="text-foreground text-lg font-bold tracking-tight">
                Conta
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Gerencie sua conta e segurança
              </p>
            </div>

            <div className="gap-stack-md flex flex-col">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  CONTROL_HEIGHT,
                  "w-full justify-start border-red-200 text-red-600 hover:bg-red-50",
                )}
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 size-5" />
                Sair da Conta
              </Button>
            </div>
          </section>
        </form>
      </div>
    </AuthLayout>
  );
}
