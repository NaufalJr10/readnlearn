import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PendingCountProvider } from "@/components/admin/PendingCountProvider";
import { getAdmin } from "@/lib/admin-auth";
import { countPendingAccounts } from "@/lib/admin-accounts";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  const pending = await countPendingAccounts();

  return (
    <PendingCountProvider initialCount={pending}>
      <AdminHeader />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </PendingCountProvider>
  );
}
