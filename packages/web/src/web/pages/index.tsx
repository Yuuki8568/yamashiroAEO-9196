import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Head } from "../components/head";
import { CATEGORY_LABELS, CATEGORY_ORDER, SITE, formatDate } from "../lib/site";
import { usePosts } from "../queries/posts";

export default function Index() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const posts = usePosts(category);
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return (
    <>
      <Head
        title="AI業務改善ブログ｜山代業務改善事務所"
        description={SITE.description}
        canonical={`${origin}/`}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: SITE.name,
            description: SITE.description,
            url: `${origin}/`,
            inLanguage: "ja",
            publisher: {
              "@type": "Organization",
              name: "山代業務改善事務所",
              url: "https://yamashirogyomukaizen.com/",
            },
          },
        ]}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
          <p className="section-label rise">Questions & Answers</p>
          <h1 className="rise mt-4 max-w-3xl font-display text-3xl leading-[1.25] font-semibold text-ink sm:text-[2.6rem]">
            検索されている質問に、
            <br className="hidden sm:block" />
            ひとつずつ答えていくブログ
          </h1>
          <p className="rise mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-ink-dim">
            中小企業のAI業務改善について、実際に検索されている質問だけを取り上げます。1記事＝1つの質問。答えを冒頭で言い切り、その後ろに根拠と比較を置く構成に固定しています。運営は
            <a href={SITE.mainSite} className="text-brand-soft hover:underline">
              山代業務改善事務所
            </a>
            （AI業務改善コンサルティング／オンラインで全国対応）。
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3 text-sm">
            <a
              href={SITE.contact}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
            >
              無料相談を予約する
              <ArrowRight className="size-4" />
            </a>
            <a
              href={SITE.diagnosis}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2.5 text-ink transition-colors hover:border-brand/60"
            >
              AI業務診断を試す（無料・約2分）
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={`rounded-full border px-3.5 py-1.5 text-[0.8rem] transition-colors ${
              category === undefined ? "border-brand bg-brand/15 text-ink" : "border-border text-ink-dim hover:text-ink"
            }`}
          >
            すべて
          </button>
          {CATEGORY_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`rounded-full border px-3.5 py-1.5 text-[0.8rem] transition-colors ${
                category === key ? "border-brand bg-brand/15 text-ink" : "border-border text-ink-dim hover:text-ink"
              }`}
            >
              {CATEGORY_LABELS[key].label}
            </button>
          ))}
        </div>

        {posts.isLoading ? (
          <div className="flex items-center gap-2 py-16 text-sm text-ink-dim">
            <Loader2 className="size-4 animate-spin" />
            記事を読み込んでいます
          </div>
        ) : posts.data && posts.data.length > 0 ? (
          <ul className="mt-8 divide-y divide-border border-t border-border">
            {posts.data.map((post, i) => (
              <li key={post.slug} className="rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <Link to={`/posts/${post.slug}`} className="group block py-7">
                  <div className="flex flex-wrap items-center gap-3 text-[0.72rem]">
                    <span className="rounded bg-brand/15 px-2 py-0.5 font-display tracking-wide text-brand-soft">
                      {CATEGORY_LABELS[post.category]?.label ?? post.category}
                    </span>
                    <span className="font-mono text-ink-dim">{formatDate(post.publishedAt)}</span>
                    {post.keyword?.volume ? (
                      <span className="font-mono text-ink-dim">
                        対象KW: {post.keyword.keyword}（月{post.keyword.volume.toLocaleString()}検索
                        {post.keyword.difficulty !== null ? ` / KD${post.keyword.difficulty}` : ""}）
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 font-display text-xl leading-snug font-semibold text-ink transition-colors group-hover:text-brand-soft">
                    {post.question}
                  </h2>
                  <p className="mt-2.5 max-w-3xl text-[0.925rem] leading-relaxed text-ink-dim">{post.answer}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[0.8rem] text-brand-soft">
                    続きを読む
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-16 text-sm text-ink-dim">
            このカテゴリの記事はまだありません。
            <Link to="/write" className="ml-1 text-brand-soft hover:underline">
              新しい記事を書く
            </Link>
          </p>
        )}
      </section>
    </>
  );
}
