"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout, PageHeader, LoadingSpinner } from "@/components/admin";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  getAllCollaborators,
  createCollaborator,
  updateCollaborator,
  deleteCollaborator,
  uploadImage,
} from "@/services/admin.service";
import type { Collaborator } from "@/types/collaborator";
import { FONT_OPTIONS } from "@/lib/font-catalog";
import { Edit2, Trash2, Upload, X } from "lucide-react";

function toSafeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function toInstagramUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const handle = trimmed
    .replace(/^@/, "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/^instagram\.com\//i, "");
  if (!handle) return null;
  return `https://instagram.com/${handle}`;
}

const EMPTY_FORM = {
  nome: "",
  slug: "",
  instagram: "",
  instagram_url: "",
  website_url: "",
  avatar_url: "",
  logo_url: "",
  short_description: "",
  cor_primaria: "#0F2A33",
  cor_secundaria: "#D85A30",
  fonte: "",
  font_family: "inter",
  is_active: true,
};

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadCollaborators = async () => {
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");
      setCollaborators(await getAllCollaborators(client));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar colaboradores",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborators();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = event.target;
    const finalValue =
      type === "checkbox" ? (event.target as HTMLInputElement).checked : value;
    setDraft((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setDraft((prev) => ({ ...prev, avatar_url: "" }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setDraft((prev) => ({ ...prev, logo_url: "" }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");

      let avatarUrl = draft.avatar_url.trim() || null;
      let logoUrl = draft.logo_url.trim() || null;

      if (avatarFile) {
        setUploadingAvatar(true);
        avatarUrl = await uploadImage(client, avatarFile, "places");
      }

      if (logoFile) {
        setUploadingAvatar(true);
        logoUrl = await uploadImage(client, logoFile, "places");
      }

      const instagramHandle = draft.instagram.trim();
      const instagramUrl =
        draft.instagram_url.trim() || toInstagramUrl(instagramHandle) || null;
      const websiteUrl = draft.website_url.trim()
        ? toSafeUrl(draft.website_url)
        : null;

      const payload = {
        nome: draft.nome.trim(),
        name: draft.nome.trim(),
        slug:
          (draft.slug || draft.nome)
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || null,
        instagram: instagramHandle || null,
        instagram_url: instagramUrl,
        website_url: websiteUrl,
        avatar_url: avatarUrl,
        logo_url: logoUrl,
        short_description: draft.short_description.trim() || null,
        cor_primaria: draft.cor_primaria || "#0F2A33",
        cor_secundaria: draft.cor_secundaria || "#D85A30",
        fonte: draft.fonte.trim() || null,
        font_family: draft.font_family || "inter",
        is_active: draft.is_active,
      };

      if (!payload.nome) {
        throw new Error("Nome do colaborador é obrigatório.");
      }

      if (editingId) {
        const updated = await updateCollaborator(client, editingId, payload);
        setCollaborators((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)),
        );
      } else {
        const created = await createCollaborator(client, payload);
        setCollaborators((prev) => [created, ...prev]);
      }

      setDraft(EMPTY_FORM);
      setAvatarFile(null);
      setAvatarPreview(null);
      setLogoFile(null);
      setLogoPreview(null);
      setEditingId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar colaborador",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEdit = (collaborator: Collaborator) => {
    setEditingId(collaborator.id);
    setAvatarFile(null);
    setAvatarPreview(collaborator.avatar_url ?? null);
    setLogoFile(null);
    setLogoPreview(collaborator.logo_url ?? null);
    setDraft({
      nome: collaborator.nome,
      slug: collaborator.slug ?? "",
      instagram: collaborator.instagram ?? "",
      instagram_url: collaborator.instagram_url ?? "",
      website_url: collaborator.website_url ?? "",
      avatar_url: collaborator.avatar_url ?? "",
      logo_url: collaborator.logo_url ?? "",
      short_description: collaborator.short_description ?? "",
      cor_primaria: collaborator.cor_primaria || "#0F2A33",
      cor_secundaria: collaborator.cor_secundaria || "#D85A30",
      fonte: collaborator.fonte ?? "",
      font_family: collaborator.font_family || "inter",
      is_active: collaborator.is_active ?? true,
    });
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Remover o colaborador "${nome}"?`)) return;

    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");
      await deleteCollaborator(client, id);
      setCollaborators((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao remover colaborador",
      );
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Colaboradores"
        description="Gerencie curadoria e parceiros do catálogo"
        action={
          <Link
            href="/admin/events"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Voltar para eventos
          </Link>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-border bg-card mb-8 rounded-lg border p-6 shadow-sm"
      >
        <h2 className="text-foreground mb-4 text-lg font-bold">
          {editingId ? "Editar colaborador" : "Novo colaborador"}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-foreground block text-sm font-medium">
              Nome
            </label>
            <input
              name="nome"
              value={draft.nome}
              onChange={handleChange}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
              placeholder="Mapas de Afeto"
            />
          </div>

          <div>
            <label className="text-foreground block text-sm font-medium">
              Instagram (@handle)
            </label>
            <input
              name="instagram"
              value={draft.instagram}
              onChange={handleChange}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
              placeholder="@mapasdeafeto"
            />
          </div>

          <div>
            <label className="text-foreground block text-sm font-medium">
              Instagram URL
            </label>
            <input
              name="instagram_url"
              value={draft.instagram_url}
              onChange={handleChange}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
              placeholder="https://instagram.com/mapasdeafeto"
            />
          </div>

          <div>
            <label className="text-foreground block text-sm font-medium">
              Site
            </label>
            <input
              name="website_url"
              value={draft.website_url}
              onChange={handleChange}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
              placeholder="https://mapasdeafeto.com.br"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-foreground block text-sm font-medium">
              Descrição curta
            </label>
            <textarea
              name="short_description"
              value={draft.short_description}
              onChange={handleChange}
              rows={4}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
              placeholder="Curadoria editorial focada em experiências e encontros..."
            />
          </div>

          <div className="space-y-4 md:col-span-2">
            <div>
              <label className="text-foreground block text-sm font-medium">
                Avatar
              </label>

              {(avatarPreview || draft.avatar_url) && (
                <div className="relative mt-2 mb-4 inline-block">
                  <img
                    src={avatarPreview || draft.avatar_url || ""}
                    alt="Preview do avatar"
                    className="ring-border h-20 w-20 rounded-full object-cover ring-2"
                  />
                  <button
                    type="button"
                    onClick={clearAvatar}
                    className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 rounded-full p-1 transition-colors hover:opacity-90"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <label className="border-muted-foreground/25 hover:border-primary hover:bg-primary/5 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors">
                <Upload size={18} className="text-muted-foreground" />
                <span className="text-foreground text-sm font-medium">
                  {avatarFile ? avatarFile.name : "Clique para enviar o avatar"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <p className="text-muted-foreground mt-1 text-xs">
                PNG, JPG ou WEBP até 5MB.
              </p>
            </div>

            <div>
              <label className="text-foreground block text-sm font-medium">
                Logo opcional
              </label>

              {(logoPreview || draft.logo_url) && (
                <div className="relative mt-2 mb-4 inline-block">
                  <img
                    src={logoPreview || draft.logo_url || ""}
                    alt="Preview da logo"
                    className="ring-border h-16 max-w-[180px] rounded-lg bg-white object-contain p-2 ring-2"
                  />
                  <button
                    type="button"
                    onClick={clearLogo}
                    className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 rounded-full p-1 transition-colors hover:opacity-90"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <label className="border-muted-foreground/25 hover:border-primary hover:bg-primary/5 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors">
                <Upload size={18} className="text-muted-foreground" />
                <span className="text-foreground text-sm font-medium">
                  {logoFile ? logoFile.name : "Clique para enviar a logo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="text-foreground block text-sm font-medium">
              Cor primária
            </label>
            <input
              type="color"
              name="cor_primaria"
              value={draft.cor_primaria}
              onChange={handleChange}
              className="border-input bg-background mt-2 h-12 w-full rounded-lg border p-1"
            />
          </div>

          <div>
            <label className="text-foreground block text-sm font-medium">
              Cor secundária
            </label>
            <input
              type="color"
              name="cor_secundaria"
              value={draft.cor_secundaria}
              onChange={handleChange}
              className="border-input bg-background mt-2 h-12 w-full rounded-lg border p-1"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-foreground block text-sm font-medium">
              Fonte
            </label>
            <select
              name="font_family"
              value={draft.font_family}
              onChange={handleChange}
              className="border-input bg-background text-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="border-input bg-background flex items-center justify-between rounded-lg border px-4 py-3 md:col-span-2">
            <div>
              <p className="text-foreground text-sm font-medium">Ativo</p>
              <p className="text-muted-foreground text-xs">
                Exibir no catálogo de curadoria
              </p>
            </div>
            <input
              type="checkbox"
              name="is_active"
              checked={Boolean(draft.is_active)}
              onChange={handleChange}
              className="border-input h-4 w-4 rounded"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={uploadingAvatar}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5 py-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadingAvatar
              ? "Enviando avatar..."
              : editingId
                ? "Salvar"
                : "Adicionar"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setDraft(EMPTY_FORM);
                setAvatarFile(null);
                setAvatarPreview(null);
              }}
              className="border-border text-foreground rounded-lg border px-5 py-2.5 font-medium transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : collaborators.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground rounded-lg border p-8 text-center text-sm">
          Nenhum colaborador cadastrado.
        </div>
      ) : (
        <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-border border-b">
                <tr>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Nome
                  </th>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Instagram
                  </th>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Cores
                  </th>
                  <th className="text-foreground px-6 py-3 text-right text-sm font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {collaborators.map((collaborator) => (
                  <tr
                    key={collaborator.id}
                    className="border-border hover:bg-muted/50 border-b transition-colors"
                  >
                    <td className="text-foreground px-6 py-4 text-sm font-medium">
                      {collaborator.nome}
                    </td>
                    <td className="text-muted-foreground px-6 py-4 text-sm">
                      {collaborator.instagram || "-"}
                    </td>
                    <td className="text-muted-foreground px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-5 w-5 rounded-full border"
                          style={{ backgroundColor: collaborator.cor_primaria }}
                        />
                        <span
                          className="inline-block h-5 w-5 rounded-full border"
                          style={{
                            backgroundColor:
                              collaborator.cor_secundaria ?? "#D85A30",
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(collaborator)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          aria-label={`Editar ${collaborator.nome}`}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(collaborator.id, collaborator.nome)
                          }
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          aria-label={`Excluir ${collaborator.nome}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
