import { describe, expect, it } from "vitest";
import { checkKeepsake, countWords } from "@/lib/ai/fidelity";
import { generateKeepsake } from "@/lib/ai/generate";
import { createChatCompletion, ProviderError } from "@/lib/ai/groq";
import { buildMaterial, wordBudget } from "@/lib/ai/prompts";
import type { KeepsakeFormat, MemoryInput } from "@/types/memory";
import { SAMPLES, withFormat } from "../fixtures";

/**
 * Calls the real model (GPT-OSS 20B on Groq). Skipped without GROQ_API_KEY.
 * Run with `npm run test:live`; it takes a few minutes on the free tier.
 */
const FORMATS: KeepsakeFormat[] = ["letter", "story", "card"];

async function withRateLimitRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!(err instanceof ProviderError && err.code === "rate_limited")) throw err;
    await new Promise((r) => setTimeout(r, 60_000));
    return fn();
  }
}

interface Verdict {
  unsupported: { text: string; why: string }[];
  voice: "writer" | "remembered_person" | "mixed";
  assumes_death: boolean;
}

const JUDGE_PROMPT = `You audit keepsakes for faithfulness. A WRITER shared memories of a REMEMBERED PERSON; a keepsake was written from them.

List every specific personal detail in the keepsake that is NOT stated in the material: invented events, actions, conversations, quotes, places, objects, foods, people, times, settings, sensory details, habits or lessons. Paraphrases of the material are fine. The WRITER's feelings, reflections and plainly figurative phrases ("like a warm blanket") are fine and must not be listed.

Also say whose voice it is written in ("writer" if the WRITER is the narrator or letter-writer; "remembered_person" if it is written as the remembered person; "mixed" otherwise), and whether it says or implies the remembered person has died.

Reply with JSON only: {"unsupported":[{"text":"...","why":"..."}],"voice":"writer","assumes_death":false}`;

async function judge(input: MemoryInput, keepsake: string): Promise<Verdict> {
  const { text } = await withRateLimitRetry(() =>
    createChatCompletion(
      [
        { role: "system", content: JUDGE_PROMPT },
        {
          role: "user",
          content: `<memory_material>\n${buildMaterial(input)}\n</memory_material>\n\n<keepsake>\n${keepsake}\n</keepsake>`,
        },
      ],
      { maxTokens: 2000, temperature: 0, reasoningEffort: "medium" },
    ),
  );
  return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as Verdict;
}

describe.skipIf(!process.env.GROQ_API_KEY)("live generation with GPT-OSS 20B", () => {
  for (const sample of SAMPLES) {
    for (const format of FORMATS) {
      it(`${format}: ${sample.label}`, { timeout: 300_000 }, async () => {
        const input = withFormat(sample, format);
        const { content } = await withRateLimitRetry(() => generateKeepsake(input));
        const verdict = await judge(input, content);
        console.log(
          `\n--- ${format} / ${sample.input.name} (${countWords(content)} words)\n${content}\n` +
            `judge: ${JSON.stringify(verdict)}`,
        );

        // Deterministic checks: quotes, voice, life/death, clichés, length.
        expect(checkKeepsake(content, input)).toEqual([]);
        expect(countWords(content)).toBeLessThanOrEqual(Math.round(wordBudget(input).max * 1.35));

        // Important details survive.
        for (const detail of sample.mustInclude) expect(content).toMatch(detail);

        // Written from the writer's perspective, never as the remembered person.
        expect(content).toMatch(/\b(I|my|me)\b/);
        expect(content).not.toMatch(/proud of (you|me)/i);
        if (format === "letter") {
          expect(content.split("\n")[0]).toMatch(new RegExp(`^(Dear|Dearest|My dear|My dearest|To)\\b.*${sample.input.name}`, "i"));
          expect(content).toMatch(/\byou\b/i);
        }

        // An independent model audit for invented details and voice.
        expect(verdict.voice).toBe("writer");
        if (sample.input.status !== "passed") expect(verdict.assumes_death).toBe(false);
        expect(verdict.unsupported).toEqual([]);
      });
    }
  }
});
