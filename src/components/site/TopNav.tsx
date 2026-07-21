"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, Bell, Film, Tv, Sparkles, Home } from "lucide-react";
import { SearchOverlay } from "@/components/site/SearchOverlay";

const sections = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/series", label: "Series", icon: Tv },
  { href: "/anime", label: "Anime", icon: Sparkles },
];

export function TopNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [searchOpen, setSearchOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 160 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Global shortcuts: Cmd/Ctrl+K or "/" open the search overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
    <header
      className="fixed inset-x-0 top-0 z-[1000] flex justify-center px-3 pt-3 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ transform: hidden ? "translateY(-140%)" : "translateY(0)" }}
    >
      {/* The dynamic island — one glass pill combining nav + search */}
      <div
        className="flex w-full max-w-[1180px] items-center gap-2 rounded-full border px-2 py-2 sm:gap-3 sm:px-3"
        style={{
          borderColor: "var(--border-strong)",
          background: scrolled ? "rgba(9,11,16,0.86)" : "rgba(9,11,16,0.55)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          boxShadow: scrolled
            ? "0 12px 40px rgba(0,0,0,0.5)"
            : "0 6px 24px rgba(0,0,0,0.35)",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Zynema home"
          className="flex shrink-0 items-center gap-2 pl-1 pr-1"
        >
          <Image
            src="/icons/icon.png"
            alt="Zynema"
            width={28}
            height={28}
            className="h-7 w-7 rounded-md"
          />
          <span className="hidden font-heading text-[18px] font-extrabold tracking-tight lg:inline">
            ZY<span className="text-accent">NEMA</span>
          </span>
        </Link>

        {/* Section tabs */}
        <nav className="flex shrink-0 items-center gap-1 rounded-full bg-white/[0.03] p-1">
          {sections.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition-colors sm:px-3 ${
                  active
                    ? "bg-accent text-[var(--accent-foreground)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Search — a trigger that opens the live search overlay */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="group relative flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-transparent bg-white/[0.05] pl-3 pr-2 text-left transition-colors hover:border-accent/40 hover:bg-white/[0.07]"
        >
          <Search className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span className="truncate text-sm text-muted-foreground">
            {query ? query : "Search title..."}
          </span>
          <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-[var(--border)] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </button>

        {/* Right cluster */}
        <div className="flex shrink-0 items-center gap-1.5 pr-0.5 sm:gap-2">
          <button
            className="hidden items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-bold text-foreground transition-colors hover:bg-white/10 sm:flex"
            aria-label="Language"
          >
            <span className="text-[13px] leading-none">文</span>EN
          </button>
          <button
            aria-label="Notifications"
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            <Bell className="size-5" />
          </button>
          <button
            aria-label="Account"
            className="size-8 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-accent to-accent-secondary"
          />
        </div>
      </div>
    </header>
    <SearchOverlay
      open={searchOpen}
      onClose={() => setSearchOpen(false)}
      initialQuery={query}
    />
    </>
  );
}
