'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, MapPin, Tags, LogOut } from 'lucide-react';
import { useSupabase } from '@/providers';
import { signOut } from '@/services/auth.service';

const adminMenuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutGrid,
  },
  {
    label: 'Locais',
    href: '/admin/places',
    icon: MapPin,
  },
  {
    label: 'Categorias',
    href: '/admin/categories',
    icon: Tags,
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { client, user } = useSupabase();

  const handleLogout = async () => {
    if (!client) return;

    try {
      await signOut(client);
    } catch (error) {
      console.error('Erro ao sair:', error);
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">COLALÁ Admin</h1>
          <p className="mt-2 text-sm text-gray-500">
            {user?.email ?? 'Administrador'}
          </p>
        </div>

        {/* Menu */}
        <nav className="mt-8 space-y-2 px-4">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href as never}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-8 left-4 w-56">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-red-700 transition-colors hover:bg-red-100"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gray-100 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
