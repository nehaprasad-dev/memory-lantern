import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-dusk sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-display text-base italic text-mist">
          For the small things worth keeping.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <span>Written with GPT-OSS 20B, an open-weight model</span>
          <Link href="/#privacy" className="transition-colors hover:text-ivory">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
