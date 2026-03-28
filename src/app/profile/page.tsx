import { redirect } from "next/navigation";
import { CURRENT_USER } from "@/lib/data";

export default function ProfileIndexPage() {
  redirect(`/profile/${CURRENT_USER.id}`);
}
