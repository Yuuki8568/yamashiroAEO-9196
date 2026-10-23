# AEO Cloudflare staged migration

## Status and boundaries

Prepared locally; no deployment, DNS change, credentials, generation provider or recurring publish action has been created. This directory is independent of the original Bun/Vite/Runable application and other Office/Cockpit projects. New path uses dependency-free Node 24 build and Web Standard Workers runtime (no Bun runtime, no database or admin token).

Original Git commit: `744a0205ebf3a7448ea2aa41626181d087decfce`. Original source backups remain outside this release. Verification compares tracked original source directly against this baseline commit without generating or publishing a private file inventory. A local checkout must contain that commit; shallow clones must fetch the baseline before verification. Git is **not** a complete DB backup.

`content/posts/<slug>.json` + `content/import-receipt.json` is the separately captured 52-row live published-only API snapshot, not the Git49. Import receipt preserves IDs, exact timestamps, per-row hashes, source response hash and count. Latest3 slugs: chatgpt-kyoyu-shitewaikenai, chatgpt-ichiji-chat-towa, chatgpt-archive-doko. It is permissible to version this already-public snapshot. Neither receipt nor snapshot JSON is a public route. Private drafts, research logs, runs and source repository are not embedded in Worker. Full DB including unpublished posts/run history still requires authorized export/reconciliation before retirement of old system.

## Build and verify

```
cd cloudflare
node scripts/verify-source.mjs
node scripts/build.mjs
node --test
```

Default build uses `https://preview.invalid` and `noindex,nofollow` throughout. Set `PUBLIC_ORIGIN=https://APPROVED-HOST` to rebuild canonical/sitemap/llms/old-host article links coherently. **Only after cutover review** set `ENABLE_INDEXING=true`. Tests default to preview mode. The application does not infer canonical host from untrusted request headers.

Output `dist/worker.mjs` is self-contained module: 52 HTML pages, 52 Markdown resources, homepage, robots, sitemap and llms. Pre-rendered resources individually gzip/base64 encoded; Workers `DecompressionStream('gzip')` streams requested content. No remote runtime fetches, frontend JS, trackers or third-party fonts. Build report gives byte counts and SHA256. This can be uploaded as multipart ES module through an existing authorized Cloudflare connection (metadata main_module=worker.mjs, compatibility_date=2026-10-23). No assets-upload credentials required. Upload config targets **new dedicated staging worker only**; do not overwrite yamashiro-office or consulting-cockpit-staging. Nothing automatically deploys from this checkout.

Deployment gates: parent review; confirm staging name and account; inspect actual Worker runtime preview; verify all52 URLs, timestamps, canonical, securityheaders, sitemap and markdown; confirm approved production host/indexing; oldURL redirects/retirement are separate from staged availability. Save previous deployed version for rollback. This implementation has local Node Web API tests, not a completed Cloudflare runtime/live validation.

## Safe update / recovery

1. Read-only export current published rows into a **private, non-web** file. Keep full raw response separately. For full DB, export posts including drafts and runs separately, preserving exact IDs/dates/JSON; never place full DB under `content/` or deploy it.
2. Compute SHA256 and expected row count independently from source. Run:
   `node scripts/stage-import.mjs INPUT /path/to/new-empty-stage COUNT SHA256`
   Import refuses overwrite, nonpublished rows, bad/duplicate slugs/IDs and invalid dates. It writes a new public-only per-article snapshot plus receipt; current build remains unchanged.
3. Compare stage with current content: additions/removals/body changes; source count/hash and IDs/dates. Reconcile full-DB published rows against API52 before claiming completeness. Preserve old stage + receipt, original bundle and full private export. Do not change the baseline to conceal unreviewed source changes.
4. Review sources/factual claims and duplicate intent. Approve new published snapshot explicitly, then promote the **whole content directory atomically** (52 individual article files plus the receipt; future counts may differ), rebuild/tests and review build hash. No build selects arbitrary `drafts/` files or auto-promotes new drafts.
5. Upload staged Worker version using existing authorized connection. Verify new version before switching traffic/indexing. Rollback uses previous module/version; content directory is atomically paired via per-file, per-row, aggregate checksum and count validation.

There is intentionally **no public management route**: /admin, /runs, /api, drafts, logs, env and unknown paths404, non-GET/HEAD405. Future updates go through reviewed source snapshot → build/test → authorized module deploy, rather than reintroducing weak public token endpoints. No automatic schedule is enabled. Existing Runable schedule/provider configuration must be reconciled separately; publicly displayed prompt is daily08:00JST, earlier14:45 metadata is not authoritative.

## Content and renderer limitations

Existing articles are retained, not recertified. Unverified historical promotional claims (10–30-minute prototype, absolute no-handover-loss, certification statements) remain editorial review items. Third-party tax-exclusive historical prices must not be blindly relabeled. This migration does not invent client work, ROI, credentials or contractual terms.

Renderer escapes raw HTML and only introduces allowlisted inline/heading/list/table/code HTML. Unsafe URL protocols are rejected; JSONLD `<` escaped; CSP denies external scripts/frames/forms. This intentionally supports a conservative Markdown subset (ordered list numbering is preserved; complex nested syntax/images not implemented), avoiding dependencies and executable HTML. All article text is preserved in public Markdown resource; visually review key articles before cutover. JSONLD preserves Article dates and does not fabricate FAQ rich-result eligibility or live SEO success.

## Bounded GitHub source updates

The publication manifest has `format: per-article-json-v1` and an explicitly ordered list of article files. Each `content/posts/<slug>.json` is at most 65,536 UTF-8 bytes (current maximum 47,068 bytes). The loader verifies file size/type, path allowlist, per-file checksum, original row checksum, IDs/timestamps, uniqueness, status and reconstructed original ordered-array SHA256. Extra/missing files fail closed. No monolithic published JSON is required in Git. The preserved aggregate SHA matches the previous52-row snapshot exactly.

Upload source files in small tree batches without updating the branch ref mid-import; create one commit/ref update only after the whole directory and manifest are present. Future changes replace only changed article files plus manifest in one commit; do not edit the manifest checksum merely to bypass review. Original raw export/old monolithic snapshot remain local private backups outside this repo. Build output is unchanged by this storage-only refactor.
