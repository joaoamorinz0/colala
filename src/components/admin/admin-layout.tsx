"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  MapPin,
  Tags,
  Star,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { useSupabase } from "@/providers";
import { signOut } from "@/services/auth.service";

const adminMenuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutGrid,
  },
  {
    label: "Locais",
    href: "/admin/places",
    icon: MapPin,
  },
  {
    label: "Eventos",
    href: "/admin/events",
    icon: CalendarDays,
  },
  {
    label: "Categorias",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Avaliações",
    href: "/admin/reviews",
    icon: Star,
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { client, user, profile } = useSupabase();

  const handleLogout = async () => {
    if (!client) return;

    try {
      await signOut(client);
    } catch {
      // session may already be gone
    } finally {
      router.replace("/");
    }
  };

  return (
    <div className="bg-background flex h-screen">
      {/* Sidebar */}
      <div className="border-border bg-card w-64 border-r shadow-sm">
        <div className="p-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            colalá{" "}
            <span className="text-primary text-sm font-semibold">Admin</span>
          </h1>
          <p className="text-muted-foreground mt-2 truncate text-sm">
            {profile?.name ?? user?.email ?? "Administrador"}
          </p>
        </div>

        {/* Menu */}
        <nav className="mt-8 space-y-1 px-3">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href as never}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-8 left-4 w-56">
          <button
            onClick={handleLogout}
            className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-background min-h-screen p-8">{children}</div>
      </div>
    </div>
  );
}
