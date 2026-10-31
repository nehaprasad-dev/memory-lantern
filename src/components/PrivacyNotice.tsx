import Link from "next/link";

interface PrivacyNoticeProps {
  className?: string;
}

/** One-line disclosure shown next to the form, before anything is sent. */
export function PrivacyNotice({ className = "" }: PrivacyNoticeProps) {
  return (
    <p className={`text-xs leading-relaxed text-dusk ${className}`}>
      Your words are sent to Groq to write the keepsake and are never saved.{" "}
      <Link href="/#privacy" className="underline underline-offset-2 hover:text-parchment">
        Privacy
      </Link>
    </p>
  );
}
