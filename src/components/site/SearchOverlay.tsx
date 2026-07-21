"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, X, TrendingUp, Loader2, Film, Tv } from "lucide-react";
import { useOverlay } from "@/components/overlay/OverlayProvider";
import type { AnimeCardData } from "@/types/anime";

type Props = {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
};

async function fetchJson(url: string, signal: AbortSignal): Promise<AnimeCardData[]> {
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: AnimeCardData[] };
  return data.results ?? [];
}

export function SearchOverlay({ open, onClose, initialQuery = "" }: Props) {
  const { openDetail } = useOverlay();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AnimeCardData[]>([]);
  const [trending, setTrending] = useState<AnimeCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const showingTrending = trimmed.length === 0;
  const items = showingTrending ? trending : results;

  // Sync the seed query + focus whenever the overlay opens.
  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setActive(-1);
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [open, initialQuery]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Lazy-load trending once for the empty state.
  useEffect(() => {
    if (!open || trending.length) return;
    const ctrl = new AbortController();
    fetchJson("/api/trending", ctrl.signal).then(setTrending).catch(() => {});
    return () => ctrl.abort();
  }, [open, trending.length]);

  // Debounced live search.
  useEffect(() => {
    if (!open) return;
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetchJson(`/api/search?q=${encodeURIComponent(trimmed)}`, ctrl.signal)
        .then((r) => {
          setResults(r);
          setActive(-1);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 260);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [trimmed, open]);

  const pick = useCallback(
    (card: AnimeCardData) => {
      onClose();
      // Let the overlay unmount cleanly before opening the detail modal.
      requestAnimationFrame(() => openDetail(card));
    },
    [onClose, openDetail],
  );

  // Keyboard: Esc closes, arrows move, Enter opens.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (!items.length) return;
      const cols = colsRef.current || 1;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(items.length - 1, (i < 0 ? -cols : i) + cols));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(-1, i - cols));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive((i) => Math.min(items.length - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter" && active >= 0 && items[active]) {
        e.preventDefault();
        pick(items[active]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, active, onClose, pick]);

  // Track how many columns the grid renders so arrow nav jumps rows correctly.
  const colsRef = useRef(1);
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const grid = gridRef.current;
      if (!grid) return;
      const first = grid.firstElementChild as HTMLElement | null;
      if (!first) return;
      colsRef.current = Math.max(
        1,
        Math.round(grid.clientWidth / first.clientWidth),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, items.length]);

  // Scroll the active card into view.
  useEffect(() => {
    if (active < 0 || !gridRef.current) return;
    const el = gridRef.current.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const heading = useMemo(() => {
    if (showingTrending) return "Trending now";
    if (loading) return "Searching…";
    return `${results.length} result${results.length === 1 ? "" : "s"}`;
  }, [showingTrending, loading, results.length]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Search Zynema"
    >
      {/* Backdrop */}
      <button
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/80 backdrop-blur-xl"
        style={{ WebkitBackdropFilter: "blur(24px)" }}
      />

      {/* Panel */}
      <div className="relative mx-auto flex h-full w-full max-w-[1180px] flex-col px-4 pt-4 sm:pt-6">
        {/* Search bar */}
        <div
          className="flex items-center gap-3 rounded-2xl border px-4 py-3"
          style={{
            borderColor: "var(--border-strong)",
            background: "rgba(9,11,16,0.9)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          }}
        >
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, series & anime…"
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-lg"
          />
          {loading && (
            <Loader2 className="size-5 shrink-0 animate-spin text-accent" />
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Section heading */}
        <div className="mt-5 flex items-center gap-2 px-1 text-sm font-semibold text-muted-foreground">
          {showingTrending && <TrendingUp className="size-4 text-accent" />}
          <span>{heading}</span>
        </div>

        {/* Results */}
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pb-8">
          {items.length === 0 && !loading && !showingTrending && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <p className="text-lg font-semibold text-foreground">
                No matches for “{trimmed}”
              </p>
              <p className="text-sm text-muted-foreground">
                Try a different title, or check the spelling.
              </p>
            </div>
          )}

          <div
            ref={gridRef}
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6"
          >
            {items.map((card, i) => (
              <button
                key={`${card.id}-${i}`}
                onClick={() => pick(card)}
                onMouseEnter={() => setActive(i)}
                className="group relative flex flex-col overflow-hidden rounded-xl text-left transition-transform duration-200 hover:-translate-y-1 focus:outline-none"
              >
                <div
                  className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border"
                  style={{
                    borderColor:
                      active === i ? "var(--accent)" : "var(--border)",
                    boxShadow:
                      active === i
                        ? "0 0 0 2px var(--accent), 0 14px 40px rgba(0,0,0,0.6)"
                        : "0 8px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  {card.poster ? (
                    <Image
                      src={card.poster}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 180px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/[0.04] text-muted-foreground">
                      {card.mediaType === "movie" ? (
                        <Film className="size-6" />
                      ) : (
                        <Tv className="size-6" />
                      )}
                    </div>
                  )}
                  {card.score ? (
                    <span className="absolute right-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-accent backdrop-blur">
                      ★ {card.score.toFixed(1)}
                    </span>
                  ) : null}
                  <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur">
                    {card.mediaType === "movie" ? (
                      <Film className="size-3" />
                    ) : (
                      <Tv className="size-3" />
                    )}
                    {card.mediaType === "movie" ? "Movie" : "Series"}
                  </span>
                </div>
                <span className="mt-1.5 line-clamp-2 px-0.5 text-[13px] font-semibold leading-tight text-foreground">
                  {card.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
