import { redirect } from "next/navigation";

// Авторы больше не отдельная страница — теперь это вкладка внутри «Пользователи».
export default function AdminAuthorsPage() {
  redirect("/admin/users?tab=authors");
}
