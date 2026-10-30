import type { MemoryInput } from "@/types/memory";
import { wordBudget } from "./prompts";

/**
 * Deterministic checks on a keepsake against the writer's material. They catch
 * the failure modes prompts alone don't reliably prevent: invented quotes,
 * writing as the remembered person, assumptions about death, and padding.
 */

export type IssueCode =
  | "unsupported_quote"
  | "impersonation"
  | "afterlife_contact"
  | "status_assumption"
  | "unsupported_name"
  | "unsupported_number"
  | "cliche"
  | "letter_salutation"
  | "too_long";

export interface FidelityIssue {
  code: IssueCode;
  /** Instruction for the editor model. */
  message: string;
  /** The offending text, used to locate the sentence when repairing. */
  excerpt: string;
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’‘`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const stem = (word: string) => word.replace(/(?:ies)$/, "y").replace(/(?:es|s)$/, "");

export function materialText(input: MemoryInput): string {
  return [
    input.name,
    input.relationship,
    input.writerName,
    input.memories,
    input.moments,
    input.favourites,
    input.context,
  ].join("\n");
}

export function countWords(text: string): number {
  return text
    .replace(/^#+\s+/gm, "")
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

const QUOTE_PATTERNS = [/"([^"\n]{1,200})"/g, /“([^”\n]{1,200})”/g, /‘([^’\n]{1,120})’(?!\w)/g];

const AFTERLIFE = [
  /\bwatching over (?:me|us|you)\b/i,
  /\blooking down on (?:me|us)\b/i,
  /\bi (?:can )?(?:still )?feel you (?:here|with me|beside me|near)\b/i,
  /\b(?:with me|with us|here) in spirit\b/i,
  /\bsending (?:me|us) (?:a )?signs?\b/i,
  /\bfrom (?:up )?(?:above|heaven)\b/i,
  /\bin a better place\b/i,
  /\byou(?:'re|’re| are) (?:now )?(?:at peace|in heaven)\b/i,
  /\bwith the angels\b/i,
  /\byou(?:'d|’d| would) have (?:wanted|been proud|said|told)\b/i,
  /\byou(?:'d|’d| would) want (?:me|us)\b/i,
];

const IMPERSONATION = [
  /\bremember me\b/i,
  /\bdon(?:'|’)?t (?:cry|grieve|mourn|be sad) for me\b/i,
  /\bi(?:'ll|’ll| will) always be (?:with you|watching|by your side)\b/i,
  /\bi(?:'m|’m| am) (?:always )?watching over you\b/i,
  /\bmy (?:dear |sweet |darling |precious )?(?:grand)?(?:child|children|son|daughter|kids|grandkids)\b/i,
];

const DEATH_TERMS = [
  /\bpass(?:ed|ing)? (?:away|on)\b/i,
  /\bsince you passed\b/i,
  /\b(?:died|dying|death|dead)\b/i,
  /\b(?:your|the) late\b/i,
  /\b(?:funeral|cremation|burial|grave|obituary)\b/i,
  /\b(?:grief|grieve|grieving|mourn\w*|bereave\w*)\b/i,
  /\b(?:heaven|afterlife|rest in peace|in loving memory)\b/i,
  /\bno longer (?:with us|with me|here)\b/i,
  /\b(?:lost you|losing you|your loss|the loss)\b/i,
  /\byou(?:'re|’re| are) gone\b/i,
  /\bsince you(?:'ve|’ve| have)? (?:left|gone)\b/i,
];

/** Not wrong for someone living far away, but implies absence when the writer hasn't said. */
const ABSENCE_TERMS = [/\b(?:i|we) (?:still )?miss (?:you|her|him|them)\b/i, /\bwithout you\b/i];

const ALIVE_TERMS = [
  /\bsee you (?:soon|again|next)\b/i,
  /\buntil we meet\b/i,
  /\bcan(?:'|’)?t wait to see you\b/i,
  /\byou still (?:cook|make|sing|hum|call|laugh|tell|bake|play|read|say|smile)\w*\b/i,
  /\bnext time (?:i|we) (?:see|visit)\b/i,
];

const CLICHES = [
  /\bgone but not forgotten\b/i,
  /\bforever in (?:our|my) hearts?\b/i,
  /\b(?:lives?|live) on in (?:our|my) hearts?\b/i,
  /\bbeautiful soul\b/i,
  /\bwords (?:cannot|can(?:'|’)?t) (?:express|describe)\b/i,
  /\bheart of (?:our|the) (?:\w+ )?(?:home|kitchen|house|family)\b/i,
  /\blit up (?:any|every|the) room\b/i,
  /\blight up (?:any|every|the) room\b/i,
  /\btouched (?:so many|countless) lives\b/i,
  /\bleft a (?:void|hole)\b/i,
  /\bangel on earth\b/i,
  /\bguardian angel\b/i,
  /\bheart of gold\b/i,
  /\blarger than life\b/i,
  /\bone of a kind\b/i,
  /\bsimplest of gestures\b/i,
];

const CAPITALISED_OK = new Set(["i", "im", "ive", "id", "ill", "dear", "love", "yours", "ok"]);

function lines(content: string) {
  return content.split("\n").map((l) => l.trim());
}

/** Body lines: skip blank lines and `# ` / `## ` headings. */
function bodyLines(content: string) {
  return lines(content).filter((l) => l && !l.startsWith("#"));
}

function matchUnsupported(
  content: string,
  patterns: RegExp[],
  material: string,
): string[] {
  const found: string[] = [];
  for (const pattern of patterns) {
    const m = content.match(pattern);
    if (m && !material.includes(normalize(m[0]))) found.push(m[0]);
  }
  return found;
}

export function checkKeepsake(content: string, input: MemoryInput): FidelityIssue[] {
  const issues: FidelityIssue[] = [];
  const source = materialText(input);
  const material = normalize(source);
  const vocab = new Set(material.split(" ").map(stem));
  const name = normalize(input.name);
  const nameWords = new Set(name.split(" ").map(stem));

  for (const pattern of QUOTE_PATTERNS) {
    for (const m of content.matchAll(pattern)) {
      const quoted = normalize(m[1]);
      if (quoted && !material.includes(quoted)) {
        issues.push({
          code: "unsupported_quote",
          message: `The quotation "${m[1]}" is not in the material. Quote only the writer's exact words, or remove it.`,
          excerpt: m[0],
        });
      }
    }
  }

  for (const excerpt of matchUnsupported(content, IMPERSONATION, material)) {
    issues.push({
      code: "impersonation",
      message: `"${excerpt}" reads as ${input.name} speaking. Write only in the writer's voice.`,
      excerpt,
    });
  }

  // A sign-off line that ends with the remembered person's name means the
  // keepsake was signed by them, not by the writer.
  const tail = bodyLines(content).slice(-3);
  for (const line of tail) {
    const n = normalize(line);
    const words = n.split(" ");
    if (
      name &&
      words.length <= 6 &&
      !/[.!?]["”’]?$/.test(line) &&
      (n === name || n.endsWith(` ${name}`)) &&
      !/^(dear|dearest|my dear|to|for)\b/.test(n) &&
      normalize(input.writerName) !== name
    ) {
      issues.push({
        code: "impersonation",
        message: `The keepsake is signed as ${input.name}. It must be signed by the writer.`,
        excerpt: line,
      });
    }
  }

  for (const excerpt of matchUnsupported(content, AFTERLIFE, material)) {
    issues.push({
      code: "afterlife_contact",
      message: `"${excerpt}" suggests contact from or knowledge of an afterlife. Remove it.`,
      excerpt,
    });
  }

  if (input.status !== "passed") {
    for (const excerpt of matchUnsupported(content, DEATH_TERMS, material)) {
      issues.push({
        code: "status_assumption",
        message:
          input.status === "living"
            ? `"${excerpt}" implies ${input.name} has died, but they are living.`
            : `"${excerpt}" implies ${input.name} has died, but the writer chose not to say.`,
        excerpt,
      });
    }
  }
  if (input.status === "unspecified") {
    for (const excerpt of matchUnsupported(content, ABSENCE_TERMS, material)) {
      issues.push({
        code: "status_assumption",
        message: `"${excerpt}" implies ${input.name} is gone, but the writer chose not to say.`,
        excerpt,
      });
    }
    for (const excerpt of matchUnsupported(content, ALIVE_TERMS, material)) {
      issues.push({
        code: "status_assumption",
        message: `"${excerpt}" implies ${input.name} is alive now, but the writer chose not to say.`,
        excerpt,
      });
    }
  }

  for (const excerpt of matchUnsupported(content, CLICHES, material)) {
    issues.push({ code: "cliche", message: `Replace the cliché "${excerpt}".`, excerpt });
  }

  // Capitalised words mid-sentence that the writer never used are likely
  // invented names or places.
  const flaggedNames = new Set<string>();
  for (const line of bodyLines(content)) {
    const text = line.replace(/\[[^\]]*\]/g, "");
    for (const m of text.matchAll(/\p{Lu}[\p{L}'’-]*/gu)) {
      const before = text.slice(0, m.index).trimEnd();
      if (!before || /[.!?:;"“‘(—–-]$/.test(before)) continue;
      const word = normalize(m[0]);
      if (!word || CAPITALISED_OK.has(word) || nameWords.has(stem(word))) continue;
      if (word.split(" ").every((w) => vocab.has(stem(w)))) continue;
      if (flaggedNames.has(word)) continue;
      flaggedNames.add(word);
      issues.push({
        code: "unsupported_name",
        message: `"${m[0]}" looks like a name or place that is not in the material. Remove it unless the writer mentioned it.`,
        excerpt: m[0],
      });
    }
  }

  const sourceNumbers = new Set(source.match(/\d+/g) ?? []);
  for (const m of content.matchAll(/\d+/g)) {
    if (!sourceNumbers.has(m[0])) {
      issues.push({
        code: "unsupported_number",
        message: `The number "${m[0]}" is not in the material. Remove it.`,
        excerpt: m[0],
      });
    }
  }

  if (input.format === "letter") {
    const first = bodyLines(content)[0] ?? "";
    if (!/^(dear|dearest|my dear|my dearest|to)\b/i.test(first) || (name && !normalize(first).includes(name))) {
      issues.push({
        code: "letter_salutation",
        message: `The letter must open by addressing ${input.name}, e.g. "Dear ${input.name},".`,
        excerpt: first,
      });
    }
  }

  const { max } = wordBudget(input);
  const words = countWords(content);
  if (words > max * 1.35) {
    issues.push({
      code: "too_long",
      message: `The keepsake is ${words} words; keep it under ${max} by cutting anything not grounded in the material.`,
      excerpt: "",
    });
  }

  return issues;
}

const SENTENCE = /[^.!?]+(?:[.!?]+["”’)]*|$)\s*/g;

/**
 * Last-resort repair once the editor model has had its chances: drop each
 * sentence or line that still contains a flagged excerpt, and fix the letter's
 * salutation and signature. Removing is safer than leaving invented content.
 */
export function repairKeepsake(content: string, input: MemoryInput, issues: FidelityIssue[]): string {
  const removable = issues
    .filter((i) => i.code !== "too_long" && i.code !== "letter_salutation" && i.excerpt)
    .map((i) => i.excerpt.toLowerCase());

  const out: string[] = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || !removable.length) {
      out.push(line);
      continue;
    }
    if (removable.some((e) => line.toLowerCase() === e)) continue;
    const sentences = line.match(SENTENCE) ?? [line];
    const kept = sentences.filter((s) => !removable.some((e) => s.toLowerCase().includes(e)));
    const rebuilt = kept.join("").trim();
    if (rebuilt) out.push(rebuilt);
  }

  let result = out.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  if (input.format === "letter") {
    if (issues.some((i) => i.code === "letter_salutation")) {
      const [first, ...rest] = result.split("\n");
      const firstIsSalutation = /^(dear|dearest|my dear|my dearest|to|hi|hello)\b/i.test(first);
      result = [`Dear ${input.name},`, ...(firstIsSalutation ? rest : [first, ...rest])].join("\n");
    }
    const body = bodyLines(result);
    const last = body[body.length - 1] ?? "";
    if (/^(with love|love|all my love|yours|with all my love|lovingly|always)\b[^.!?]*,?$/i.test(last)) {
      result = `${result}\n${input.writerName || "[Your name]"}`;
    }
  }

  return result.replace(/\n{3,}/g, "\n\n").trim();
}
