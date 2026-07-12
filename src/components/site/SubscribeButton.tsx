"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { toggleSubscription } from "@/app/actions/subscriptions";
import { cn } from "@/lib/utils";

type Props = {
  authorId: string;
  initialSubscribed: boolean;
  /** Whether a user session exists. When false, clicking routes to sign-in. */
  authed: boolean;
  className?: string;
  /** Inline style override (used by the Elite article which is skin-themed). */
  style?: CSSProperties;
  subscribedStyle?: CSSProperties;
  size?: "sm" | "md";
};

const SIZE = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
};

/**
 * Follow / unfollow an author. Optimistic, session-aware: a signed-out click
 * sends the reader to /sign-in with a return path. Works anywhere an author is
 * shown (profile, article headers, Elite layout).
 */
export function SubscribeButton({
  authorId,
  initialSubscribed,
  authed,
  className,
  style,
  subscribedStyle,
  size = "md",
}: Props) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick() {
    if (!authed) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const prev = subscribed;
    setSubscribed(!prev); // optimistic
    startTransition(async () => {
      const res = await toggleSubscription(authorId);
      if (!res.ok) {
        setSubscribed(prev);
        if (res.reason === "unauthenticated") {
          router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
        }
        return;
      }
      setSubscribed(res.subscribed);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={subscribed}
      style={subscribed ? subscribedStyle : style}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-all active:scale-[0.97] disabled:opacity-60",
        SIZE[size],
        subscribed
          ? "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
          : "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm hover:brightness-110",
        className,
      )}
    >
      {subscribed ? (
        <>
          <Check className="h-4 w-4" /> Вы подписаны
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" /> Подписаться
        </>
      )}
    </button>
  );
}
