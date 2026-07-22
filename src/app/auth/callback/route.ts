import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profile";

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_KEY;

    if (supabaseUrl && supabaseKey) {
      const cookieStore = new Map<string, string>();
      const response = NextResponse.redirect(`${origin}${next}`);

      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return Array.from(cookieStore.entries()).map(([name, value]) => ({
              name,
              value,
            }));
          },
          setAll(
            cookiesToSet: { name: string; value: string; options?: unknown }[],
          ) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options as Parameters<typeof response.cookies.set>[2],
              );
            });
          },
        },
      });

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return response;
      }
    }
  }

  // Redireciona para página de login caso ocorra erro
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
