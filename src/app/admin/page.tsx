import { notFound } from "next/navigation";
import { AdminEditor } from "@/components/admin/AdminEditor";
import { LoginForm } from "@/components/admin/LoginForm";
import { RepositoryError, loadContent, type StoredContent } from "@/lib/admin/repository";
import { adminConfigured, isAdmin } from "@/lib/admin/session";
import { getRestaurant } from "@/restaurants";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!adminConfigured()) notFound();
  if (!(await isAdmin())) return <LoginForm name={getRestaurant().name} />;

  let content: StoredContent;
  try {
    content = await loadContent();
  } catch (error) {
    if (!(error instanceof RepositoryError)) throw error;
    return (
      <div className="admin-login">
        <p className="admin-login-card sf-error">{error.message}</p>
      </div>
    );
  }

  return <AdminEditor initial={content.config} sha={content.sha} />;
}
