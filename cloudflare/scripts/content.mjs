import {readFile,readdir,lstat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {root,sha} from './snapshot.mjs';
export const MAX_ARTICLE_BYTES=65536;
export function validateRows(rows){
 const ids=new Set(),slugs=new Set();
 for(const p of rows){
  if(p.status!=='published'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||!Number.isInteger(p.id)||ids.has(p.id)||slugs.has(p.slug)||typeof p.body!=='string'||typeof p.answer!=='string'||typeof p.question!=='string'||!Number.isFinite(Date.parse(p.publishedAt))||!Number.isFinite(Date.parse(p.updatedAt)))throw new Error('Invalid/duplicate/unpublished row');
  if(Buffer.byteLength(JSON.stringify(p,null,2)+'\n')>MAX_ARTICLE_BYTES)throw new Error('Article exceeds bounded source size');
  ids.add(p.id);slugs.add(p.slug);
 }
}
export async function loadContent(directory=resolve(root,'cloudflare/content')){
 const manifest=JSON.parse(await readFile(resolve(directory,'import-receipt.json'),'utf8'));
 if(manifest.format!=='per-article-json-v1'||!Array.isArray(manifest.rows)||manifest.count!==manifest.rows.length)throw new Error('Invalid publication manifest');
 const expected=manifest.rows.map(r=>`${r.slug}.json`).sort();
 const actual=(await readdir(resolve(directory,'posts'))).sort();
 if(JSON.stringify(expected)!==JSON.stringify(actual))throw new Error('Unexpected/missing article file');
 const posts=[];
 for(const entry of manifest.rows){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)||entry.file!==`posts/${entry.slug}.json`)throw new Error('Invalid source path');
  const path=resolve(directory,entry.file);const stat=await lstat(path);if(!stat.isFile()||stat.size>MAX_ARTICLE_BYTES||stat.size!==entry.bytes)throw new Error('Invalid article file size/type');
  const raw=await readFile(path,'utf8');if(sha(raw)!==entry.fileSha256)throw new Error('Article file checksum mismatch');
  const p=JSON.parse(raw);if(sha(JSON.stringify(p))!==entry.sha256||p.id!==entry.id||p.slug!==entry.slug||p.publishedAt!==entry.publishedAt||p.updatedAt!==entry.updatedAt)throw new Error('Article identity/content mismatch');posts.push(p);
 }
 validateRows(posts);
 if(sha(JSON.stringify(posts,null,2)+'\n')!==manifest.publishedFileSha256)throw new Error('Reconstructed snapshot checksum mismatch');
 return {manifest,posts};
}
