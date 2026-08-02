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
  Share2,
  Network,
  HelpCircle,
  ListTree,
  Wand2,
  Scissors,
  SpellCheck,
  Feather,
  CalendarDays,
  BadgePercent,
  Send,
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
  Share2,
  Network,
  HelpCircle,
  ListTree,
  Wand2,
  Scissors,
  SpellCheck,
  Feather,
  CalendarDays,
  BadgePercent,
  Send,
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
