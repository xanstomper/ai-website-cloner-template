"use client";

import { useState } from "react";
import type { AnimeCardData, HeroSlide, AnimeRow as RowData } from "@/types/anime";
import { AnimeRow } from "./AnimeRow";
import { Hero } from "./Hero";
import { AnimeCard } from "./AnimeCard";

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="size-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}

export function CatalogSections({
  title,
  subtitle,
  rows,
  allItems,
  heroSlides,
}: {
  title: string;
  subtitle?: string;
  rows: RowData[];
  allItems: AnimeCardData[];
  heroSlides?: HeroSlide[];
}) {
  const [loading, _setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const hasHero = heroSlides && heroSlides.length > 0;
  const validRows = rows.filter((r) => r.items.length > 0);

  if (loading) return <LoadingSkeleton />;

  const displayItems = showAll ? allItems : allItems.slice(0, 30);

  return (
    <main className="flex-1 animate-fade-in">
      {hasHero && <Hero slides={heroSlides} />}

      <div className={hasHero ? "pt-3" : "pt-24"}>
        <header className="mb-1 px-6 md:px-14">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </header>

        {/* Curated, labelled rows — identical look to the home page */}
        <div className="space-y-2 pt-1">
          {validRows.map((row) => (
            <AnimeRow key={row.id} row={row} />
          ))}
        </div>

        {/* Full catalogue for dense browsing — proper CSS grid */}
        {allItems.length > 0 && (
          <section className="px-6 pb-16 pt-6 md:px-14">
            <h2 className="mb-5 font-heading text-[21.6px] font-extrabold tracking-[-0.3px]">
              All {title}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {displayItems.map((item) => (
                <AnimeCard key={`${item.id}-${item.slug}`} data={item} />
              ))}
            </div>
            {allItems.length > 30 && !showAll && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="rounded-full border border-[var(--border-strong)] bg-white/5 px-8 py-2.5 text-sm font-semibold text-muted-foreground backdrop-blur transition-colors hover:bg-white/10 hover:text-foreground"
                >
                  View More ({allItems.length - 30} remaining)
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
