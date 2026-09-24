import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/admin-auth";

export default async function AdminRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getAdminAccess();

  if (access.status === "unauthenticated" || access.status === "unavailable") {
    redirect("/login?redirectTo=/admin");
  }

  if (access.status === "forbidden") {
    redirect("/");
  }

  return children;
}
