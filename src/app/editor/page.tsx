import type { Metadata } from "next";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";

export const metadata: Metadata = {
  title: "Редактор — Rusability",
  robots: { index: false },
};

export default function EditorPage() {
  return <EditorWorkspace />;
}
