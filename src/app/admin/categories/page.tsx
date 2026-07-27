"use client";

import { useEffect, useState } from "react";
import { AdminLayout, PageHeader, LoadingSpinner } from "@/components/admin";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  getAllCategories,
  deleteCategory,
  createCategory,
  updateCategory,
} from "@/services/admin.service";
import type { Category } from "@/types/category";
import { Edit2, Trash2, Plus, Check, X } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    description: "",
    icon: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");

      const data = await getAllCategories(client);
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar categorias",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Tem certeza que deseja deletar esta categoria?")) return;

    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");

      await deleteCategory(client, id);
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar categoria");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryData.name.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");

      const result = await createCategory(client, {
        name: newCategoryData.name,
        description: newCategoryData.description || null,
        icon: newCategoryData.icon || null,
      });

      setCategories([result, ...categories]);
      setNewCategoryData({ name: "", description: "", icon: "" });
      setShowNewForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar categoria");
    }
  };

  const handleEditInit = (category: Category) => {
    setEditingId(category.id);
    setEditFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
    });
  };

  const handleSaveEdit = async (id: string | number) => {
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");

      const updated = await updateCategory(client, id, {
        name: editFormData.name,
        description: editFormData.description || null,
        icon: editFormData.icon || null,
      });

      setCategories(categories.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar categoria");
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Categorias"
        description="Gerencie as categorias de locais"
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
          {/* New Category Form */}
          {showNewForm && (
            <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="text-foreground mb-4 text-lg font-bold">
                Nova Categoria
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Nome da categoria"
                  value={newCategoryData.name}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      name: e.target.value,
                    })
                  }
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
                />
                <input
                  type="text"
                  placeholder="Descrição"
                  value={newCategoryData.description}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      description: e.target.value,
                    })
                  }
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
                />
                <input
                  type="text"
                  placeholder="Ícone (emoji)"
                  value={newCategoryData.icon}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      icon: e.target.value,
                    })
                  }
                  maxLength={2}
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleAddCategory}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  <Check size={18} />
                  Adicionar
                </button>
                <button
                  onClick={() => setShowNewForm(false)}
                  className="flex items-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-400"
                >
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Categories List */}
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
                        Descrição
                      </th>
                      <th className="text-foreground px-6 py-3 text-right text-sm font-semibold">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) =>
                      editingId === category.id ? (
                        <tr
                          key={category.id}
                          className="border-border bg-primary/5 border-b"
                        >
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editFormData.icon}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  icon: e.target.value,
                                })
                              }
                              maxLength={2}
                              className="border-input rounded border px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  name: e.target.value,
                                })
                              }
                              className="border-input text-foreground w-full rounded border px-2 py-1 text-sm font-medium"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editFormData.description}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  description: e.target.value,
                                })
                              }
                              className="border-input text-foreground w-full rounded border px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSaveEdit(category.id)}
                                className="p-1 text-green-600 hover:text-green-700"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 text-gray-500 hover:text-gray-700"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={category.id}
                          className="border-border hover:bg-muted/50 border-b transition-colors"
                        >
                          <td className="px-6 py-4 text-2xl">
                            {category.icon || "-"}
                          </td>
                          <td className="text-foreground px-6 py-4 text-sm font-medium">
                            {category.name}
                          </td>
                          <td className="text-muted-foreground px-6 py-4 text-sm">
                            {category.description || "-"}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleEditInit(category)}
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(category.id)}
                                className="text-destructive hover:text-destructive/80 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
