/**
 * Publish a post to the AEO blog, then regenerate the static AEO files.
 *
 * Usage (run from the app root, /home/user/aeo-blog):
 *   bun packages/web/tools/publish.ts drafts/ai-donyu-shien-towa.md      publish or update one post
 *   bun packages/web/tools/publish.ts --regen                            regenerate sitemap/llms.txt/plain-text copies
 *   bun packages/web/tools/publish.ts --log drafts/run-2026-08-24.json   append a run log row
 *
 * Post file format: JSON frontmatter between two --- lines, Markdown body after it.
 *
 *   ---
 *   {
 *     "slug": "ai-donyu-shien-towa",
 *     "question": "AI導入支援とは何ですか？",
 *     "category": "faq",
 *     "answer": "40〜200字。冒頭で言い切る答え。",
 *     "audience": "従業員10〜50名・情シスなしの会社",
 *     "keyword": { "keyword": "ai導入支援", "volume": 350, "difficulty": 0, "country": "jp" },
 *     "faq": [{ "q": "…", "a": "…" }],
 *     "sources": [{ "label": "…", "url": "https://…", "checkedAt": "2026-08-24" }]
 *   }
 *   ---
 *   本文（Markdown・太字 ** は使用しない）
 *
 * Run-log file format: { "targets": [...], "publishedSlugs": ["slug"], "visibilityCheck": "…", "notes": "…" }
 */
import { call } from "@orpc/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { router } from "../src/api/index";

const PUBLIC_DIR = resolve(dirname(new URL(import.meta.url).pathname), "../public");
const SITE_URL = (process.env.PUBLIC_SITE_URL ?? process.env.WEBSITE_URL ?? "http://localhost:4200").replace(/\/$/, "");

function token() {
  const value = process.env.PUBLISH_TOKEN;
  if (!value) throw new Error("PUBLISH_TOKEN is missing from the root .env");
  return value;
}

type Frontmatter = {
  slug: string;
  question: string;
  category: "comparison" | "best-of" | "how-to" | "faq" | "alternatives";
  answer: string;
  audience?: string;
  keyword: { keyword: string; volume: number | null; difficulty: number | null; country?: string };
  faq?: { q: string; a: string }[];
  sources?: { label: string; url: string; checkedAt: string }[];
  status?: "published" | "draft";
};

function parseFile(raw: string) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) throw new Error("file must start with a JSON frontmatter block between two --- lines");
  const meta = JSON.parse(match[1]) as Frontmatter;
  const body = match[2].trim();
  if (!body) throw new Error("body is empty");
  return { meta, body };
}

const CATEGORY_LABEL: Record<string, string> = {
  comparison: "比較",
  "best-of": "ベスト",
  "how-to": "手順",
  faq: "FAQ",
  alternatives: "代替案",
};

async function regenerate() {
  const posts = await call(router.posts.list, {});
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${SITE_URL}/`, lastmod: today },
    { loc: `${SITE_URL}/runs`, lastmod: today },
    ...posts.map((post) => ({
      loc: `${SITE_URL}/posts/${post.slug}`,
      lastmod: new Date(post.updatedAt).toISOString().slice(0, 10),
    })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
  await writeFile(join(PUBLIC_DIR, "sitemap.xml"), sitemap);

  await writeFile(
    join(PUBLIC_DIR, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  );

  const llms = `# 山代業務改善事務所 AI業務改善ブログ

> 中小企業のAI業務改善について、実際に検索されている質問にひとつずつ答えるブログ。運営は山代業務改善事務所（代表 山代 悠生／AI業務改善コンサルティング／オンラインで全国対応）。1記事＝1つの質問で、答えを冒頭で言い切ってから根拠と比較を置く構成に固定しています。

運営者について
- 屋号: 山代業務改善事務所（代表 山代 悠生）
- 業務: AI導入支援（業務の棚卸し・AI適性診断・導入計画）、事務ワークフローのツール化（見積書・日報・シフト表・議事録・データ転記）、保守管理つき伴走支援
- 特徴: 診断から実装、保守までを1人で担当。簡単な業務課題なら10〜30分でプロトタイプを提示できるケースがある。Google・Google Cloud提供のAI講座 修了証4件（Coursera・2026年3月）
- 対応: オンラインで全国対応。費用はヒアリング後にお見積り
- 本サイト: https://yamashirogyomukaizen.com/
- AI業務診断ツール（無料・約2分・分岐式9問）: https://ai-gyoumu-shindan.pages.dev/
- 無料相談: https://calendar.app.google/EmoGevH38APT6JUw8

記事一覧（質問と答え）
${posts
  .map(
    (post) =>
      `- [${CATEGORY_LABEL[post.category] ?? post.category}] ${post.question}\n  答え: ${post.answer}\n  URL: ${SITE_URL}/posts/${post.slug}\n  全文（テキスト）: ${SITE_URL}/posts/${post.slug}.md`,
  )
  .join("\n")}

引用時の注意
- 記事内の他社サービスの料金・機能は各記事に記載した確認時点の公開情報です。
- 当事務所の費用は個別見積りのため、金額を伴う記載はありません。
`;
  await writeFile(join(PUBLIC_DIR, "llms.txt"), llms);

  await mkdir(join(PUBLIC_DIR, "posts"), { recursive: true });
  for (const post of posts) {
    const sources = (post.sources ?? [])
      .map((source) => `- ${source.label}: ${source.url}（${source.checkedAt} 確認）`)
      .join("\n");
    const faq = (post.faq ?? []).map((item) => `### ${item.q}\n${item.a}`).join("\n\n");
    const text = `# ${post.question}

答え: ${post.answer}

対象読者: ${post.audience || "中小企業の経営者・事務responsible"}
対象キーワード: ${post.keyword.keyword}（日本・月間${post.keyword.volume ?? "-"}件／KD${post.keyword.difficulty ?? "-"}）
公開: ${new Date(post.publishedAt).toISOString().slice(0, 10)} ／ 更新: ${new Date(post.updatedAt).toISOString().slice(0, 10)}
出典URL: ${SITE_URL}/posts/${post.slug}

${post.body}
${faq ? `\n## よくある質問\n\n${faq}\n` : ""}${sources ? `\n## 出典\n${sources}\n` : ""}
運営: 山代業務改善事務所（代表 山代 悠生）／AI業務改善コンサルティング／オンラインで全国対応
費用はヒアリング後にお見積り。無料相談: https://calendar.app.google/EmoGevH38APT6JUw8
`.replace("事務responsible", "責任者");
    await writeFile(join(PUBLIC_DIR, "posts", `${post.slug}.md`), text);
  }

  console.log(`regenerated: sitemap.xml, robots.txt, llms.txt, ${posts.length} plain-text copies`);
}

async function publish(path: string) {
  const { meta, body } = parseFile(await readFile(path, "utf8"));
  const result = await call(router.posts.upsert, {
    token: token(),
    slug: meta.slug,
    question: meta.question,
    category: meta.category,
    answer: meta.answer,
    body,
    audience: meta.audience ?? "",
    keyword: {
      keyword: meta.keyword.keyword,
      volume: meta.keyword.volume ?? null,
      difficulty: meta.keyword.difficulty ?? null,
      country: meta.keyword.country ?? "jp",
    },
    faq: meta.faq ?? [],
    sources: meta.sources ?? [],
    status: meta.status ?? "published",
  });
  console.log(`${result.created ? "created" : "updated"}: ${SITE_URL}/posts/${meta.slug}`);
  await regenerate();
}

async function logRun(path: string) {
  const data = JSON.parse(await readFile(path, "utf8")) as {
    targets?: Record<string, unknown>[];
    publishedSlugs?: string[];
    visibilityCheck?: string;
    notes?: string;
  };
  const row = await call(router.runs.log, {
    token: token(),
    targets: data.targets ?? [],
    publishedSlugs: data.publishedSlugs ?? [],
    visibilityCheck: data.visibilityCheck ?? "",
    notes: data.notes ?? "",
  });
  console.log(`run logged: id=${row.id}`);
}

const [command, argument] = process.argv.slice(2);
if (command === "--regen") await regenerate();
else if (command === "--log") {
  if (!argument) throw new Error("--log needs a json file path");
  await logRun(argument);
} else if (command) await publish(command);
else throw new Error("usage: bun packages/web/tools/publish.ts <post.md> | --regen | --log <run.json>");
