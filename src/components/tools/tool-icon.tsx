import {
  Heading,
  Search,
  RefreshCw,
  Lightbulb,
  Wand2,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Heading,
  Search,
  RefreshCw,
  Lightbulb,
};

export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Wand2;
  return <Icon className={className} aria-hidden />;
}
