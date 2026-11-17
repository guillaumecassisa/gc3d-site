import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { FEATURES, MAIN_NAV } from "@/config/navigation";
import { LogoLink } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

const iconLink =
  "inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted";

export function SiteHeader() {
  const items = MAIN_NAV.filter((i) => i.enabled);
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/85 sticky top-0 z-40 border-b backdrop-blur">
      <a
        href="#contenu"
        className="focus:bg-accent sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Aller au contenu
      </a>
      <div className="container-gc flex h-[var(--header-height)] items-center gap-4">
        <LogoLink />
        <NavLinks items={items} />
        <div className="ml-auto flex items-center gap-1">
          {FEATURES.search ? (
            <Link href="/recherche" className={iconLink} aria-label="Rechercher">
              <Search className="size-5" aria-hidden />
            </Link>
          ) : null}
          <Link href="/compte" className={iconLink} aria-label="Mon compte">
            <User className="size-5" aria-hidden />
          </Link>
          {FEATURES.favorites ? (
            <Link href="/compte/favoris" className={iconLink} aria-label="Mes favoris">
              <Heart className="size-5" aria-hidden />
            </Link>
          ) : null}
          {FEATURES.cart ? (
            <Link href="/panier" className={iconLink} aria-label="Panier">
              <ShoppingBag className="size-5" aria-hidden />
            </Link>
          ) : null}
          <MobileMenu items={items} />
        </div>
      </div>
    </header>
  );
}
