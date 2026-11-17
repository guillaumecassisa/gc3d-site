"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { NavItem } from "@/config/navigation";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

/** Menu mobile accessible (focus piégé, Échap, retour du focus). */
export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="hover:bg-muted inline-flex size-10 items-center justify-center rounded-lg lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-6" aria-hidden />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="bg-background fixed inset-y-0 right-0 z-50 flex w-[min(22rem,88vw)] flex-col shadow-xl outline-none">
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Logo variant="horizontal" height={32} />
            <Dialog.Close
              className="hover:bg-muted inline-flex size-10 items-center justify-center rounded-lg"
              aria-label="Fermer le menu"
            >
              <X className="size-6" aria-hidden />
            </Dialog.Close>
          </div>
          <Dialog.Title className="sr-only">Menu principal</Dialog.Title>
          <Dialog.Description className="sr-only">Navigation du site GC3D</Dialog.Description>
          <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto p-2">
            <ul className="grid gap-1">
              {items.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "hover:bg-muted flex min-h-12 items-center rounded-lg px-4 text-base font-medium",
                        active && "bg-muted",
                      )}
                    >
                      {active ? <span className="bg-accent mr-3 h-5 w-1 rounded-full" aria-hidden /> : null}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t p-4">
            <Link
              href="/compte"
              onClick={() => setOpen(false)}
              className="bg-primary text-primary-foreground flex min-h-12 items-center justify-center rounded-lg px-4 font-semibold"
            >
              Mon compte
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
