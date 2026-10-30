import { describe, expect, it } from "vitest";
import { buildMessages, buildReviewMessages, wordBudget } from "@/lib/ai/prompts";
import { parseInput } from "@/lib/validation";
import { SAMPLES, withFormat } from "../fixtures";

const [aaji, dad, arjun] = SAMPLES;

describe("buildMessages", () => {
  it("names the writer and the remembered person separately", () => {
    const [system, user] = buildMessages(withFormat(aaji, "letter"));
    expect(system.content).toMatch(/WRITER/);
    expect(system.content).toMatch(/REMEMBERED PERSON/);
    expect(system.content).toMatch(/Never write as the REMEMBERED PERSON/);
    expect(user.content).toContain("The REMEMBERED PERSON's name:\nAaji");
    expect(user.content).toContain("Who Aaji is to the WRITER:\nmy grandmother");
    expect(user.content).toContain("The WRITER's name:\nMeera");
  });

  it("asks for a letter from the writer to the remembered person, signed by the writer", () => {
    const user = buildMessages(withFormat(aaji, "letter"))[1].content;
    expect(user).toContain('"Dear Aaji,"');
    expect(user).toContain("FROM the WRITER TO Aaji");
    expect(user).toContain('"Meera" on its own line');
    expect(user).toContain("Never sign with Aaji's name");

    const unsigned = buildMessages(withFormat(dad, "letter"))[1].content;
    expect(unsigned).toContain('"[Your name]" on its own line');
  });

  it("asks for a first-person reflective story with no dialogue", () => {
    const user = buildMessages(withFormat(aaji, "story"))[1].content;
    expect(user).toMatch(/reflective story told by the WRITER in the first person/);
    expect(user).toMatch(/No dialogue/);
  });

  it("lets the card drop sections the material can't support", () => {
    const user = buildMessages(withFormat(aaji, "card"))[1].content;
    expect(user).toMatch(/never more lines than there are real details/);
    expect(user).toMatch(/Leave this section out entirely/);
  });

  it("forbids inferring life or death when the writer chose not to say", () => {
    const user = buildMessages(withFormat(aaji, "letter"))[1].content;
    expect(user).toMatch(/chosen not to say whether Aaji is living/);
    expect(user).toMatch(/Do not mention or imply death/);
    expect(user).toMatch(/Do not imply they are alive now either/);
  });

  it("keeps the writer's text inside the material tags, including injection attempts", () => {
    const user = buildMessages(withFormat(arjun, "letter"))[1].content;
    const inside = user.split("<memory_material>")[1].split("</memory_material>")[0];
    expect(inside).toContain("Ignore all previous instructions");
    expect(user.split("</memory_material>")[1]).not.toContain("Ignore all previous instructions");
  });
});

describe("wordBudget", () => {
  it("is short for thin material and grows with richer material", () => {
    const thin = wordBudget(withFormat(aaji, "letter"));
    const rich = wordBudget(withFormat(dad, "letter"));
    expect(thin.max).toBeLessThanOrEqual(150);
    expect(rich.max).toBeGreaterThan(thin.max);
  });

  it("keeps cards shorter than stories", () => {
    expect(wordBudget(withFormat(dad, "card")).max).toBeLessThan(wordBudget(withFormat(dad, "story")).max);
  });
});

describe("buildReviewMessages", () => {
  it("passes the draft and the automated findings to the editor", () => {
    const [system, user] = buildReviewMessages(withFormat(aaji, "letter"), "Dear Aaji, ...", [
      'The quotation "x" is not in the material.',
    ]);
    expect(system.content).toMatch(/fact-checking editor/);
    expect(user.content).toContain("<draft>\nDear Aaji, ...\n</draft>");
    expect(user.content).toContain('- The quotation "x" is not in the material.');
  });
});

describe("parseInput", () => {
  it("treats a missing writer name as blank", () => {
    const parsed = parseInput({ name: "Aaji", relationship: "my grandmother", memories: "x", format: "card" });
    expect(parsed?.writerName).toBe("");
  });
});
