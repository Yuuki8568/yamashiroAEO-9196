import { ORPCError } from "@orpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";

const CATEGORIES = ["comparison", "best-of", "how-to", "faq", "alternatives"] as const;

const keywordSchema = z.object({
  keyword: z.string(),
  volume: z.number().nullable(),
  difficulty: z.number().nullable(),
  country: z.string().default("jp"),
});

const upsertSchema = z.object({
  token: z.string(),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "slug is lowercase ascii and hyphens only"),
  question: z.string().min(6),
  category: z.enum(CATEGORIES),
  answer: z.string().min(20).max(400),
  body: z.string().min(200),
  audience: z.string().default(""),
  keyword: keywordSchema,
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  sources: z.array(z.object({ label: z.string(), url: z.string(), checkedAt: z.string() })).default([]),
  status: z.enum(["published", "draft"]).default("published"),
});

function assertToken(token: string) {
  const expected = process.env.PUBLISH_TOKEN;
  if (!expected || token !== expected) throw new ORPCError("UNAUTHORIZED", { message: "invalid publish token" });
}

/** Markdown bold is banned site-wide, and so are the phrases on the NG list. */
const NG_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\*\*/, reason: "Markdown太字（**）は使用しない" },
  { pattern: /完全自動化|全部自動化|AIで全部解決|AIで全て解決/, reason: "「完全自動化」「AIで全部解決」系の表現は禁止" },
  { pattern: /ROI(を)?(保証|確約)|売上(が)?(必ず|確実に)(上がる|伸びる)/, reason: "ROI・売上保証は禁止" },
  { pattern: /私の支援先|相談を受ける中で|私もそうでした/, reason: "体験談風の表現は禁止" },
  { pattern: /申請代行|採択される|採択できます/, reason: "補助金の申請代行・採択の示唆は禁止" },
];

function lintBody(text: string) {
  return NG_PATTERNS.filter((rule) => rule.pattern.test(text)).map((rule) => rule.reason);
}

export const posts = {
  list: base
    .input(z.object({ category: z.enum(CATEGORIES).optional() }).optional())
    .handler(async ({ input }) => {
      const rows = await db.select().from(schema.posts).orderBy(desc(schema.posts.publishedAt));
      const published = rows.filter((row) => row.status === "published");
      return input?.category ? published.filter((row) => row.category === input.category) : published;
    }),

  get: base.input(z.object({ slug: z.string() })).handler(async ({ input }) => {
    const [post] = await db.select().from(schema.posts).where(eq(schema.posts.slug, input.slug));
    if (!post) throw new ORPCError("NOT_FOUND", { message: "post not found" });
    return post;
  }),

  /** Used by the daily scheduled run and by the /write editor. */
  upsert: base.input(upsertSchema).handler(async ({ input }) => {
    assertToken(input.token);
    const violations = lintBody(`${input.answer}\n${input.body}`);
    if (violations.length > 0) throw new ORPCError("BAD_REQUEST", { message: `NG違反: ${violations.join(" / ")}` });

    const { token: _token, ...values } = input;
    const [existing] = await db.select().from(schema.posts).where(eq(schema.posts.slug, input.slug));
    if (existing) {
      const [row] = await db
        .update(schema.posts)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(schema.posts.slug, input.slug))
        .returning();
      return { post: row, created: false };
    }
    const [row] = await db
      .insert(schema.posts)
      .values({ ...values, publishedAt: new Date(), updatedAt: new Date() })
      .returning();
    return { post: row, created: true };
  }),

  remove: base.input(z.object({ token: z.string(), slug: z.string() })).handler(async ({ input }) => {
    assertToken(input.token);
    await db.delete(schema.posts).where(eq(schema.posts.slug, input.slug));
    return { ok: true };
  }),
};

export const runs = {
  list: base.handler(() => db.select().from(schema.runs).orderBy(desc(schema.runs.ranAt)).limit(30)),

  log: base
    .input(
      z.object({
        token: z.string(),
        targets: z.array(z.record(z.string(), z.unknown())).default([]),
        publishedSlugs: z.array(z.string()).default([]),
        visibilityCheck: z.string().default(""),
        notes: z.string().default(""),
      }),
    )
    .handler(async ({ input }) => {
      assertToken(input.token);
      const { token: _token, ...values } = input;
      const [row] = await db
        .insert(schema.runs)
        .values({ ...values, ranAt: new Date() })
        .returning();
      return row;
    }),
};
