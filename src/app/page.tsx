import { Hero } from "@/components/site/Hero";
import { AnimeRow } from "@/components/site/AnimeRow";
import type { AnimeRow as RowData } from "@/types/anime";
import {
  getHomeHeroSlides,
  getTrendingAll,
  getPopularMovies,
  getTopMovies,
  getTrendingSeries,
  getAiringSeries,
  getTrendingAnime,
  getPopularAnime,
} from "@/lib/tmdb";

export const revalidate = 3600;

export default async function HomePage() {
  const [
    heroSlides,
    trendingAll,
    popularMovies,
    topMovies,
    trendingSeries,
    airingSeries,
    trendingAnime,
    popularAnime,
  ] = await Promise.all([
    getHomeHeroSlides(),
    getTrendingAll(),
    getPopularMovies(),
    getTopMovies(),
    getTrendingSeries(),
    getAiringSeries(),
    getTrendingAnime(),
    getPopularAnime(),
  ]);

  // A mixture of everything — movies, series and anime interleaved.
  const allRows: RowData[] = [
    { id: "trending", heading: "Trending Now", badge: "HOT", viewAllHref: "/search?q=trending", items: trendingAll },
    { id: "pop-movies", heading: "Popular Movies", badge: "TOP", viewAllHref: "/movies", items: popularMovies },
    { id: "trend-series", heading: "Trending Series", badge: "SEASONAL", viewAllHref: "/series", items: trendingSeries },
    { id: "trend-anime", heading: "Trending Anime", badge: "NEW", viewAllHref: "/anime", items: trendingAnime },
    { id: "top-movies", heading: "Top Rated Movies", viewAllHref: "/movies", items: topMovies },
    { id: "airing-series", heading: "Airing Now", viewAllHref: "/series", items: airingSeries },
    { id: "pop-anime", heading: "Popular Anime", viewAllHref: "/anime", items: popularAnime },
  ];
  const rows = allRows.filter((r) => r.items.length > 0);

  return (
    <main className="flex-1">
      <Hero slides={heroSlides} />
      <div className="space-y-2 pb-10 pt-2">
        {rows.map((row) => (
          <AnimeRow key={row.id} row={row} />
        ))}
      </div>
    </main>
  );
}
