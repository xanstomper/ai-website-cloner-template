import { CatalogGrid } from "@/components/site/CatalogGrid";
import type { AnimeCardData } from "@/types/anime";
import {
  getTrendingMovies,
  getPopularMovies,
  getTopMovies,
  getNowPlayingMovies,
  getMovieHeroSlides,
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

export default async function MoviesPage() {
  const [heroSlides, trending, popular, top, nowPlaying] = await Promise.all([
    getMovieHeroSlides(),
    getTrendingMovies(),
    getPopularMovies(),
    getTopMovies(),
    getNowPlayingMovies(),
  ]);

  return (
    <CatalogGrid
      title="Movies"
      subtitle="Trending, popular and top-rated films — all in one place."
      items={dedupe([trending, popular, top, nowPlaying])}
      heroSlides={heroSlides}
    />
  );
}
