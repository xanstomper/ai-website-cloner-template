import { CatalogGrid } from "@/components/site/CatalogGrid";
import { searchAll } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const items = query ? await searchAll(query) : [];

  return (
    <CatalogGrid
      title={query ? `Results for “${query}”` : "Search"}
      subtitle={
        query
          ? `${items.length} title${items.length === 1 ? "" : "s"} found`
          : "Type a title in the search bar above to find movies, series and anime."
      }
      items={items}
    />
  );
}
