"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type SideNavItem = { href: string; label: string; exact?: boolean };

/** Navigation latérale (espace client / administration) : barre horizontale défilante sur mobile. */
export function SideNav({
  items,
  label,
  tone = "light",
}: {
  items: SideNavItem[];
  label: string;
  tone?: "light" | "dark";
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-1 lg:flex-col">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors",
                  tone === "light" && (active ? "bg-foreground text-background" : "text-foreground/80 hover:bg-muted"),
                  tone === "dark" &&
                    (active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"),
                )}
              >
                {active && tone === "dark" ? (
                  <span className="bg-accent mr-2.5 h-4 w-1 rounded-full" aria-hidden />
                ) : null}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
