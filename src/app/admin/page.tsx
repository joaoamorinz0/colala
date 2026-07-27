"use client";

import Link from "next/link";
import { AdminLayout, PageHeader } from "@/components/admin";
import { MapPin, Tags, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Locais",
      count: 0,
      description: "Locais cadastrados",
      icon: MapPin,
      href: "/admin/places",
    },
    {
      title: "Categorias",
      count: 0,
      description: "Categorias ativas",
      icon: Tags,
      href: "/admin/categories",
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        description="Bem-vindo ao painel administrativo"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.href}
              href={stat.href as never}
              className="border-border bg-card hover:shadow-soft group rounded-lg border p-6 shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    {stat.description}
                  </p>
                  <p className="text-foreground mt-2 text-3xl font-bold">
                    {stat.count}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary rounded-lg p-3">
                  <Icon size={24} />
                </div>
              </div>
              <div className="text-primary mt-4 flex items-center transition-transform group-hover:translate-x-1">
                <span className="text-sm font-medium">Gerenciar</span>
                <ArrowRight size={16} className="ml-2" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="border-border bg-card mt-12 rounded-lg border p-6 shadow-sm">
        <h2 className="text-foreground text-lg font-bold">Atalhos rápidos</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href={"/admin/places/new" as never}
            className="border-muted-foreground/25 hover:border-primary hover:bg-primary/5 rounded-lg border-2 border-dashed p-4 text-center transition-colors"
          >
            <p className="text-foreground font-medium">Adicionar novo local</p>
          </Link>
          <Link
            href={"/admin/categories" as never}
            className="border-muted-foreground/25 hover:border-primary hover:bg-primary/5 rounded-lg border-2 border-dashed p-4 text-center transition-colors"
          >
            <p className="text-foreground font-medium">Gerenciar categorias</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
