import type { AnimeCardData, HeroSlide } from "@/types/anime";
import { AnimeCard } from "./AnimeCard";
import { Hero } from "./Hero";

export function CatalogGrid({
  title,
  subtitle,
  items,
  heroSlides,
}: {
  title: string;
  subtitle?: string;
  items: AnimeCardData[];
  heroSlides?: HeroSlide[];
}) {
  const hasHero = heroSlides && heroSlides.length > 0;
  return (
    <main className="flex-1">
      {hasHero && <Hero slides={heroSlides} />}
      <div className={hasHero ? "px-6 pb-16 pt-6 md:px-14" : "px-6 pb-16 pt-24 md:px-14"}>
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </header>

      {items.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          Nothing to show here yet.
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 sm:justify-start">
          {items.map((item) => (
            <AnimeCard key={`${item.id}-${item.slug}`} data={item} />
          ))}
        </div>
      )}
      </div>
    </main>
  );
}
