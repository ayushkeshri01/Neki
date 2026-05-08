"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ReactionType } from "@/lib/reactions";

interface ReactionConfig {
  id: ReactionType;
  label: string;
  emoji: string;
  /** Tailwind text color class applied to the button label when this reaction is active */
  textClass: string;
  /** Tailwind background color class for the small circular icon disc */
  ringClass: string;
}

const REACTIONS: readonly ReactionConfig[] = [
  {
    id: "like",
    label: "Like",
    emoji: "👍",
    textClass: "text-blue-600 dark:text-blue-400",
    ringClass: "bg-blue-500/15",
  },
  {
    id: "celebrate",
    label: "Celebrate",
    emoji: "👏",
    textClass: "text-emerald-600 dark:text-emerald-400",
    ringClass: "bg-emerald-500/15",
  },
  {
    id: "love",
    label: "Love",
    emoji: "❤️",
    textClass: "text-rose-600 dark:text-rose-400",
    ringClass: "bg-rose-500/15",
  },
  {
    id: "insightful",
    label: "Insightful",
    emoji: "💡",
    textClass: "text-amber-600 dark:text-amber-400",
    ringClass: "bg-amber-500/15",
  },
  {
    id: "support",
    label: "Support",
    emoji: "🤝",
    textClass: "text-purple-600 dark:text-purple-400",
    ringClass: "bg-purple-500/15",
  },
] as const;

const REACTION_MAP: Record<ReactionType, ReactionConfig> = REACTIONS.reduce(
  (acc, r) => ({ ...acc, [r.id]: r }),
  {} as Record<ReactionType, ReactionConfig>
);

/* ---------- Component ---------- */

export interface ReactionButtonProps {
  /** Currently selected reaction, or null if none */
  reaction?: ReactionType | null;
  /** Optional total reaction count to display next to the button */
  count?: number;
  /** Called when the user picks, changes, or removes their reaction */
  onChange?: (reaction: ReactionType | null) => void;
  /** Disable all interaction */
  disabled?: boolean;
  /** Hide the count badge */
  hideCount?: boolean;
  className?: string;
}

const HOVER_OPEN_DELAY = 280;
const HOVER_CLOSE_DELAY = 200;
const LONG_PRESS_DELAY = 450;

export function ReactionButton({
  reaction = null,
  count,
  onChange,
  disabled = false,
  hideCount = false,
  className,
}: ReactionButtonProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const current = reaction ? REACTION_MAP[reaction] : null;

  /* ---- Hover open/close (desktop) ---- */
  const scheduleOpen = useCallback(() => {
    if (disabled) return;
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (open) return;
    openTimer.current = setTimeout(() => setOpen(true), HOVER_OPEN_DELAY);
  }, [disabled, open]);

  const scheduleClose = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY);
  }, []);

  /* ---- Long-press (mobile) ---- */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      if (e.pointerType !== "touch") return;
      longPressTriggered.current = false;
      longPressTimer.current = setTimeout(() => {
        longPressTriggered.current = true;
        setOpen(true);
      }, LONG_PRESS_DELAY);
    },
    [disabled]
  );

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  /* ---- Close popup on outside interaction (mobile-friendly) ---- */
  useEffect(() => {
    if (!open) return;
    function onDocPointer(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* ---- Cleanup pending timers on unmount ---- */
  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  /* ---- Click handlers ---- */
  function handleButtonClick() {
    if (disabled) return;
    // If a long-press just opened the popup, don't fire a default toggle
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    onChange?.(reaction ? null : "like");
  }

  function handleSelect(id: ReactionType) {
    setOpen(false);
    onChange?.(reaction === id ? null : id);
  }

  /* ---- Render ---- */
  const showCount = !hideCount && typeof count === "number" && count > 0;

  return (
    <div
      ref={wrapRef}
      className={cn("relative inline-flex items-center gap-2", className)}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") scheduleOpen();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") scheduleClose();
      }}
    >
      {/* Main like / reaction button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleButtonClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-pressed={!!reaction}
        aria-label={current ? `Reacted: ${current.label}. Click to remove.` : "Like"}
        className={cn(
          "group inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium",
          "transition-all duration-200 ease-out",
          "hover:bg-muted active:scale-[0.97]",
          "disabled:pointer-events-none disabled:opacity-50",
          current ? current.textClass : "text-muted-foreground"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {current ? (
            <motion.span
              key={current.id}
              initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="text-base leading-none"
              aria-hidden
            >
              {current.emoji}
            </motion.span>
          ) : (
            <motion.span
              key="default-thumb"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="inline-flex"
              aria-hidden
            >
              <ThumbsUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            </motion.span>
          )}
        </AnimatePresence>

        <span className="select-none">{current ? current.label : "Like"}</span>
      </button>

      {showCount && (
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatCount(count!)}
        </span>
      )}

      {/* Reaction picker popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Pick a reaction"
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className={cn(
              "absolute bottom-full left-0 z-50 mb-2",
              "flex items-center gap-1 rounded-full border bg-popover/95 p-1.5",
              "shadow-lg shadow-black/10 backdrop-blur",
              "supports-[backdrop-filter]:bg-popover/80"
            )}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") scheduleOpen();
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") scheduleClose();
            }}
          >
            {REACTIONS.map((r, i) => (
              <ReactionItem
                key={r.id}
                config={r}
                active={reaction === r.id}
                index={i}
                onSelect={() => handleSelect(r.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Single reaction in popup ---------- */

function ReactionItem({
  config,
  active,
  index,
  onSelect,
}: {
  config: ReactionConfig;
  active: boolean;
  index: number;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      aria-label={config.label}
      onClick={onSelect}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 10, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.04,
        type: "spring",
        stiffness: 480,
        damping: 22,
      }}
      whileHover={{ scale: 1.25, y: -6 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && config.ringClass
      )}
    >
      <span className="text-2xl leading-none" aria-hidden>
        {config.emoji}
      </span>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "pointer-events-none absolute -top-8 whitespace-nowrap rounded-md",
              "bg-foreground px-2 py-0.5 text-[11px] font-medium text-background",
              "shadow-sm"
            )}
          >
            {config.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ---------- Utils ---------- */

function formatCount(n: number): string {
  if (n >= 1_000_000) {
    const val = n / 1_000_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const val = n / 1_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
  }
  return n.toString();
}

/* ---------- Re-exports for convenience ---------- */

export { REACTIONS, REACTION_MAP };
