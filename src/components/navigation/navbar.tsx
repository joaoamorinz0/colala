"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAVIGATION_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "sticky bottom-0 z-20 border-t border-border bg-background/95 px-3 py-2 backdrop-blur",
        className,
      )}
      aria-label="Primary navigation"
    >
      <ul className="grid grid-cols-4 gap-1">
        {MAIN_NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium text-muted-foreground transition-colors",
                  isActive && "bg-muted text-foreground",
                )}
                href={item.href}
              >
                {Icon ? <Icon className="size-5" /> : null}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
