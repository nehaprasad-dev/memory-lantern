import { Fragment } from "react";
import { parseKeepsake } from "@/lib/keepsake-text";
import type { KeepsakeBlock, KeepsakeFormat } from "@/types/memory";

/** Renders keepsake text with typography suited to each format. */
export function KeepsakeView({ content, format }: { content: string; format: KeepsakeFormat }) {
  const blocks = parseKeepsake(content);

  if (format === "card") return <CardView blocks={blocks} />;

  const firstParagraph = blocks.findIndex((b) => b.kind === "paragraph");
  return (
    <div className="font-serif text-[17px] leading-[1.85] text-parchment sm:text-lg">
      {blocks.map((block, i) => {
        if (block.kind === "title") {
          return (
            <h3 key={i} className="mb-8 text-center font-display text-3xl leading-tight text-ivory sm:text-4xl">
              {block.text}
            </h3>
          );
        }
        if (block.kind === "heading") {
          return (
            <h4 key={i} className="mt-8 mb-3 font-display text-xl text-gold-soft">
              {block.text}
            </h4>
          );
        }
        const dropCap = format === "story" && i === firstParagraph && block.text.length > 80;
        return (
          <p
            key={i}
            className={`mb-5 last:mb-0 ${
              dropCap
                ? "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-gold-soft"
                : ""
            }`}
          >
            <Lines text={block.text} />
          </p>
        );
      })}
    </div>
  );
}

function CardView({ blocks }: { blocks: KeepsakeBlock[] }) {
  const titleIndex = blocks.findIndex((b) => b.kind === "title");
  const title = titleIndex >= 0 ? blocks[titleIndex] : null;
  // The line straight after the title is the dedication.
  const dedication =
    titleIndex >= 0 && blocks[titleIndex + 1]?.kind === "paragraph" ? blocks[titleIndex + 1] : null;
  const rest = blocks.filter((b) => b !== title && b !== dedication);

  return (
    <div className="mx-auto max-w-md rounded-sm border border-gold/40 p-1.5">
      <div className="flex flex-col items-center gap-1 border border-gold/20 px-6 py-10 text-center sm:px-10">
        <Ornament />
        {title && (
          <h3 className="mt-4 font-display text-3xl leading-tight text-ivory sm:text-4xl">{title.text}</h3>
        )}
        {dedication && (
          <p className="mt-2 font-display text-lg italic text-mist">
            <Lines text={dedication.text} />
          </p>
        )}
        <div className="mt-6 flex w-full flex-col gap-1">
          {rest.map((block, i) =>
            block.kind === "heading" ? (
              <h4
                key={i}
                className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold first:mt-0"
              >
                {block.text}
              </h4>
            ) : (
              <p key={i} className="font-serif text-[16px] leading-[1.8] text-parchment">
                <Lines text={block.text} />
              </p>
            ),
          )}
        </div>
        <div className="mt-8">
          <Ornament />
        </div>
      </div>
    </div>
  );
}

function Lines({ text }: { text: string }) {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}

function Ornament() {
  return (
    <svg viewBox="0 0 120 12" className="h-3 w-28 text-gold/70" aria-hidden="true">
      <path d="M0 6h48M72 6h48" stroke="currentColor" strokeWidth="0.75" />
      <path d="M60 1l5 5-5 5-5-5 5-5Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="60" cy="6" r="1.2" fill="currentColor" />
    </svg>
  );
}
