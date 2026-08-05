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
import { Bell, Lock, LogOut, MapPin, Share2, Star, User } from "lucide-react";
import { AuthLayout } from "@/components/layout";
import { ProfileMenuSection } from "@/components/profile/profile-menu-section";
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
  const { client, user } = useSupabase();
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
      router.push("/login");
    } catch {
      toast.show("Não foi possível sair da conta", "error");
    }
  };

  if (!client || !user || profileQuery.isLoading) {
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
      <div className={cn(SECTION_STACK, "max-w-3xl")}>
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
          <div className={cn(CARD_SURFACE, "space-y-stack-lg p-card")}>
            <div className="gap-stack-md grid md:grid-cols-2">
              <label className="space-y-stack-xs block">
                <span className="text-foreground text-sm font-semibold">
                  Nome
                </span>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </label>
              <label className="space-y-stack-xs block">
                <span className="text-foreground text-sm font-semibold">
                  Username
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
                rows={4}
              />
            </label>

            <fieldset className="space-y-stack-sm">
              <legend className="text-foreground text-sm font-semibold">
                Avatar
              </legend>
              <div className="gap-stack-md grid md:grid-cols-[1fr_auto]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="file:bg-primary file:text-primary-foreground file:rounded-control file:border-none file:px-3 file:py-2"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!avatarFile || uploadAvatarMutation.isPending}
                  onClick={handleUploadAvatar}
                >
                  {uploadAvatarMutation.isPending
                    ? "Enviando..."
                    : "Enviar avatar"}
                </Button>
              </div>
            </fieldset>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className={cn(CONTROL_HEIGHT, "w-full md:w-auto")}
              >
                {updateProfileMutation.isPending
                  ? "Salvando..."
                  : "Salvar perfil"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  CONTROL_HEIGHT,
                  "w-full border-red-200 text-red-600 hover:bg-red-50 md:w-auto",
                )}
                onClick={handleSignOut}
              >
                <LogOut className="size-5" />
                Sair da conta
              </Button>
            </div>
          </div>
        </form>

        <ProfileMenuSection
          items={[
            { icon: User, label: "Editar perfil" },
            { icon: Bell, label: "Notificações" },
            { icon: Lock, label: "Privacidade" },
          ]}
          title="Conta"
        />

        <ProfileMenuSection
          items={[
            { icon: MapPin, label: "Minha localização" },
            { icon: Star, label: "Minhas avaliações" },
            { icon: Share2, label: "Compartilhar Colalá" },
          ]}
          title="Preferências"
        />
      </div>
    </AuthLayout>
  );
}
