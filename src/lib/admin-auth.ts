import "server-only";

import { createSupabaseServerSessionClient } from "@/lib/supabase/server";

export type AdminAccess =
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "authorized" }
  | { status: "unavailable" };

/**
 * Confirma a identidade no Supabase Auth e a autorização na função is_admin()
 * do banco. Este helper é usado por layouts e Route Handlers para que o
 * middleware não seja a única barreira do painel.
 */
export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = await createSupabaseServerSessionClient();

  if (!supabase) return { status: "unavailable" };

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { status: "unauthenticated" };

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  if (adminError) return { status: "unavailable" };

  return isAdmin ? { status: "authorized" } : { status: "forbidden" };
}
