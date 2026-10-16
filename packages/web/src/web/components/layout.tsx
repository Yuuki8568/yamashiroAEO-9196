import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { NG_LIST, SITE } from "../lib/site";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
          <Link to="/" className="group flex items-baseline gap-2.5">
            <span className="font-display text-[0.95rem] font-semibold tracking-tight text-ink">
              山代業務改善事務所
            </span>
            <span className="hidden text-[0.7rem] tracking-[0.18em] text-brand-soft uppercase sm:inline">Blog</span>
          </Link>
          <nav className="flex items-center gap-1.5 text-[0.8rem] sm:gap-4">
            <a
              href={SITE.mainSite}
              className="hidden text-ink-dim transition-colors hover:text-ink sm:inline-flex sm:items-center sm:gap-1"
            >
              本サイト
              <ExternalLink className="size-3" />
            </a>
            <a
              href={SITE.contact}
              className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-2 font-medium text-white transition-opacity hover:opacity-90"
            >
              無料相談
              <ArrowUpRight className="size-3.5" />
            </a>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-24 border-t border-border bg-surface">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-display text-base font-semibold text-ink">山代業務改善事務所</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              中小企業のAI業務改善コンサルティング。業務の棚卸しから診断、実際に動くツールの制作、導入後の保守管理まで1人で担当します。オンラインで全国対応。
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <a href={SITE.mainSite} className="text-brand-soft hover:underline">
                本サイト
              </a>
              <a href={SITE.diagnosis} className="text-brand-soft hover:underline">
                AI業務診断ツール（無料・約2分）
              </a>
              <a href={SITE.contact} className="text-brand-soft hover:underline">
                無料相談を予約
              </a>
              <Link to="/runs" className="text-ink-dim hover:text-ink">
                更新ログ
              </Link>
            </div>
          </div>
          <div>
            <p className="section-label">Editorial rules</p>
            <p className="mt-3 text-sm text-ink-dim">このブログで書かないことを固定しています。</p>
            <ul className="mt-3 space-y-1.5 text-[0.8rem] leading-relaxed text-ink-dim">
              {NG_LIST.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span className="text-brand">×</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border/70 px-5 py-5 text-center text-xs text-ink-dim">
          © 2026 山代業務改善事務所 ／ 記事内の他社サービスの料金・機能は記載時点の公開情報です。最新の内容は各社の公式サイトでご確認ください。
        </div>
      </footer>
    </div>
  );
}
