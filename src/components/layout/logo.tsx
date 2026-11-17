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

/**
 * Logo animé de l'en-tête (GC Studio → 3D → UV → Laser).
 * WebP animé (léger), GIF en secours, image fixe si l'utilisateur a demandé
 * de réduire les animations. Servi tel quel (pas d'optimisation qui figerait l'animation).
 */
export function AnimatedLogo({ height = 44, className }: { height?: number; className?: string }) {
  const width = Math.round((537 / 177) * height);
  return (
    <picture className={cn("block shrink-0", className)}>
      <source media="(prefers-reduced-motion: reduce)" srcSet="/assets/branding/gc-studio-fixe.png" />
      <source type="image/webp" srcSet="/assets/branding/gc-studio-anime.webp" />
      <img
        src="/assets/branding/gc-studio-anime.gif"
        alt="GC Studio — Impression 3D & produits personnalisés"
        width={width}
        height={height}
        fetchPriority="high"
        className="select-none"
        style={{ height, width: "auto" }}
      />
    </picture>
  );
}

export function LogoLink({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="GC Studio — accueil" className={cn("flex items-center", className)}>
      <AnimatedLogo height={40} className="sm:hidden" />
      <AnimatedLogo height={52} className="hidden sm:block" />
    </Link>
  );
}
