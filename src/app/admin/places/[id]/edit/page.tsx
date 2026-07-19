'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout, PageHeader, PlaceForm, LoadingSpinner } from '@/components/admin';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { getPlaceById, updatePlace } from '@/services/admin.service';
import type { Place } from '@/types/place';
import { ArrowLeft } from 'lucide-react';

export default function EditPlacePage() {
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const placeId = params?.id as string;

  useEffect(() => {
    const loadPlace = async () => {
      try {
        const client = createSupabaseBrowserClient();
        if (!client) throw new Error('Supabase não configurado');

        const data = await getPlaceById(client, placeId);
        setPlace(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar local');
      }
    };

    if (placeId) {
      loadPlace();
    }
  }, [placeId]);

  const handleSubmit = async (data: Omit<Place, 'id' | 'created_at'>) => {
    setIsLoading(true);
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error('Supabase não configurado');

      await updatePlace(client, placeId, data);
      router.push('/admin/places');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </AdminLayout>
    );
  }

  if (!place) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-2">
        <Link
          href={'/admin/places' as never}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar
        </Link>
      </div>

      <PageHeader
        title="Editar Local"
        description={place.name}
      />

      <PlaceForm initialData={place} onSubmit={handleSubmit} isLoading={isLoading} />
    </AdminLayout>
  );
}
