"use client";

import { useEffect, useState } from "react";
import { AnimeCard } from "./AnimeCard";
import { getProgressList, type ProgressItem } from "@/lib/storage";

export function ContinueWatching() {
  const [items, setItems] = useState<ProgressItem[]>([]);

  useEffect(() => {
    const list = getProgressList().sort((a, b) => b.updatedAt - a.updatedAt);
    setItems(list);
  }, []);

  if (items.length === 0) return null;

  const cards = items.map(
    (p) =>
      ({
        id: p.id,
        slug: p.id,
        tmdbId: p.tmdbId,
        mediaType: p.mediaType,
        title: p.title,
        poster: p.poster,
        backdrop: p.backdrop,
      }) as const,
  );

  return (
    <section className="relative py-5 pl-6 md:pl-14">
      <div className="mb-3 flex items-center gap-3 pr-6">
        <h2 className="font-heading text-[21.6px] font-extrabold tracking-[-0.3px]">
          Continue Watching
        </h2>
        <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
          RESUME
        </span>
      </div>
      <div className="row-scroll gap-3 pr-6">
        {cards.map((card) => (
          <AnimeCard key={card.id} data={card} />
        ))}
      </div>
    </section>
  );
}
