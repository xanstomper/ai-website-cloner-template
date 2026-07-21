import { CatalogGrid } from "@/components/site/CatalogGrid";
import type { AnimeCardData } from "@/types/anime";
import {
  getTrendingAnime,
  getPopularAnime,
  getTopAnime,
  getRecentAnime,
  getAnimeMovies,
  getAnimeHeroSlides,
} from "@/lib/tmdb";

export const revalidate = 3600;

function dedupe(lists: AnimeCardData[][]): AnimeCardData[] {
  const seen = new Set<string>();
  const out: AnimeCardData[] = [];
  for (const list of lists) {
    for (const item of list) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

export default async function AnimePage() {
  const [heroSlides, trending, popular, top, recent, movies] = await Promise.all([
    getAnimeHeroSlides(),
    getTrendingAnime(),
    getPopularAnime(),
    getTopAnime(),
    getRecentAnime(),
    getAnimeMovies(),
  ]);

  return (
    <CatalogGrid
      title="Anime"
      subtitle="Trending, popular, top-rated and the latest anime releases."
      items={dedupe([trending, popular, top, recent, movies])}
      heroSlides={heroSlides}
    />
  );
}
