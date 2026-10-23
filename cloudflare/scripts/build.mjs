import {loadContent} from './content.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';import {gzipSync} from 'node:zlib';import {root,sha} from './snapshot.mjs';import {page,markdown,escape} from '../src/render.mjs';
const origin=(process.env.PUBLIC_ORIGIN||'https://preview.invalid').replace(/\/$/,'');const parsed=new URL(origin);if(parsed.protocol!=='https:'||parsed.pathname!=='/'||parsed.search||parsed.hash||parsed.username||parsed.password)throw new Error('PUBLIC_ORIGIN must be an HTTPS origin only');
const indexable=process.env.ENABLE_INDEXING==='true';if(indexable&&parsed.hostname.endsWith('.invalid'))throw new Error('Production origin required for indexing');
const {manifest,posts}=await loadContent();const resources={};const articles=[];
for(const p of posts){
 if(p.status!=='published')throw new Error('Nonpublic row in publication source');
 const entry={slug:p.slug};if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug))throw new Error('Invalid slug');
 const title=p.question,description=p.answer,canonical=`${origin}/posts/${p.slug}`;
 const sources=typeof p.sources==='string'?JSON.parse(p.sources):p.sources;
 const faq=typeof p.faq==='string'?JSON.parse(p.faq):p.faq;
 const raw=`# ${title}\n\n答え: ${description}\n\n${p.audience?'対象読者: '+p.audience+'\n\n':''}公開: ${p.publishedAt} ／ 更新: ${p.updatedAt}\n\n${p.body}\n\n${faq?.length?'## よくある質問\n\n'+faq.map(f=>`### ${f.q}\n\n${f.a}`).join('\n\n'):''}\n\n${sources?.length?'## 出典\n\n'+sources.map(s=>`- [${s.label}](${s.url})${s.checkedAt?'（確認: '+s.checkedAt+'）':''}`).join('\n'):''}`;
 const body=raw.replace(/https:\/\/ai-i2gajxb-preview-4200\.runable\.site/g,origin);
 const jsonld={'@context':'https://schema.org','@type':'Article',headline:title,description,url:canonical,mainEntityOfPage:canonical,publisher:{'@type':'Organization',name:'山代業務改善事務所',url:'https://yamashirogyomukaizen.com/'},datePublished:p.publishedAt,dateModified:p.updatedAt};
 resources[`/posts/${entry.slug}`]={type:'text/html; charset=utf-8',body:page({title,description,canonical,indexable,jsonld,body:`<article>${markdown(body)}</article>`})};
 resources[`/posts/${entry.slug}.md`]={type:'text/plain; charset=utf-8',body};articles.push({slug:entry.slug,title,description,date:p.updatedAt.slice(0,10)});
}
articles.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||a.slug.localeCompare(b.slug));
resources['/']={type:'text/html; charset=utf-8',body:page({title:'AI業務改善ブログ',description:'中小企業のAI活用・業務改善について、質問と回答、手順、公式情報の出典をまとめています。',canonical:origin+'/',indexable,body:`<h1>AI業務改善ブログ</h1><p>業務の疑問から、改善の一歩へ。AI活用の手順と判断材料をまとめています。</p>${articles.map(a=>`<section class="card"><h2><a href="/posts/${a.slug}">${escape(a.title)}</a></h2><p>${escape(a.description)}</p>${a.date?`<p>更新 ${a.date}</p>`:''}</section>`).join('')}`})};
resources['/robots.txt']={type:'text/plain; charset=utf-8',body:indexable?`User-agent: *\nAllow: /\nDisallow: /runs\nDisallow: /api/\nDisallow: /admin\nSitemap: ${origin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n'};
resources['/sitemap.xml']={type:'application/xml; charset=utf-8',body:`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(origin)}/</loc></url>${articles.map(a=>`<url><loc>${escape(origin)}/posts/${a.slug}</loc>${a.date?`<lastmod>${a.date}</lastmod>`:''}</url>`).join('')}</urlset>`};
resources['/llms.txt']={type:'text/plain; charset=utf-8',body:'# 山代業務改善事務所 AI業務改善ブログ\n\n'+articles.map(a=>`- [${a.title}](${origin}/posts/${a.slug})\n  ${a.description}\n  全文: ${origin}/posts/${a.slug}.md`).join('\n')+'\n'};
const packed=Object.fromEntries(Object.entries(resources).map(([path,r])=>[path,{type:r.type,gzip:gzipSync(r.body,{level:9}).toString('base64')}]));
const template=await readFile(`${root}/cloudflare/src/worker-template.mjs`,'utf8');const output=template.replace('/*RESOURCE_MAP*/ {}',()=>JSON.stringify(packed)).replace('/*INDEXABLE*/ false',String(indexable));await mkdir(`${root}/cloudflare/dist`,{recursive:true});await writeFile(`${root}/cloudflare/dist/worker.mjs`,output);
const report={origin,indexable,published:articles.length,resources:Object.keys(resources).length,bytes:Buffer.byteLength(output),gzipBytes:gzipSync(output).length,sha256:sha(output),sourceScope:manifest.scope};await writeFile(`${root}/cloudflare/dist/build-report.json`,JSON.stringify(report,null,2)+'\n');console.log(report);
