"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation principale" className="hidden lg:block">
      <ul className="flex items-center gap-0.5 xl:gap-1">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-foreground/80 hover:text-foreground relative inline-flex h-10 items-center rounded-md px-2.5 text-sm font-medium transition-colors xl:px-3",
                  active &&
                    "text-foreground after:bg-accent after:absolute after:inset-x-2.5 after:-bottom-[13px] after:h-0.5 after:rounded-full",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
