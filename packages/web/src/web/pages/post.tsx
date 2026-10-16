import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { Link, useParams } from "wouter";
import { ArticleBody } from "../components/article-body";
import { Head } from "../components/head";
import { CATEGORY_LABELS, SITE, formatDate } from "../lib/site";
import { usePost } from "../queries/posts";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = usePost(slug);
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  if (post.isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-24 text-sm text-ink-dim">
        <Loader2 className="size-4 animate-spin" />
        読み込んでいます
      </div>
    );
  }

  if (post.isError || !post.data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24">
        <p className="text-ink">この記事は見つかりませんでした。</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-1 text-sm text-brand-soft hover:underline">
          <ArrowLeft className="size-3.5" />
          記事一覧へ
        </Link>
      </div>
    );
  }

  const data = post.data;
  const url = `${origin}/posts/${data.slug}`;
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.question,
      description: data.answer,
      inLanguage: "ja",
      datePublished: new Date(data.publishedAt).toISOString(),
      dateModified: new Date(data.updatedAt).toISOString(),
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Person", name: "山代 悠生", url: "https://yamashirogyomukaizen.com/" },
      publisher: { "@type": "Organization", name: "山代業務改善事務所", url: "https://yamashirogyomukaizen.com/" },
    },
  ];

  const faq = data.faq ?? [];
  if (faq.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  return (
    <>
      <Head title={`${data.question}｜山代業務改善事務所`} description={data.answer} canonical={url} jsonLd={jsonLd} />

      <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-1 text-[0.8rem] text-ink-dim hover:text-ink">
          <ArrowLeft className="size-3.5" />
          記事一覧
        </Link>

        <div className="rise mt-7 flex flex-wrap items-center gap-3 text-[0.72rem]">
          <span className="rounded bg-brand/15 px-2 py-0.5 font-display tracking-wide text-brand-soft">
            {CATEGORY_LABELS[data.category]?.label ?? data.category}
          </span>
          <span className="font-mono text-ink-dim">公開 {formatDate(data.publishedAt)}</span>
          <span className="font-mono text-ink-dim">更新 {formatDate(data.updatedAt)}</span>
        </div>

        <h1 className="rise mt-4 font-display text-[1.75rem] leading-[1.4] font-semibold text-ink sm:text-[2.1rem]">
          {data.question}
        </h1>

        <div className="rise mt-7 rounded-lg border border-brand/40 bg-brand/[0.09] p-5 sm:p-6">
          <p className="section-label">答え</p>
          <p className="mt-2.5 text-[1.05rem] leading-[1.85] font-medium text-ink">{data.answer}</p>
        </div>

        {data.audience ? (
          <p className="mt-5 border-l-2 border-border pl-3.5 text-[0.85rem] leading-relaxed text-ink-dim">
            この記事の対象：{data.audience}
          </p>
        ) : null}

        <div className="mt-10">
          <ArticleBody markdown={data.body} />
        </div>

        {faq.length > 0 ? (
          <section className="mt-16">
            <p className="section-label">FAQ</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink">よくある質問</h2>
            <dl className="mt-5 divide-y divide-border border-y border-border">
              {faq.map((item) => (
                <div key={item.q} className="py-5">
                  <dt className="font-display text-[0.98rem] font-semibold text-ink">{item.q}</dt>
                  <dd className="mt-2 text-[0.925rem] leading-relaxed text-ink-dim">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {data.sources && data.sources.length > 0 ? (
          <section className="mt-14">
            <p className="section-label">Sources</p>
            <h2 className="mt-2 font-display text-lg font-semibold text-ink">出典</h2>
            <ul className="mt-4 space-y-2 text-[0.85rem]">
              {data.sources.map((source) => (
                <li key={source.url} className="flex flex-wrap gap-x-2 text-ink-dim">
                  <a href={source.url} className="text-brand-soft hover:underline" rel="nofollow noopener">
                    {source.label}
                  </a>
                  <span className="font-mono text-[0.78rem]">（{source.checkedAt} 確認）</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.78rem] leading-relaxed text-ink-dim">
              他社サービスの料金・機能は確認時点の公開情報です。最新の内容は各社の公式サイトでご確認ください。
            </p>
          </section>
        ) : null}

        <section className="mt-16 rounded-lg border border-border bg-surface p-6 sm:p-7">
          <p className="section-label">この記事を書いた事務所</p>
          <h2 className="mt-2 font-display text-lg font-semibold text-ink">山代業務改善事務所（代表：山代 悠生）</h2>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-dim">
            中小企業のAI業務改善コンサルティング。業務の棚卸しと独自の診断ロジックで導入の当たりどころを整理し、見積書・日報・議事録・シフトなど事務の繰り返し作業を実際に動くツールに落とし込み、導入後の保守管理まで引き受けて定着まで伴走します。診断・実装・保守を1人で担当。簡単な業務課題であれば10〜30分でプロトタイプをお見せできるケースもあります。オンラインで全国対応、相談だけでも構いません。費用は業務内容と規模により、ヒアリングのうえお見積りします。
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <a
              href={SITE.contact}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
            >
              無料相談を予約する
              <ArrowUpRight className="size-3.5" />
            </a>
            <a
              href={SITE.diagnosis}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2.5 text-ink transition-colors hover:border-brand/60"
            >
              AI業務診断（無料・約2分・分岐式9問）
            </a>
          </div>
        </section>
      </article>
    </>
  );
}
