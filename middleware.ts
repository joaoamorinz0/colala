import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_ROUTES = ["/admin", "/profile", "/favorites"];

function isProtectedRoute(pathname: string): boolean {
  // "/profile/[username]" é uma rota pública (perfil público);
  // apenas "/profile" exato (área da conta) e "/profile/edit"
  // exigem autenticação.
  if (pathname.startsWith("/profile/")) {
    return pathname === "/profile/edit";
  }

  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function redirectWithSessionCookies(
  url: URL,
  sessionResponse: NextResponse,
): NextResponse {
  const redirectResponse = NextResponse.redirect(url);

  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-protected routes early
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Falha fechada para o painel: sem uma configuração válida não há como
    // confirmar a sessão ou a autorização do usuário.
    if (isAdminRoute(pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: unknown }[],
      ) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(
            name,
            value,
            options as Parameters<typeof response.cookies.set>[2],
          ),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return redirectWithSessionCookies(loginUrl, response);
  }

  // A autenticação não é suficiente para o painel. A função existente usa
  // auth.uid() no banco, portanto a decisão é vinculada ao token validado e
  // à tabela public.admins — nunca a estado/localStorage do navegador.
  if (isAdminRoute(pathname)) {
    const { data: isAdmin, error } = await supabase.rpc("is_admin");

    if (error || !isAdmin) {
      return redirectWithSessionCookies(new URL("/", request.url), response);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - auth callback (handled separately)
     * - login, register (public)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|login|register|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
