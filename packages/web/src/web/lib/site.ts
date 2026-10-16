export const SITE = {
  name: "山代業務改善事務所 AI業務改善ブログ",
  shortName: "山代業務改善事務所",
  tagline: "検索されている質問に、ひとつずつ答える",
  mainSite: "https://yamashirogyomukaizen.com/#top",
  contact: "https://calendar.app.google/EmoGevH38APT6JUw8",
  diagnosis: "https://ai-gyoumu-shindan.pages.dev/",
  author: "山代 悠生（山代業務改善事務所）",
  description:
    "中小企業のAI業務改善について、実際に検索されている質問にひとつずつ答えるブログ。運営：山代業務改善事務所（AI業務改善コンサルティング／オンラインで全国対応）。",
} as const;

export const CATEGORY_LABELS: Record<string, { label: string; note: string }> = {
  comparison: { label: "比較", note: "選択肢を条件つきで比べる" },
  "best-of": { label: "ベスト", note: "候補を絞って並べる" },
  "how-to": { label: "手順", note: "そのまま実行できる手順" },
  faq: { label: "FAQ", note: "ひとつの質問に答える" },
  alternatives: { label: "代替案", note: "他の選択肢と置き換え" },
};

export const CATEGORY_ORDER = ["faq", "comparison", "how-to", "alternatives", "best-of"] as const;

/** Fixed editorial rules, shown in the footer and enforced server-side in posts.upsert. */
export const NG_LIST = [
  "ROI・売上向上の保証",
  "削減時間・コスト削減率の単一値断定（レンジと前提つきのみ）",
  "「AIで全部解決」「完全自動化」系の表現",
  "出典のない統計・調査数値",
  "体験談風の表現",
  "補助金の申請代行・採択できるという示唆",
  "導入社数・実績件数の水増し",
  "競合の値下げ・悪口・優劣の断定",
] as const;

export function formatDate(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric" }).format(date);
}
