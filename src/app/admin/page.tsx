'use client';

import Link from 'next/link';
import { AdminLayout, PageHeader } from '@/components/admin';
import { BarChart3, MapPin, Tags, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Locais',
      count: 0,
      description: 'Locais cadastrados',
      icon: MapPin,
      href: '/admin/places',
    },
    {
      title: 'Categorias',
      count: 0,
      description: 'Categorias ativas',
      icon: Tags,
      href: '/admin/categories',
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        description="Bem-vindo ao painel administrativo de COLALÁ"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
              <Link
                key={stat.href}
                href={stat.href as never}
              className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.description}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.count}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-600 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium">Gerenciar</span>
                <ArrowRight size={16} className="ml-2" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Atalhos rápidos</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href={'/admin/places/new' as never}
            className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <p className="font-medium text-gray-900">Adicionar novo local</p>
          </Link>
          <Link
            href={'/admin/categories' as never}
            className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <p className="font-medium text-gray-900">Gerenciar categorias</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
