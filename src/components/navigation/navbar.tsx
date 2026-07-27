"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_SHELL, PAGE_X } from "@/constants/design";
import { MAIN_NAVIGATION_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";

export type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const { user } = useSupabase();

  return (
    <div
      className={cn(
        "bottom-nav-bottom pointer-events-none fixed inset-x-0 z-30",
        APP_SHELL,
        PAGE_X,
      )}
    >
      <nav
        className={cn(
          "border-border/70 bg-background/90 rounded-nav shadow-nav pointer-events-auto border p-1.5 backdrop-blur-xl",
          className,
        )}
        aria-label="Primary navigation"
      >
        <ul className="grid grid-cols-4 gap-0.5">
          {MAIN_NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/home" && pathname === "/");

            // Profile tab shows avatar when authenticated
            const isProfileTab = item.href === "/profile";

            return (
              <li key={item.href}>
                <Link
                  className={cn(
                    "text-foreground/55 hover:text-foreground h-nav-item rounded-nav flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-all duration-200 ease-out",
                    isActive &&
                      "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_hsl(15_64%_60%/0.12)]",
                  )}
                  href={isProfileTab && !user ? "/login" : item.href}
                >
                  {isProfileTab && user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className={cn(
                        "size-5 rounded-full object-cover",
                        isActive && "ring-primary ring-2",
                      )}
                    />
                  ) : Icon ? (
                    <Icon className="size-5 stroke-[2.1]" />
                  ) : null}
                  <span>{isProfileTab && !user ? "Entrar" : item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
