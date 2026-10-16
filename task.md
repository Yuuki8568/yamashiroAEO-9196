# AEO ブログ（山代業務改善事務所）進捗

## 状態: サイト公開可・初回3記事公開済み（2026-08-24）

## 構成
- アプリ: /home/user/aeo-blog（マネージドテンプレート／web ポート 4200 固定・__ports.cjs）
- DB: Drizzle SQLite。posts / runs（db:push 済み）
- API: packages/web/src/api/routes/posts.ts（posts.list/get/upsert/remove, runs.list/log）
  - 公開は PUBLISH_TOKEN（ルート .env）必須
  - サーバ側 NG リンター: `**` / 完全自動化・AIで全部解決 / ROI保証 / 体験談風 / 申請代行・採択
- 画面: / （一覧）, /posts/:slug, /runs（更新ログ）, /write（ブラウザ編集）
- 生成物: public/sitemap.xml, robots.txt, llms.txt, public/posts/<slug>.md（SPA対策のプレーンテキスト版）

## 公開スクリプト
- `bun packages/web/tools/publish.ts drafts/<file>.md` … 公開/更新＋静的ファイル再生成
- `bun packages/web/tools/publish.ts --regen`
- `bun packages/web/tools/publish.ts --log drafts/run-YYYY-MM-DD.json`
- 記事ファイル形式: JSON フロントマター（--- で囲む）＋ Markdown 本文
- 注意: スクリプトは packages/web 配下に置く（ルート tools/ では @orpc/server が解決できない）

## 公開済み（2026-08-24）
1. ai-donyu-shien-towa（faq／ai導入支援 350・KD0）
2. ai-gijiroku-tool-erabikata（comparison／議事録作成 ai 1,100・KD6）
3. excel-shift-hyo-jido-sakusei（how-to／シフト表 自動作成 400・KD0）
- 更新ログ id=1 登録済み（起点: yamashirogyomukaizen.com のオーガニックKW 0件）

## 次回候補
- alternatives: ai コンサル 600/KD1（AIコンサル・生成AI顧問の代替）
- best-of: 日報 ai / 見積書 ai / 中小企業 ai活用（事務でAIが効く業務）
- 議事録クラスタの上位語（議事録 ai 7,200・KD35）へは内部リンクで積み上げてから狙う
- 補助金クラスタは触らない（行政書士法19条＋政府系DR88サイト）

## 検証済み
- bun run lint: 0 errors
- bun run build: 成功
- dev: http://localhost:4200（tmux セッション dev）

## 2026-08-24 追記
- Runableバッジを app.tsx から削除（AgentFeedback は維持）。
- 配色をメインサイト（yamashirogyomukaizen.com）実測値に差し替え。黒ベース廃止、#F7F5F0 ベース＋#1C2B3A 文字＋#0E7490 ティール＋#E8836F コーラル。見出しフォントは Outfit → Noto Serif JP。詳細は design.md。
