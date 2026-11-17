"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await signOut();
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- purge de l'état client
          window.location.assign("/");
        })
      }
      className={cn(
        "hover:bg-muted inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium disabled:opacity-50",
        className,
      )}
    >
      <LogOut className="size-4" aria-hidden />
      Se déconnecter
    </button>
  );
}
