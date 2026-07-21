import { CatalogGrid } from "@/components/site/CatalogGrid";
import type { AnimeCardData } from "@/types/anime";
import {
  getTrendingSeries,
  getPopularSeries,
  getTopSeries,
  getAiringSeries,
  getSeriesHeroSlides,
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

export default async function SeriesPage() {
  const [heroSlides, trending, popular, top, airing] = await Promise.all([
    getSeriesHeroSlides(),
    getTrendingSeries(),
    getPopularSeries(),
    getTopSeries(),
    getAiringSeries(),
  ]);

  return (
    <CatalogGrid
      title="Series"
      subtitle="Trending, popular and currently airing TV series."
      items={dedupe([trending, popular, top, airing])}
      heroSlides={heroSlides}
    />
  );
}
