"use client";

import { useEffect, useState } from "react";
import { AnimeCard } from "@/components/site/AnimeCard";
import { getWatchlist, type WatchlistItem } from "@/lib/storage";
import { Heart } from "lucide-react";

export default function MyListPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    setItems(getWatchlist().sort((a, b) => b.addedAt - a.addedAt));
  }, []);

  // Refresh when the user returns to this tab (in case they added/removed items)
  useEffect(() => {
    const onFocus = () => setItems(getWatchlist().sort((a, b) => b.addedAt - a.addedAt));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <main className="flex-1 px-6 pb-16 pt-24 md:px-14">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            My List
          </h1>
          {items.length > 0 && (
            <span className="rounded-md bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">
              {items.length}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length > 0
            ? `${items.length} title${items.length === 1 ? "" : "s"} saved`
            : "Titles you add will appear here."}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-white/[0.04]">
            <Heart className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Your list is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Click the <Heart className="inline size-3.5 align-middle" /> icon on any title to save it here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <AnimeCard
              key={item.id}
              data={{
                id: item.id,
                slug: item.slug,
                tmdbId: item.tmdbId,
                mediaType: item.mediaType,
                title: item.title,
                poster: item.poster,
                backdrop: item.backdrop,
                score: item.score,
                format: item.format as any,
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
