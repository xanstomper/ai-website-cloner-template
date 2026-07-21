import { NextResponse } from "next/server";
import { getTrendingAll } from "@/lib/tmdb";

// Powers the search overlay's empty state (suggestions before you type).
export async function GET() {
  try {
    const results = await getTrendingAll();
    return NextResponse.json({ results: results.slice(0, 18) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "trending failed", results: [] },
      { status: 502 },
    );
  }
}
