import { redirect } from "next/navigation";
import { createSupabaseServerSessionClient } from "@/lib/supabase/server";
import { LoginView } from "@/components/auth/login-view";

export default async function IndexPage() {
  const supabase = await createSupabaseServerSessionClient();

  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      redirect("/home");
    }
  }

  return <LoginView />;
}
