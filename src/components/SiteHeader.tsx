import Link from "next/link";
import { Lantern } from "./Lantern";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-night/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Memory Lantern home">
          <Lantern className="h-8 w-8" halo={false} />
          <span className="font-display text-xl tracking-wide text-ivory transition-colors group-hover:text-gold-soft">
            Memory Lantern
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-4">
          <Link
            href="/#how-it-works"
            className="hidden rounded-full px-3 py-2 text-mist transition-colors hover:text-ivory sm:inline-block"
          >
            How it works
          </Link>
          <Link
            href="/#privacy"
            className="hidden rounded-full px-3 py-2 text-mist transition-colors hover:text-ivory sm:inline-block"
          >
            Privacy
          </Link>
          <Link
            href="/create"
            className="rounded-full border border-gold/50 px-4 py-2 text-gold-soft transition-colors hover:border-gold hover:bg-gold/10"
          >
            Light a lantern
          </Link>
        </nav>
      </div>
    </header>
  );
}
