'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout, PageHeader, PlaceForm } from '@/components/admin';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { createPlace } from '@/services/admin.service';
import type { Place } from '@/types/place';
import { ArrowLeft } from 'lucide-react';

export default function NewPlacePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: Omit<Place, 'id' | 'created_at'>) => {
    setIsLoading(true);
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error('Supabase não configurado');

      await createPlace(client, data);
      router.push('/admin/places');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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
        title="Novo Local"
        description="Adicione um novo local ao catálogo"
      />

      <PlaceForm onSubmit={handleSubmit} isLoading={isLoading} />
    </AdminLayout>
  );
}
