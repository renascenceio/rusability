import "server-only";
import { getSetting, putSetting } from "./settings";

/**
 * Learning store for the news classifier. Every editorial decision is recorded
 * as a labelled example title:
 *  - good: items the editor RELEASED from «Спорные» (these ARE news we want)
 *  - bad:  items the editor marked «Неверная тема» / rejected (article, wrong
 *          region, or off-topic)
 * Recent examples are injected into the rewrite/classifier prompt as few-shot
 * guidance, so the model's news/article + geo judgment sharpens with use.
 *
 * Stored in site_settings under one key (no migration). Capped so the prompt
 * stays small; newest examples win.
 */
const KEY = "news_class_examples";
const CAP = 40;

export type ClassExamples = { good: string[]; bad: string[] };

export async function getClassExamples(): Promise<ClassExamples> {
  const v = await getSetting<ClassExamples>(KEY, { good: [], bad: [] });
  return {
    good: Array.isArray(v.good) ? v.good : [],
    bad: Array.isArray(v.bad) ? v.bad : [],
  };
}

function clean(title: string): string {
  return title.replace(/\s+/g, " ").trim().slice(0, 140);
}

async function addExample(kind: "good" | "bad", title: string): Promise<ClassExamples> {
  const t = clean(title);
  const cur = await getClassExamples();
  if (!t) return cur;
  // De-dupe (case-insensitive) and keep the newest at the end.
  const lower = t.toLowerCase();
  const list = cur[kind].filter((x) => x.toLowerCase() !== lower);
  list.push(t);
  const next: ClassExamples = { ...cur, [kind]: list.slice(-CAP) };
  await putSetting(KEY, next);
  return next;
}

/** Record a title the editor confirmed as good news (released from «Спорные»). */
export function addGoodExample(title: string) {
  return addExample("good", title);
}

/** Record a title the editor rejected (wrong topic / article / wrong region). */
export function addBadExample(title: string) {
  return addExample("bad", title);
}
