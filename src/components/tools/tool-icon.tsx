import {
  Heading,
  Search,
  RefreshCw,
  Lightbulb,
  FileText,
  ListChecks,
  Mail,
  MessageSquare,
  PenLine,
  ScanText,
  Languages,
  Quote,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

const ICONS: Record<string, LucideIcon> = {
  Heading,
  Search,
  RefreshCw,
  Lightbulb,
  FileText,
  ListChecks,
  Mail,
  MessageSquare,
  PenLine,
  ScanText,
  Languages,
  Quote,
  Sparkles,
};

export function ToolIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  const Icon = ICONS[name] ?? Wand2;
  return <Icon className={className} style={style} aria-hidden />;
}
