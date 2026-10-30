import type { KeepsakeBlock } from "@/types/memory";

/**
 * Normalise model output: drop stray reasoning tags, markdown emphasis and
 * bullet characters while keeping the `# ` / `## ` markers the prompt allows.
 */
export function cleanModelOutput(raw: string): string {
  return raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^```[a-z]*\s*$/gim, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, "$1$2")
    .replace(/^#{3,}\s+/gm, "## ")
    .replace(/^\s*(?:[-*•]|\d+\.)\s+/gm, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseKeepsake(content: string): KeepsakeBlock[] {
  const blocks: KeepsakeBlock[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", text: paragraph.join("\n") });
      paragraph = [];
    }
  };

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
    } else if (trimmed.startsWith("## ")) {
      flush();
      blocks.push({ kind: "heading", text: trimmed.slice(3).trim() });
    } else if (trimmed.startsWith("# ")) {
      flush();
      blocks.push({ kind: "title", text: trimmed.slice(2).trim() });
    } else {
      paragraph.push(trimmed);
    }
  }
  flush();

  return blocks;
}

/** Plain-text rendering for copying and downloading. */
export function toPlainText(content: string): string {
  return parseKeepsake(content)
    .map((block) => {
      if (block.kind === "title") return `${block.text}\n${"=".repeat(Math.min(block.text.length, 60))}`;
      if (block.kind === "heading") return block.text.toUpperCase();
      return block.text;
    })
    .join("\n\n");
}

export function keepsakeFilename(name: string, format: string): string {
  const slug =
    name
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "keepsake";
  return `memory-lantern-${slug}-${format}.txt`;
}
