"use client";

import { useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { LIST_STACK } from "@/constants/design";
import { cn } from "@/lib/utils";
import { detectPlatform, isValidSocialUrl } from "@/lib/social-platforms";
import type { ProfileSocialLink } from "@/types/profile-social-link";
import { SocialPlatformIcon } from "@/components/profile/social-platform-icon";

export type SocialLinksEditorProps = {
  links: ProfileSocialLink[];
  onAdd: (url: string) => Promise<void>;
  onUpdate: (id: string, url: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
};

export function SocialLinksEditor({
  links,
  onAdd,
  onUpdate,
  onDelete,
  isLoading = false,
}: SocialLinksEditorProps) {
  const toast = useToast();
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalizeUrl = (value: string): string =>
    value.trim().replace(/\/+$/, "");

  const hasDuplicate = (url: string, ignoreId?: string): boolean => {
    const normalized = normalizeUrl(url).toLowerCase();
    return links.some(
      (link) =>
        link.id !== ignoreId &&
        normalizeUrl(link.url).toLowerCase() === normalized,
    );
  };

  const validateUrl = (value: string): string | null => {
    if (!isValidSocialUrl(value)) {
      toast.show("Digite uma URL válida com http:// ou https://", "error");
      return null;
    }
    return normalizeUrl(value);
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (isLoading) return;

    const normalized = validateUrl(newUrl);
    if (!normalized) return;

    if (hasDuplicate(normalized)) {
      toast.show("Este link já está adicionado.", "error");
      return;
    }

    try {
      await onAdd(normalized);
      setNewUrl("");
    } catch {
      setError("Não foi possível adicionar o link.");
    }
  };

  const handleStartEdit = (link: ProfileSocialLink) => {
    setEditingId(link.id);
    setEditingUrl(link.url);
    setError(null);
  };

  const handleSaveEdit = async (id: string) => {
    setError(null);
    if (isLoading) return;

    const normalized = validateUrl(editingUrl);
    if (!normalized) return;

    if (hasDuplicate(normalized, id)) {
      toast.show("Este link já está adicionado.", "error");
      return;
    }

    try {
      await onUpdate(id, normalized);
      setEditingId(null);
    } catch {
      setError("Não foi possível atualizar o link.");
    }
  };

  const handleDelete = async (id: string) => {
    if (isLoading) return;
    if (!window.confirm("Remover este link do perfil?")) return;

    try {
      await onDelete(id);
    } catch {
      setError("Não foi possível remover o link.");
    }
  };

  return (
    <div className={cn(LIST_STACK)}>
      {links.length > 0 ? (
        <div className="divide-border divide-y">
          {links.map((link) => {
            const platform = detectPlatform(link.url);
            const isEditing = editingId === link.id;

            if (isEditing) {
              return (
                <div
                  key={link.id}
                  className="space-y-stack-sm py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <SocialPlatformIcon
                      platform={platform}
                      className="text-muted-foreground size-4"
                    />
                    <span className="text-foreground text-sm font-semibold">
                      {platform.displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingUrl}
                      onChange={(event) => setEditingUrl(event.target.value)}
                      placeholder="https://..."
                      className="h-10 flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSaveEdit(link.id)}
                      disabled={isLoading}
                      aria-label="Salvar link"
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      aria-label="Cancelar edição"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={link.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <SocialPlatformIcon
                  platform={platform}
                  className="text-muted-foreground size-4 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-semibold">
                    {platform.displayName}
                  </p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary line-clamp-1 text-xs"
                  >
                    {link.url}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartEdit(link)}
                  className="text-muted-foreground hover:text-primary p-1"
                  aria-label="Editar link"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(link.id)}
                  className="text-muted-foreground p-1 hover:text-red-600"
                  aria-label="Remover link"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Nenhuma rede social adicionada ainda.
        </p>
      )}

      {error && (
        <p className="rounded-control bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form className="flex items-center gap-2" onSubmit={handleAdd}>
        <Input
          value={newUrl}
          onChange={(event) => setNewUrl(event.target.value)}
          placeholder="https://instagram.com/usuario"
          className="h-10 flex-1"
        />
        <Button type="submit" size="sm" disabled={isLoading}>
          <Plus className="size-4" />
          Adicionar
        </Button>
      </form>
    </div>
  );
}
