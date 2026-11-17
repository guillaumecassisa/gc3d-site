import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logos officiels GC3D, intégrés tels quels (proportions d'origine conservées).
 * - horizontal : logo complet (symbole + nom + slogan), zones larges
 * - icon : symbole seul, petits espaces
 */
const SOURCES = {
  horizontal: {
    dark: { src: "/assets/branding/gc3d-logo-noir.png", w: 1254, h: 400 },
    light: { src: "/assets/branding/gc3d-logo-blanc.png", w: 1254, h: 400 },
  },
  icon: {
    dark: { src: "/assets/branding/gc3d-icone-noir.png", w: 474, h: 393 },
    light: { src: "/assets/branding/gc3d-icone-blanc.png", w: 474, h: 393 },
  },
} as const;

export function Logo({
  variant = "horizontal",
  tone = "dark",
  height = 40,
  priority,
  className,
}: {
  variant?: "horizontal" | "icon";
  /** dark = logo noir (fonds clairs), light = logo blanc (fonds sombres) */
  tone?: "dark" | "light";
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  const s = SOURCES[variant][tone];
  const width = Math.round((s.w / s.h) * height);
  return (
    <Image
      src={s.src}
      alt={variant === "horizontal" ? "GC3D — Impression 3D & produits personnalisés" : "GC3D"}
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto max-w-full select-none", className)}
      style={{ height, width: "auto" }}
    />
  );
}

export function LogoLink({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="GC3D — accueil" className={cn("flex items-center", className)}>
      <Logo variant="icon" height={36} priority className="sm:hidden" />
      <Logo variant="horizontal" height={40} priority className="hidden sm:block" />
    </Link>
  );
}
