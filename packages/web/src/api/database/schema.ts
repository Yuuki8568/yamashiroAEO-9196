import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * AEO blog schema. One row per published question-answer post.
 * Apply with `bun run db:push` from packages/web.
 */
export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    /** H1 — the question people actually search, written as a question. */
    question: text("question").notNull(),
    /** comparison | best-of | how-to | faq | alternatives */
    category: text("category").notNull(),
    /** The quotable answer, stated outright. 40-160 chars. */
    answer: text("answer").notNull(),
    /** Markdown body (no ** bold). */
    body: text("body").notNull(),
    /** Who this post is for, one line. */
    audience: text("audience").notNull().default(""),
    /** Target keyword + demand data, JSON: {keyword, volume, difficulty, country}. */
    keyword: text("keyword", { mode: "json" })
      .notNull()
      .$type<{ keyword: string; volume: number | null; difficulty: number | null; country: string }>(),
    /** FAQ pairs, JSON: [{q, a}] — rendered and emitted as FAQPage JSON-LD. */
    faq: text("faq", { mode: "json" }).notNull().$type<{ q: string; a: string }[]>().default([]),
    /** Sources, JSON: [{label, url, checkedAt}]. */
    sources: text("sources", { mode: "json" })
      .notNull()
      .$type<{ label: string; url: string; checkedAt: string }[]>()
      .default([]),
    status: text("status").notNull().default("published"),
    publishedAt: integer("published_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("posts_category_idx").on(table.category), index("posts_published_idx").on(table.publishedAt)],
);

/** Per-run log so each scheduled run can report what the previous runs targeted. */
export const runs = sqliteTable("runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ranAt: integer("ran_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  /** Questions considered this run, JSON: [{question, keyword, volume, difficulty, decision}]. */
  targets: text("targets", { mode: "json" }).notNull().$type<Record<string, unknown>[]>().default([]),
  publishedSlugs: text("published_slugs", { mode: "json" }).notNull().$type<string[]>().default([]),
  /** Citation / ranking check on earlier posts, free text. */
  visibilityCheck: text("visibility_check").notNull().default(""),
  notes: text("notes").notNull().default(""),
});
