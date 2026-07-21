import Link from "next/link";
import { AnimeCard } from "@/components/site/AnimeCard";
import { getDiscover, DISCOVER_GENRES, type DiscoverType } from "@/lib/tmdb";

export const revalidate = 3600;

const TYPES: { key: DiscoverType; label: string }[] = [
  { key: "movie", label: "Movies" },
  { key: "tv", label: "Series" },
  { key: "anime", label: "Anime" },
];

type SP = { [key: string]: string | string[] | undefined };

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const rawType = typeof sp.type === "string" ? sp.type : "movie";
  const type: DiscoverType = (["movie", "tv", "anime"] as const).includes(
    rawType as DiscoverType,
  )
    ? (rawType as DiscoverType)
    : "movie";
  const genreId = typeof sp.genre === "string" ? Number(sp.genre) : undefined;

  const items = await getDiscover(type, genreId);
  const activeGenre = DISCOVER_GENRES.find((g) => g.id === genreId);

  const mk = (t: DiscoverType, g?: number) => {
    const p = new URLSearchParams();
    p.set("type", t);
    if (g) p.set("genre", String(g));
    return `/discover?${p.toString()}`;
  };

  return (
    <main className="flex-1 px-6 pb-16 pt-24 md:px-14">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          Discover
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse {activeGenre ? `${activeGenre.label} ` : ""}
          {type === "anime" ? "anime" : type === "movie" ? "movies" : "series"}{" "}
          by genre.
        </p>
      </header>

      {/* Type switcher */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TYPES.map((t) => {
          const active = t.key === type;
          return (
            <Link
              key={t.key}
              href={mk(t.key, genreId)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-accent text-[var(--accent-foreground)]"
                  : "border border-[var(--border-strong)] bg-white/[0.03] text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Genre chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href={mk(type)}
          className={`rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${
            !genreId
              ? "bg-accent/15 text-accent"
              : "border border-[var(--border)] text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </Link>
        {DISCOVER_GENRES.map((g) => {
          const active = g.id === genreId;
          return (
            <Link
              key={g.id}
              href={mk(type, g.id)}
              className={`rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-accent/15 text-accent"
                  : "border border-[var(--border)] text-muted-foreground hover:text-foreground"
              }`}
            >
              {g.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          Nothing matches that filter yet.
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 sm:justify-start">
          {items.map((item) => (
            <AnimeCard key={`${item.id}-${item.slug}`} data={item} />
          ))}
        </div>
      )}
    </main>
  );
}
