interface PrivacyNoticeProps {
  className?: string;
}

/** Inline disclosure shown next to the form, before anything is sent. */
export function PrivacyNotice({ className = "" }: PrivacyNoticeProps) {
  return (
    <aside
      className={`rounded-xl border border-line/70 bg-ash/60 p-4 text-sm leading-relaxed text-mist ${className}`}
      aria-label="Privacy notice"
    >
      <p className="mb-1 font-medium text-parchment">Before you write</p>
      <p>
        When you press generate, what you&apos;ve written here is sent from our server to
        Groq, a hosted inference provider, so the open-weight model can write your keepsake.
        This is not offline or on-device processing. Memory Lantern doesn&apos;t save your
        memories or keepsakes — they live only in this browser tab until you close it.
      </p>
    </aside>
  );
}
