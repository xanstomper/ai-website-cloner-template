import { NextRequest, NextResponse } from "next/server";
import { getStreamUrls, type StreamType } from "@/lib/providers";

export const dynamic = "force-dynamic";

/* ----------------------------------------------------------------
   Stream-source health probe.
   For a title's provider list we server-side fetch each embed URL and
   classify it:
     "up"   → reachable and returned OK (green dot — online & working)
     "bad"  → reachable but non-2xx / blocked  (red dot — online, broken)
     "down" → network error / timeout          (grey dot — provider offline)
   Results are cached briefly so re-opening the same title is instant.
   ---------------------------------------------------------------- */

type Health = "up" | "bad" | "down";

const CACHE = new Map<string, { at: number; data: Record<string, Health> }>();
const TTL = 5 * 60 * 1000; // 5 min
const TIMEOUT = 4500;

async function probe(url: string): Promise<Health> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*",
      },
    });
    // Some providers block bots with 403 but the embed still plays in a
    // real browser — treat auth/forbidden as "reachable but questionable".
    if (res.ok) return "up";
    return "bad";
  } catch {
    return "down";
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type: StreamType = sp.get("type") === "movie" ? "movie" : "tv";
  const id = sp.get("id") || "";
  const season = Number(sp.get("s") || 1);
  const episode = Number(sp.get("e") || 1);

  if (!id) return NextResponse.json({});

  const key = `${type}:${id}:${season}:${episode}`;
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.at < TTL) {
    return NextResponse.json(hit.data);
  }

  const providers = getStreamUrls(type, id, season, episode);
  const results = await Promise.all(
    providers.map(async (p) => [p.name, await probe(p.url)] as const),
  );

  const data: Record<string, Health> = {};
  for (const [name, status] of results) data[name] = status;

  CACHE.set(key, { at: Date.now(), data });
  return NextResponse.json(data);
}
