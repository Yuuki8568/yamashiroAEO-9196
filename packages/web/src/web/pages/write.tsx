import { Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "../lib/site";
import { useUpsertPost } from "../queries/posts";

type Category = "comparison" | "best-of" | "how-to" | "faq" | "alternatives";
type Pair = { q: string; a: string };
type Source = { label: string; url: string; checkedAt: string };

/** Mirrors the server-side NG linter so violations show before submitting. */
const NG_RULES: { pattern: RegExp; reason: string }[] = [
  { pattern: /\*\*/, reason: "Markdown太字（**）は使用しない" },
  { pattern: /完全自動化|全部自動化|AIで全部解決|AIで全て解決/, reason: "「完全自動化」「AIで全部解決」系の表現は禁止" },
  { pattern: /ROI(を)?(保証|確約)|売上(が)?(必ず|確実に)(上がる|伸びる)/, reason: "ROI・売上保証は禁止" },
  { pattern: /私の支援先|相談を受ける中で|私もそうでした/, reason: "体験談風の表現は禁止" },
  { pattern: /申請代行|採択される|採択できます/, reason: "補助金の申請代行・採択の示唆は禁止" },
];

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-dim/70 focus:border-brand/70";
const labelClass = "block text-[0.78rem] font-medium tracking-wide text-ink-dim";

export default function WritePage() {
  const upsert = useUpsertPost();
  const [token, setToken] = useState("");
  const [slug, setSlug] = useState("");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<Category>("faq");
  const [answer, setAnswer] = useState("");
  const [audience, setAudience] = useState("");
  const [body, setBody] = useState("");
  const [keyword, setKeyword] = useState("");
  const [volume, setVolume] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [faq, setFaq] = useState<Pair[]>([{ q: "", a: "" }]);
  const [sources, setSources] = useState<Source[]>([
    { label: "", url: "", checkedAt: new Date().toISOString().slice(0, 10) },
  ]);
  const [result, setResult] = useState<string>("");

  const violations = useMemo(() => {
    const text = `${answer}\n${body}`;
    return NG_RULES.filter((rule) => rule.pattern.test(text)).map((rule) => rule.reason);
  }, [answer, body]);

  const ready = token && slug.length >= 3 && question.length >= 6 && answer.length >= 20 && body.length >= 200;

  async function submit() {
    setResult("");
    try {
      const response = await upsert.mutateAsync({
        token,
        slug,
        question,
        category,
        answer,
        body,
        audience,
        keyword: {
          keyword: keyword || question,
          volume: volume ? Number(volume) : null,
          difficulty: difficulty ? Number(difficulty) : null,
          country: "jp",
        },
        faq: faq.filter((pair) => pair.q && pair.a),
        sources: sources.filter((source) => source.label && source.url),
        status: "published",
      });
      setResult(`${response.created ? "公開しました" : "更新しました"}：/posts/${response.post?.slug ?? slug}`);
    } catch (error) {
      setResult(error instanceof Error ? `失敗：${error.message}` : "失敗しました");
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <p className="section-label">Editor</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-ink">記事を書く</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        1記事＝1つの質問。H1に質問をそのまま置き、答えを冒頭2〜3行で言い切る形式に固定しています。公開にはPUBLISH_TOKENが必要です。
      </p>

      <div className="mt-9 space-y-6">
        <div>
          <label className={labelClass} htmlFor="token">
            PUBLISH_TOKEN
          </label>
          <input
            id="token"
            aria-label="PUBLISH_TOKEN"
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className={`${inputClass} mt-2`}
            placeholder="ルートの .env に設定した値"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div>
            <label className={labelClass} htmlFor="slug">
              スラッグ（英小文字・数字・ハイフン）
            </label>
            <input
              id="slug"
              aria-label="スラッグ"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className={`${inputClass} mt-2 font-mono`}
              placeholder="ai-donyu-shien-towa"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="category">
              カテゴリ
            </label>
            <select
              id="category"
              aria-label="カテゴリ"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
              className={`${inputClass} mt-2`}
            >
              {CATEGORY_ORDER.map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_LABELS[key]?.label ?? key}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="question">
            H1（検索されている質問そのまま）
          </label>
          <input
            id="question"
            aria-label="H1（検索されている質問）"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className={`${inputClass} mt-2`}
            placeholder="AI導入支援とは何ですか？"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="answer">
            答え（冒頭で言い切る2〜3行・40〜200字）
          </label>
          <textarea
            id="answer"
            aria-label="答え"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            rows={3}
            className={`${inputClass} mt-2 leading-relaxed`}
          />
          <p className="mt-1.5 font-mono text-[0.72rem] text-ink-dim">{answer.length} 字</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="audience">
            対象読者（1行）
          </label>
          <input
            id="audience"
            aria-label="対象読者"
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            className={`${inputClass} mt-2`}
            placeholder="従業員10〜50名・情シス担当がいない会社の経営者と事務責任者"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label className={labelClass} htmlFor="keyword">
              対象キーワード
            </label>
            <input
              id="keyword"
              aria-label="対象キーワード"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className={`${inputClass} mt-2 font-mono`}
              placeholder="ai導入支援"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="volume">
              月間検索数
            </label>
            <input
              id="volume"
              aria-label="月間検索数"
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
              className={`${inputClass} mt-2 font-mono`}
              placeholder="350"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="difficulty">
              KD
            </label>
            <input
              id="difficulty"
              aria-label="キーワード難易度"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className={`${inputClass} mt-2 font-mono`}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="body">
            本文（Markdown・太字は使わない）
          </label>
          <textarea
            id="body"
            aria-label="本文"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={18}
            className={`${inputClass} mt-2 font-mono text-[0.82rem] leading-relaxed`}
          />
          <p className="mt-1.5 font-mono text-[0.72rem] text-ink-dim">{body.length} 字</p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className={labelClass}>FAQ（FAQPage構造化データになります）</p>
            <button
              type="button"
              onClick={() => setFaq([...faq, { q: "", a: "" }])}
              className="inline-flex items-center gap-1 text-[0.78rem] text-brand-soft hover:underline"
            >
              <Plus className="size-3.5" />
              追加
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {faq.map((pair, index) => (
              <div key={index} className="rounded-md border border-border p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <input
                      value={pair.q}
                      onChange={(event) =>
                        setFaq(faq.map((item, i) => (i === index ? { ...item, q: event.target.value } : item)))
                      }
                      className={inputClass}
                      placeholder="質問"
                      aria-label="FAQの質問"
                    />
                    <textarea
                      value={pair.a}
                      onChange={(event) =>
                        setFaq(faq.map((item, i) => (i === index ? { ...item, a: event.target.value } : item)))
                      }
                      rows={2}
                      className={inputClass}
                      placeholder="答え"
                      aria-label="FAQの答え"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFaq(faq.filter((_, i) => i !== index))}
                    className="mt-2 text-ink-dim hover:text-brand-soft"
                    aria-label="削除"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className={labelClass}>出典（他社の料金・機能に触れたら必須）</p>
            <button
              type="button"
              onClick={() =>
                setSources([...sources, { label: "", url: "", checkedAt: new Date().toISOString().slice(0, 10) }])
              }
              className="inline-flex items-center gap-1 text-[0.78rem] text-brand-soft hover:underline"
            >
              <Plus className="size-3.5" />
              追加
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {sources.map((source, index) => (
              <div key={index} className="flex items-start gap-2 rounded-md border border-border p-3">
                <div className="grid flex-1 gap-2 sm:grid-cols-[1.2fr_1.4fr_0.7fr]">
                  <input
                    value={source.label}
                    onChange={(event) =>
                      setSources(sources.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))
                    }
                    className={inputClass}
                    placeholder="出典名"
                    aria-label="出典名"
                  />
                  <input
                    value={source.url}
                    onChange={(event) =>
                      setSources(sources.map((item, i) => (i === index ? { ...item, url: event.target.value } : item)))
                    }
                    className={`${inputClass} font-mono text-[0.78rem]`}
                    placeholder="https://"
                    aria-label="出典URL"
                  />
                  <input
                    value={source.checkedAt}
                    onChange={(event) =>
                      setSources(
                        sources.map((item, i) => (i === index ? { ...item, checkedAt: event.target.value } : item)),
                      )
                    }
                    className={`${inputClass} font-mono text-[0.78rem]`}
                    placeholder="2026-08-24"
                    aria-label="確認日"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSources(sources.filter((_, i) => i !== index))}
                  className="mt-2 text-ink-dim hover:text-brand-soft"
                  aria-label="削除"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {violations.length > 0 && (
          <div className="rounded-md border border-brand/50 bg-brand/10 p-4 text-sm text-ink">
            <p className="font-medium">NGルール違反があります</p>
            <ul className="mt-2 space-y-1 text-[0.82rem] text-ink-dim">
              {violations.map((reason) => (
                <li key={reason}>・{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={submit}
            disabled={!ready || violations.length > 0 || upsert.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {upsert.isPending && <Loader2 className="size-4 animate-spin" />}
            公開する
          </button>
          {result && <p className="text-sm text-ink-dim">{result}</p>}
        </div>
      </div>
    </section>
  );
}
