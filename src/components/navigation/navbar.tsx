"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_SHELL, PAGE_X } from "@/constants/design";
import { MAIN_NAVIGATION_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();

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

            return (
              <li key={item.href}>
                <Link
                  className={cn(
                    "text-foreground/55 hover:text-foreground h-nav-item rounded-nav flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-all duration-200 ease-out",
                    isActive &&
                      "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_hsl(15_64%_60%/0.12)]",
                  )}
                  href={item.href}
                >
                  {Icon ? <Icon className="size-5 stroke-[2.1]" /> : null}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
