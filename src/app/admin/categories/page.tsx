'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminLayout, PageHeader, LoadingSpinner } from '@/components/admin';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import {
  getAllCategories,
  deleteCategory,
  updateCategory,
  createCategory,
} from '@/services/admin.service';
import type { Category } from '@/types/category';
import { Edit2, Trash2, Plus, Check, X } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    icon: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error('Supabase não configurado');

      const data = await getAllCategories(client);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) return;

    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error('Supabase não configurado');

      await deleteCategory(client, id);
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar categoria');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error('Supabase não configurado');

      const result = await createCategory(client, {
        name: newCategoryData.name,
        description: newCategoryData.description || null,
        icon: newCategoryData.icon || null,
      });

      setCategories([result, ...categories]);
      setNewCategoryData({ name: '', description: '', icon: '' });
      setShowNewForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar categoria');
    }
  };

  const handleUpdateCategory = async (id: string | number, data: Partial<Category>) => {
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error('Supabase não configurado');

      const updated = await updateCategory(client, id, data);
      setCategories(
        categories.map((cat) => (cat.id === id ? updated : cat)),
      );
      setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar categoria');
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
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Nova Categoria
          </button>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {/* New Category Form */}
          {showNewForm && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Nova Categoria
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Nome da categoria"
                  value={newCategoryData.name}
                  onChange={(e) =>
                    setNewCategoryData({ ...newCategoryData, name: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <input
                  type="text"
                  placeholder="Ícone (emoji)"
                  value={newCategoryData.icon}
                  onChange={(e) =>
                    setNewCategoryData({ ...newCategoryData, icon: e.target.value })
                  }
                  maxLength={2}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleAddCategory}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
                >
                  <Check size={18} />
                  Adicionar
                </button>
                <button
                  onClick={() => setShowNewForm(false)}
                  className="flex items-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-gray-900 hover:bg-gray-400 transition-colors"
                >
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="rounded-lg bg-white shadow-sm overflow-hidden">
            {categories.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">Nenhuma categoria cadastrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Ícone
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-2xl">
                          {category.icon || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {category.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => setEditingId(category.id)}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
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
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
