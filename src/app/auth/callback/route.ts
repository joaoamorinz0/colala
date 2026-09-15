import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/discover";
  }
  return value;
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_KEY;

  return url && key ? { url, key } : null;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(requestUrl.searchParams.get("next"));

  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.redirect(
      new URL("/login?error=auth-config", origin),
    );
  }

  const response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.headers
          .get("cookie")
          ?.split(";")
          .map((cookie) => {
            const [name, ...rest] = cookie.split("=");
            return { name: name.trim(), value: rest.join("=").trim() };
          })
          .filter((cookie) => cookie.name) ?? [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // PKCE callback: used by Supabase's default confirmation URL and OAuth.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  // Server-side email confirmation: supports templates using {{ .TokenHash }}.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=auth-callback-failed", origin),
  );
}
