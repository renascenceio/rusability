import { redirect } from "next/navigation";

export default function NewsbotRedirect() {
  redirect("/admin/news");
}
