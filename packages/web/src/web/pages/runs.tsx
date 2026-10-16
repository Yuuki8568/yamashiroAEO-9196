import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Head } from "../components/head";
import { SITE, formatDate } from "../lib/site";
import { useRuns } from "../queries/posts";

type Target = { question?: unknown; keyword?: unknown; volume?: unknown; difficulty?: unknown; decision?: unknown };

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export default function RunsPage() {
  const runs = useRuns();
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return (
    <>
      <Head
        title="更新ログ｜AI業務改善ブログ"
        description="このブログの各更新回で、どの質問を狙い、何を公開し、既存記事が引用・掲載されているかを記録しています。"
        canonical={`${origin}/runs`}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-5 py-14">
          <p className="section-label rise">Run log</p>
          <h1 className="rise mt-4 font-display text-2xl leading-snug font-semibold text-ink sm:text-[2rem]">更新ログ</h1>
          <p className="rise mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-ink-dim">
            1回の更新で狙った質問（検索ボリュームとKD）、公開した記事、既存記事の掲載状況の確認結果をそのまま残しています。何を根拠に記事を選んだかを後から検証できるようにするためです。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10">
        {runs.isLoading ? (
          <div className="flex items-center gap-2 py-16 text-sm text-ink-dim">
            <Loader2 className="size-4 animate-spin" />
            読み込み中
          </div>
        ) : (runs.data ?? []).length === 0 ? (
          <p className="py-16 text-sm text-ink-dim">まだ更新ログがありません。</p>
        ) : (
          <ol className="space-y-8">
            {(runs.data ?? []).map((run) => {
              const targets = (run.targets ?? []) as Target[];
              return (
                <li key={run.id} className="rounded-lg border border-border bg-surface p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="font-mono text-[0.8rem] text-brand-soft">{formatDate(run.ranAt)}</p>
                    <p className="text-[0.75rem] text-ink-dim">公開 {run.publishedSlugs.length} 本</p>
                  </div>

                  {targets.length > 0 && (
                    <div className="mt-5">
                      <p className="section-label">狙った質問</p>
                      <ul className="mt-3 space-y-2.5 text-sm">
                        {targets.map((target, index) => (
                          <li key={index} className="leading-relaxed text-ink">
                            {text(target.question) || text(target.keyword)}
                            <span className="ml-2 font-mono text-[0.72rem] text-ink-dim">
                              {text(target.keyword)}
                              {target.volume !== undefined && ` ／ ${text(target.volume)}件/月`}
                              {target.difficulty !== undefined && ` ／ KD${text(target.difficulty)}`}
                            </span>
                            {text(target.decision) && (
                              <span className="mt-0.5 block text-[0.8rem] text-ink-dim">{text(target.decision)}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {run.publishedSlugs.length > 0 && (
                    <div className="mt-5">
                      <p className="section-label">公開した記事</p>
                      <ul className="mt-3 space-y-1.5 text-sm">
                        {run.publishedSlugs.map((slug) => (
                          <li key={slug}>
                            <Link to={`/posts/${slug}`} className="text-brand-soft hover:underline">
                              /posts/{slug}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {run.visibilityCheck && (
                    <div className="mt-5">
                      <p className="section-label">掲載・順位の確認</p>
                      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-dim">
                        {run.visibilityCheck}
                      </p>
                    </div>
                  )}

                  {run.notes && (
                    <div className="mt-5">
                      <p className="section-label">メモ</p>
                      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-dim">{run.notes}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <p className="mt-12 text-sm text-ink-dim">
          運営元：
          <a href={SITE.mainSite} className="text-brand-soft hover:underline">
            山代業務改善事務所
          </a>
        </p>
      </section>
    </>
  );
}
