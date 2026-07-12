import type { Metadata } from "next";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";
import { requireRole, AUTHOR_ROLES } from "@/lib/auth-helpers";
import { fetchCredits } from "./actions";

export const metadata: Metadata = {
  title: "Редактор — Rusability",
  robots: { index: false },
};

export default async function EditorPage() {
  await requireRole(AUTHOR_ROLES, "/editor");
  const credits = await fetchCredits();
  return <EditorWorkspace initialCredits={credits} />;
}
