import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Redirection optimiste des espaces protégés quand aucun cookie de session
 * n'est présent. Ce n'est PAS le contrôle d'accès : chaque page, action et
 * route revérifie la session et les permissions côté serveur.
 */
export function proxy(request: NextRequest) {
  const hasSession = Boolean(getSessionCookie(request, { cookiePrefix: "gc3d" }));
  if (!hasSession) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("retour", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/compte/:path*", "/admin/:path*"],
};
