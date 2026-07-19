'use client';

import { useState, useEffect } from 'react';
import { FormField, LoadingSpinner } from '@/components/admin';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { uploadImage } from '@/services/admin.service';
import type { Place } from '@/types/place';
import type { Category } from '@/types/category';
import { getAllCategories } from '@/services/admin.service';
import { Upload, X } from 'lucide-react';

interface PlaceFormProps {
  initialData?: Place;
  onSubmit: (data: Omit<Place, 'id' | 'created_at'>) => Promise<void>;
  isLoading?: boolean;
}

export function PlaceForm({
  initialData,
  onSubmit,
  isLoading,
}: PlaceFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    city: initialData?.city || '',
    price_level: initialData?.price_level?.toString() || '',
    instagram: initialData?.instagram || '',
    category_id: initialData?.category_id?.toString() || '',
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.cover_image || null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const client = createSupabaseBrowserClient();
        if (!client) throw new Error('Supabase não configurado');
        const data = await getAllCategories(client);
        setCategories(data);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      }
    };

    loadCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let coverImageUrl = imagePreview;

      if (coverImage) {
        setUploadingImage(true);
        const client = createSupabaseBrowserClient();
        if (!client) throw new Error('Supabase não configurado');
        coverImageUrl = await uploadImage(client, coverImage);
      }

      const submitData: Omit<Place, 'id' | 'created_at'> = {
        name: formData.name,
        description: formData.description || null,
        city: formData.city || null,
        price_level: formData.price_level ? parseInt(formData.price_level) : null,
        instagram: formData.instagram || null,
        cover_image: coverImageUrl || null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar formulário');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-sm">
        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Imagem de Capa
          </label>
          {imagePreview && (
            <div className="relative mt-2 mb-4 inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-40 w-40 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setCoverImage(null);
                  setImagePreview(null);
                }}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 transition-colors hover:border-blue-500 hover:bg-blue-50">
            <Upload size={20} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {coverImage ? coverImage.name : 'Clique para fazer upload'}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>
        </div>

        {/* Name */}
        <FormField
          label="Nome do Local *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Digite o nome do local"
        />

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Digite a descrição do local"
            rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* City */}
        <FormField
          label="Cidade"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Digite a cidade"
        />

        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Categoria
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Level */}
        <FormField
          label="Nível de Preço (1-4)"
          name="price_level"
          type="number"
          min="1"
          max="4"
          value={formData.price_level}
          onChange={handleChange}
          placeholder="1"
        />

        {/* Instagram */}
        <FormField
          label="Instagram"
          name="instagram"
          value={formData.instagram}
          onChange={handleChange}
          placeholder="@usuario_instagram"
        />

        {/* Submit Button */}
        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={isLoading || uploadingImage}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading || uploadingImage ? (
              <>
                <LoadingSpinner />
                Processando...
              </>
            ) : (
              'Salvar Local'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
