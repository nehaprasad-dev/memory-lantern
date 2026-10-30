import { describe, expect, it } from "vitest";
import { checkKeepsake, repairKeepsake, type IssueCode } from "@/lib/ai/fidelity";
import { SAMPLES, withFormat } from "../fixtures";

const aajiLetter = withFormat(SAMPLES[0], "letter");
const aajiStory = withFormat(SAMPLES[0], "story");
const dadLetter = withFormat(SAMPLES[1], "letter");

const FAITHFUL_LETTER = `Dear Aaji,

I remember every Sunday, when you made puran poli and hummed old Lata Mangeshkar songs while you cooked. You called me "chimni", and I still smile when I think of it.

Those Sundays are some of the gentlest things I carry.

With love,
Meera`;

const codes = (content: string, input = aajiLetter): IssueCode[] =>
  checkKeepsake(content, input).map((i) => i.code);

describe("checkKeepsake", () => {
  it("accepts a faithful letter in the writer's voice", () => {
    expect(codes(FAITHFUL_LETTER)).toEqual([]);
  });

  it("flags quotations the writer never gave", () => {
    const text = FAITHFUL_LETTER.replace(
      "Those Sundays",
      'You always said "the dough knows when you are in a hurry." Those Sundays',
    );
    expect(codes(text)).toContain("unsupported_quote");
  });

  it("accepts quotations copied from the material", () => {
    const text = `Dear Dad,\n\nYou always said "measure twice, cut once", with a pencil behind your ear.\n\nWith love,\n[Your name]`;
    expect(codes(text, dadLetter)).not.toContain("unsupported_quote");
  });

  it("flags a letter signed as the remembered person", () => {
    const text = FAITHFUL_LETTER.replace("With love,\nMeera", "All my love,\nAaji");
    expect(codes(text)).toContain("impersonation");
  });

  it("flags lines spoken in the remembered person's voice", () => {
    expect(codes(`${FAITHFUL_LETTER}\n\nDon't cry for me, my dear grandchild.`)).toContain("impersonation");
  });

  it("does not treat a story sentence ending in the name as a signature", () => {
    const story = `# Sundays\n\nI remember puran poli every Sunday, Lata Mangeshkar songs, and being called chimni by Aaji.`;
    expect(codes(story, aajiStory)).not.toContain("impersonation");
  });

  it("flags death language when the writer chose not to say", () => {
    const text = FAITHFUL_LETTER.replace("Those Sundays", "Since you passed away, those Sundays");
    expect(codes(text)).toContain("status_assumption");
  });

  it("flags implying the person is alive when the writer chose not to say", () => {
    const text = FAITHFUL_LETTER.replace("Those Sundays", "I can't wait to see you next Sunday. Those Sundays");
    expect(codes(text)).toContain("status_assumption");
  });

  it("allows loss language when the writer said they passed away", () => {
    const text = `Dear Dad,\n\nSince you died in March, I think of your blue toolbox and the bicycles you fixed.\n\nWith love,\n[Your name]`;
    expect(codes(text, dadLetter)).not.toContain("status_assumption");
  });

  it("flags afterlife contact even when the person has passed", () => {
    const text = `Dear Dad,\n\nI know you are watching over me from heaven.\n\nWith love,\n[Your name]`;
    expect(codes(text, dadLetter)).toContain("afterlife_contact");
  });

  it("flags invented places and years", () => {
    const text = FAITHFUL_LETTER.replace("Those Sundays", "In 1987 we moved to Pune. Those Sundays");
    const found = codes(text);
    expect(found).toContain("unsupported_name");
    expect(found).toContain("unsupported_number");
  });

  it("flags greeting-card clichés", () => {
    expect(codes(FAITHFUL_LETTER.replace("Those Sundays", "You were the heart of our home. Those Sundays"))).toContain("cliche");
  });

  it("flags a letter that is not addressed to the remembered person", () => {
    expect(codes(FAITHFUL_LETTER.replace("Dear Aaji,", "Dear chimni,"))).toContain("letter_salutation");
  });

  it("flags padding far beyond what thin material supports", () => {
    const padded = `${FAITHFUL_LETTER.split("\n\nWith love")[0]}\n\n${"I think of you often and with gratitude. ".repeat(30)}\n\nWith love,\nMeera`;
    expect(codes(padded)).toContain("too_long");
  });
});

describe("repairKeepsake", () => {
  it("removes flagged sentences and fixes the salutation and signature", () => {
    const bad = `Dear chimni,

I remember every Sunday, when you made puran poli and hummed old Lata Mangeshkar songs. You always said "patience is the secret ingredient." Since you passed away, I make it alone.

You called me chimni.

All my love,
Aaji`;
    const input = aajiLetter;
    const repaired = repairKeepsake(bad, input, checkKeepsake(bad, input));

    expect(repaired.startsWith("Dear Aaji,")).toBe(true);
    expect(repaired).toContain("puran poli");
    expect(repaired).not.toContain("patience");
    expect(repaired).not.toMatch(/passed away/);
    expect(repaired.trim().endsWith("Meera")).toBe(true);
    expect(checkKeepsake(repaired, input)).toEqual([]);
  });
});
