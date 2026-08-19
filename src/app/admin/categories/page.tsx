"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { AdminLayout, PageHeader, LoadingSpinner } from "@/components/admin";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  getAllCategories,
  deleteCategory,
  createCategory,
  updateCategory,
} from "@/services/admin.service";
import type { Category } from "@/types/category";
import { categorySchema } from "@/lib/validators/admin";
import { Edit2, Trash2, Plus, Check, X } from "lucide-react";
import { useEffect } from "react";

const EMPTY_FORM = {
  name: "",
  description: "",
  icon: "",
  color: "",
  slug: "",
  sort_order: "",
  parent_id: "",
};

function toId(value: string | number): string {
  return String(value);
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState(EMPTY_FORM);
  const [newCategoryData, setNewCategoryData] = useState(EMPTY_FORM);
  const toast = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");
      setCategories(await getAllCategories(client));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar categorias",
      );
    } finally {
      setLoading(false);
    }
  };

  /** Categorias principais (parent_id = null) usadas como opções de pai. */
  const mainCategories = useMemo(
    () => categories.filter((category) => category.parent_id === null),
    [categories],
  );

  /**
   * Retorna os ids que NÃO podem ser escolhidos como pai de uma categoria:
   * a própria categoria e todas as suas subcategorias (evita ciclos).
   */
  const getBlockedParentIds = (categoryId: string | null): Set<string> => {
    const blocked = new Set<string>();

    if (categoryId !== null) {
      blocked.add(categoryId);

      categories.forEach((category) => {
        if (toId(category.parent_id ?? "") === categoryId) {
          blocked.add(toId(category.id));
        }
      });
    }

    return blocked;
  };

  const buildPayload = (raw: typeof EMPTY_FORM) => {
    const parsed = categorySchema.safeParse({
      ...raw,
      sort_order: raw.sort_order === "" ? null : raw.sort_order,
      parent_id: raw.parent_id === "" ? null : raw.parent_id,
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Categoria inválida");
    }

    return {
      name: parsed.data.name,
      description: parsed.data.description?.trim() || null,
      icon: parsed.data.icon?.trim() || null,
      color: parsed.data.color?.trim() || null,
      slug: parsed.data.slug?.trim() || null,
      sort_order: parsed.data.sort_order ?? null,
      parent_id: parsed.data.parent_id ?? null,
    };
  };

  const handleDelete = async (id: string | number, name: string) => {
    const hasChildren = categories.some(
      (category) => toId(category.parent_id ?? "") === toId(id),
    );

    const message = hasChildren
      ? `"${name}" possui subcategorias. Excluir ou mover as subcategorias antes de excluí-la?`
      : `Tem certeza que deseja excluir "${name}"?`;

    if (!confirm(message)) return;

    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");

      if (hasChildren) {
        toast.show(
          "Esta categoria possui subcategorias. Exclua ou mova as subcategorias antes de excluí-la.",
          "error",
        );
        return;
      }

      await deleteCategory(client, id);
      setCategories((prev) => prev.filter((cat) => toId(cat.id) !== toId(id)));
      toast.show("Categoria removida com sucesso.", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao deletar categoria";
      toast.show(message, "error");
    }
  };

  const handleAddCategory = async () => {
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");

      const result = await createCategory(
        client,
        buildPayload(newCategoryData),
      );

      setCategories((prev) => [result, ...prev]);
      setNewCategoryData(EMPTY_FORM);
      setShowNewForm(false);
      toast.show("Categoria criada com sucesso.", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar categoria";
      toast.show(message, "error");
    }
  };

  const handleEditInit = (category: Category) => {
    setEditingId(toId(category.id));
    setEditFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "",
      slug: category.slug || "",
      sort_order: category.sort_order?.toString() ?? "",
      parent_id: category.parent_id ?? "",
    });
  };

  const handleSaveEdit = async (id: string | number) => {
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");

      const updated = await updateCategory(
        client,
        id,
        buildPayload(editFormData),
      );

      setCategories((prev) =>
        prev.map((category) =>
          toId(category.id) === toId(id) ? updated : category,
        ),
      );
      setEditingId(null);
      toast.show("Categoria atualizada com sucesso.", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao atualizar categoria";
      toast.show(message, "error");
    }
  };

  const renderParentSelect = (
    value: string,
    onChange: (value: string) => void,
    currentCategoryId: string | null,
    formLabel: string,
  ) => {
    const blocked = getBlockedParentIds(currentCategoryId);

    return (
      <div className="mb-4">
        <label className="text-foreground block text-sm font-medium">
          {formLabel}
        </label>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="border-input bg-background text-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
        >
          <option value="">Nenhuma (categoria principal)</option>
          {mainCategories
            .filter((category) => !blocked.has(toId(category.id)))
            .map((category) => (
              <option key={toId(category.id)} value={toId(category.id)}>
                {category.name}
              </option>
            ))}
        </select>
      </div>
    );
  };

  const renderCategoryForm = (
    data: typeof EMPTY_FORM,
    setData: (value: typeof EMPTY_FORM) => void,
    onSubmit: () => void,
    onCancel: () => void,
    title: string,
    currentCategoryId: string | null,
  ) => (
    <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
      <h3 className="text-foreground mb-4 text-lg font-bold">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          type="text"
          placeholder="Nome da categoria"
          value={data.name}
          onChange={(event) => setData({ ...data, name: event.target.value })}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
        />
        <input
          type="text"
          placeholder="Slug (ex: cafeterias)"
          value={data.slug}
          onChange={(event) => setData({ ...data, slug: event.target.value })}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
        />
        <input
          type="number"
          placeholder="Ordem de exibição"
          min={0}
          value={data.sort_order}
          onChange={(event) =>
            setData({ ...data, sort_order: event.target.value })
          }
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          type="text"
          placeholder="Descrição"
          value={data.description}
          onChange={(event) =>
            setData({ ...data, description: event.target.value })
          }
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
        />
        <input
          type="text"
          placeholder="Ícone"
          value={data.icon}
          onChange={(event) => setData({ ...data, icon: event.target.value })}
          maxLength={4}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
        />
        <input
          type="text"
          placeholder="#be3d25"
          value={data.color}
          onChange={(event) => setData({ ...data, color: event.target.value })}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>
      <div className="mt-4">
        {renderParentSelect(
          data.parent_id,
          (value) => setData({ ...data, parent_id: value }),
          currentCategoryId,
          "Categoria pai (opcional)",
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          <Check size={18} />
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-400"
        >
          <X size={18} />
          Cancelar
        </button>
      </div>
    </div>
  );

  const renderTable = () => {
    const mainCats = categories.filter(
      (category) => category.parent_id === null,
    );

    return (
      <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma categoria cadastrada
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-border border-b">
                <tr>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Ícone
                  </th>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Nome
                  </th>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Ordem
                  </th>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Descrição
                  </th>
                  <th className="text-foreground px-6 py-3 text-right text-sm font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {mainCats.map((parent) => {
                  const parentId = toId(parent.id);
                  const children = categories.filter(
                    (category) => toId(category.parent_id ?? "") === parentId,
                  );
                  const isEditingParent = editingId === parentId;

                  return (
                    <FragmentRow key={parentId}>
                      {isEditingParent ? (
                        <tr className="border-border bg-primary/5 border-b">
                          <td colSpan={5} className="px-6 py-4">
                            {renderCategoryForm(
                              editFormData,
                              setEditFormData,
                              () => handleSaveEdit(parent.id),
                              () => setEditingId(null),
                              "Editar categoria",
                              parentId,
                            )}
                          </td>
                        </tr>
                      ) : (
                        <tr className="border-border hover:bg-muted/50 border-b transition-colors">
                          <td className="px-6 py-4 text-2xl">
                            {parent.icon || "-"}
                          </td>
                          <td className="text-foreground px-6 py-4 text-sm font-bold">
                            {parent.name}
                          </td>
                          <td className="text-muted-foreground px-6 py-4 text-sm">
                            {parent.sort_order ?? "-"}
                          </td>
                          <td className="text-muted-foreground px-6 py-4 text-sm">
                            {parent.description || "-"}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => handleEditInit(parent)}
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(parent.id, parent.name)
                                }
                                className="text-destructive hover:text-destructive/80 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {children.map((child) => {
                        const childId = toId(child.id);
                        const isEditingChild = editingId === childId;

                        if (isEditingChild) {
                          return (
                            <tr
                              key={childId}
                              className="border-border bg-primary/5 border-b"
                            >
                              <td
                                colSpan={5}
                                className="bg-background px-6 py-4 pl-16"
                              >
                                {renderCategoryForm(
                                  editFormData,
                                  setEditFormData,
                                  () => handleSaveEdit(child.id),
                                  () => setEditingId(null),
                                  "Editar subcategoria",
                                  childId,
                                )}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr
                            key={childId}
                            className="border-border hover:bg-muted/50 border-b transition-colors"
                          >
                            <td className="px-6 py-4 pl-16 text-2xl">
                              {child.icon || "-"}
                            </td>
                            <td className="text-foreground px-6 py-4 text-sm">
                              <span className="mr-2 text-gray-400">├─</span>
                              {child.name}
                            </td>
                            <td className="text-muted-foreground px-6 py-4 text-sm">
                              {child.sort_order ?? "-"}
                            </td>
                            <td className="text-muted-foreground px-6 py-4 text-sm">
                              {child.description || "-"}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleEditInit(child)}
                                  className="text-primary hover:text-primary/80 transition-colors"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(child.id, child.name)
                                  }
                                  className="text-destructive hover:text-destructive/80 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </FragmentRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Categorias"
        description="Gerencie as categorias e subcategorias de locais"
        action={
          <button
            onClick={() => setShowNewForm(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
          >
            <Plus size={20} />
            Nova Categoria
          </button>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {showNewForm && (
            <div className="space-y-4">
              {renderCategoryForm(
                newCategoryData,
                setNewCategoryData,
                handleAddCategory,
                () => setShowNewForm(false),
                "Nova Categoria",
                null,
              )}
            </div>
          )}

          {renderTable()}
        </div>
      )}
    </AdminLayout>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
