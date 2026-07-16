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
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 mx-auto w-full max-w-screen-sm px-5">
      <nav
        className={cn(
          "border-border/80 bg-background/92 pointer-events-auto rounded-[2rem] border p-1.5 shadow-[0_16px_36px_hsl(0_0%_13%/0.12)] backdrop-blur-xl",
          className,
        )}
        aria-label="Primary navigation"
      >
        <ul className="grid grid-cols-4 gap-1">
          {MAIN_NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/home" && pathname === "/");

            return (
              <li key={item.href}>
                <Link
                  className={cn(
                    "text-foreground/68 hover:bg-secondary/12 hover:text-foreground font-sm flex h-18 flex-col items-center justify-center gap-1 rounded-[1.55rem] text-sm transition-all duration-200 ease-out",
                    isActive &&
                      "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_hsl(15_64%_60%/0.12)]",
                  )}
                  href={item.href}
                >
                  {Icon ? <Icon className="size-7 stroke-[2.2]" /> : null}
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
