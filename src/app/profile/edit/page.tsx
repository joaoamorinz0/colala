"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, UploadCloud } from "lucide-react";
import { AuthLayout } from "@/components/layout";
import { CategoryChip } from "@/components/search/category-chip";
import { Button, Input, Switch } from "@/components/ui";
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
import { categoriesService } from "@/services/categories";
import {
  addProfileInterest,
  fetchProfileInterests,
  removeProfileInterest,
} from "@/services/profile-interests.service";
import {
  createProfile,
  fetchProfile,
  updateProfile,
  uploadProfileAvatar,
} from "@/services/profile.service";
import type { Category } from "@/types/category";

type ProfileEditPayload = Partial<{
  name: string | null;
  username: string | null;
  bio: string | null;
  city: string | null;
  show_city: boolean;
  show_instagram: boolean;
}>;

export default function ProfileEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { client, user, isLoading: authLoading } = useSupabase();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [showCity, setShowCity] = useState(true);
  const [showInstagram, setShowInstagram] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

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
        bio: null,
      });

      return createdProfile;
    },
    enabled: Boolean(client && user),
    staleTime: 1000 * 60,
  });

  const interestsQuery = useQuery({
    queryKey: ["profile-interests", user?.id],
    queryFn: async () => {
      if (!client || !user) {
        throw new Error("Supabase não configurado");
      }
      return fetchProfileInterests(client, user.id);
    },
    enabled: Boolean(client && user),
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (!client) return;

    let cancelled = false;

    categoriesService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setCategories(data);
        }
      })
      .catch((error) => {
        console.error("[profile-edit] failed to load categories:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [client]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: ProfileEditPayload) => {
      if (!client || !user) {
        throw new Error("Supabase não configurado");
      }

      await updateProfile(client, user.id, payload);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }
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

      const avatarUrl = await uploadProfileAvatar(client, user.id, file); // ← passa user.id
      await updateProfile(client, user.id, { avatar_url: avatarUrl });
      return avatarUrl;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }
      setAvatarPreview(null);
      toast.show("Avatar atualizado com sucesso", "success");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Erro ao enviar avatar";
      toast.show(message, "error");
    },
  });

  const uploadCoverMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!client || !user) {
        throw new Error("Supabase não configurado");
      }

      // Mesmo padrão do avatar: bucket "avatars", path `${userId}/${timestamp}-${filename}`
      const coverUrl = await uploadProfileAvatar(client, user.id, file);
      await updateProfile(client, user.id, { cover_image: coverUrl });
      return coverUrl;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }
      setCoverFile(null);
      setCoverPreview(null);
      toast.show("Capa atualizada com sucesso", "success");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Erro ao enviar capa";
      toast.show(message, "error");
    },
  });

  const toggleInterestMutation = useMutation({
    mutationFn: async (params: { categoryId: string; select: boolean }) => {
      if (!client || !user) {
        throw new Error("Supabase não configurado");
      }

      if (params.select) {
        await addProfileInterest(client, user.id, params.categoryId);
      } else {
        await removeProfileInterest(client, user.id, params.categoryId);
      }
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["profile-interests", user.id],
        });
      }
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar interesses";
      toast.show(message, "error");
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name ?? "");
      setUsername(profileQuery.data.username ?? "");
      setBio(profileQuery.data.bio ?? "");
      setCity(profileQuery.data.city ?? "");
      setShowCity(profileQuery.data.show_city ?? true);
      setShowInstagram(profileQuery.data.show_instagram ?? true);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  const profile = profileQuery.data;
  const isSaving = updateProfileMutation.isPending;

  const selectedInterestIds = useMemo(
    () =>
      new Set(
        (interestsQuery.data ?? []).map((interest) => interest.category_id),
      ),
    [interestsQuery.data],
  );

  const handleSaveBasic = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await updateProfileMutation.mutateAsync({
      name: name || null,
      username: username || null,
      bio: bio || null,
    });

    toast.show("Perfil atualizado com sucesso", "success");
  };

  const handleSaveLocation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await updateProfileMutation.mutateAsync({ city: city || null });
    toast.show("Localização atualizada com sucesso", "success");
  };

  const handleToggleCity = async (checked: boolean) => {
    setShowCity(checked);
    await updateProfileMutation.mutateAsync({ show_city: checked });
    toast.show(
      checked ? "Cidade visível no perfil público" : "Cidade ocultada",
      "success",
    );
  };

  const handleToggleInstagram = async (checked: boolean) => {
    setShowInstagram(checked);
    await updateProfileMutation.mutateAsync({ show_instagram: checked });
    toast.show(
      checked ? "Instagram visível no perfil público" : "Instagram ocultado",
      "success",
    );
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveCover = async () => {
    if (!coverFile) return;

    await uploadCoverMutation.mutateAsync(coverFile);
  };

  const handleCancelCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  if (!client || authLoading || !user || profileQuery.isLoading) {
    return (
      <AuthLayout>
        <div className={SECTION_STACK}>
          <SkeletonCard className="mx-auto max-w-3xl" lines={6} />
        </div>
      </AuthLayout>
    );
  }

  if (!profile) {
    return (
      <AuthLayout>
        <div className={cn(SECTION_STACK, "max-w-4xl")}>
          <div className="rounded-card-lg p-card border border-red-200 bg-red-50 text-red-700">
            Não foi possível carregar o perfil.
          </div>
        </div>
      </AuthLayout>
    );
  }

  const avatarUrl = avatarPreview ?? profile.avatar_url ?? null;
  const displayCover = coverPreview ?? profile.cover_image ?? null;

  return (
    <AuthLayout>
      <div className={cn(SECTION_STACK, "max-w-4xl")}>
        {/* ── Voltar ao perfil ── */}
        <div>
          <Link
            href="/profile"
            className="hover:bg-muted inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-600 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Voltar ao perfil
          </Link>
        </div>

        {/* ── Seção: Foto de Capa ── */}
        <section className={cn(CARD_SURFACE, "space-y-stack-lg p-card")}>
          <div>
            <h2 className="text-foreground text-lg font-bold tracking-tight">
              Foto de Capa
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Personalize o banner do seu perfil
            </p>
          </div>

          <div className={LIST_STACK}>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
            <div className="bg-muted rounded-card-lg relative h-40 w-full overflow-hidden">
              {displayCover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayCover}
                  alt="Capa do perfil"
                  className="size-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                  Nenhuma capa definida
                </div>
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                aria-label="Alterar foto de capa"
                className="absolute inset-0 z-10 flex items-end bg-gradient-to-t from-black/40 to-transparent p-3"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  <ImagePlus className="size-4" />
                  Trocar capa
                </span>
              </button>
            </div>

            <div className="gap-stack-md flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-xs">
                {coverFile
                  ? "Pré-visualização pronta para salvar."
                  : "Toque no banner para escolher uma nova imagem."}
              </p>
              {coverFile ? (
                <div className="gap-stack-sm flex shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancelCover}
                    disabled={uploadCoverMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveCover}
                    disabled={uploadCoverMutation.isPending}
                    className={cn(CONTROL_HEIGHT, "shrink-0")}
                  >
                    {uploadCoverMutation.isPending
                      ? "Enviando..."
                      : "Salvar capa"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* ── Seção: Editar Perfil ── */}
        <section className={cn(CARD_SURFACE, "space-y-stack-lg p-card")}>
          <div>
            <h2 className="text-foreground text-lg font-bold tracking-tight">
              Editar Perfil
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Atualize suas informações pessoais e foto
            </p>
          </div>

          <form className={LIST_STACK} onSubmit={handleSaveBasic}>
            <div className="flex flex-col items-center">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="group relative"
                aria-label="Alterar foto de perfil"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Foto de perfil"
                    className="border-primary size-24 rounded-full border-[3px] object-cover"
                  />
                ) : (
                  <div className="border-primary bg-primary/10 text-primary flex size-24 items-center justify-center rounded-full border-[3px] text-3xl font-bold">
                    {name
                      ? name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "?"}
                  </div>
                )}
                <span className="bg-primary text-primary-foreground absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                  {uploadAvatarMutation.isPending ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <UploadCloud className="size-4" />
                  )}
                </span>
              </button>
              <p className="text-muted-foreground mt-2 text-xs">
                {uploadAvatarMutation.isPending
                  ? "Enviando foto..."
                  : "Toque no avatar para trocar a foto"}
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
                disabled={isSaving}
                className={cn(CONTROL_HEIGHT, "w-full md:w-auto")}
              >
                {isSaving ? "Salvando..." : "Salvar Perfil"}
              </Button>
            </div>
          </form>
        </section>

        {/* ── Seção: Localização ── */}
        <section className={cn(CARD_SURFACE, "space-y-stack-lg p-card")}>
          <div>
            <h2 className="text-foreground text-lg font-bold tracking-tight">
              Localização
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Informe sua cidade para aparecer no seu perfil público
            </p>
          </div>

          <form className={LIST_STACK} onSubmit={handleSaveLocation}>
            <label className="space-y-stack-xs block">
              <span className="text-foreground text-sm font-semibold">
                Cidade
              </span>
              <Input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Ex: João Pessoa"
              />
            </label>

            <div className="gap-stack-md flex md:justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className={cn(CONTROL_HEIGHT, "w-full md:w-auto")}
              >
                {isSaving ? "Salvando..." : "Salvar Cidade"}
              </Button>
            </div>
          </form>
        </section>

        {/* ── Seção: Privacidade ── */}
        <section className={cn(CARD_SURFACE, "space-y-stack-lg p-card")}>
          <div>
            <h2 className="text-foreground text-lg font-bold tracking-tight">
              Privacidade
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Controle o que é exibido no seu perfil público
            </p>
          </div>

          <div className="divide-border divide-y">
            <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-foreground text-sm font-semibold">
                  Mostrar cidade no perfil público
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Exibe sua cidade ao lado do seu nome
                </p>
              </div>
              <Switch
                checked={showCity}
                onCheckedChange={handleToggleCity}
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-foreground text-sm font-semibold">
                  Mostrar Instagram no perfil público
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Exibe o link para o seu perfil do Instagram
                </p>
              </div>
              <Switch
                checked={showInstagram}
                onCheckedChange={handleToggleInstagram}
                disabled={isSaving}
              />
            </div>
          </div>
        </section>

        {/* ── Seção: Você curte ── */}
        <section className={cn(CARD_SURFACE, "space-y-stack-lg p-card")}>
          <div>
            <h2 className="text-foreground text-lg font-bold tracking-tight">
              Você curte
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Escolha as categorias que combinam com você
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.length === 0
              ? Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={`interest-skeleton-${index}`}
                    className="bg-muted inline-flex h-10 w-24 animate-pulse rounded-full"
                  />
                ))
              : categories.map((category) => {
                  const categoryId = String(category.id);
                  const isSelected = selectedInterestIds.has(categoryId);

                  return (
                    <CategoryChip
                      key={categoryId}
                      active={isSelected}
                      disabled={toggleInterestMutation.isPending}
                      icon={
                        category.icon ? <span>{category.icon}</span> : undefined
                      }
                      onClick={() =>
                        toggleInterestMutation.mutate({
                          categoryId,
                          select: !isSelected,
                        })
                      }
                    >
                      {category.name}
                    </CategoryChip>
                  );
                })}
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
