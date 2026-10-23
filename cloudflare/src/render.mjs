export const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value){try { const u=new URL(value,'https://placeholder.invalid'); return ['https:','http:'].includes(u.protocol) && !String(value).startsWith('//') ? value : null; }catch{return null;}}
export function inline(s){
 // Escape first; only introduce markup from these constrained constructs. Raw HTML is never executed.
 return escape(s).replace(/\[([^\]\n]+)\]\(([^\s)]+)\)/g,(all,label,url)=>safeURL(url)?`<a href="${url}" rel="noopener noreferrer">${label}</a>`:label).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
}
export function markdown(input){
 const lines=input.replace(/\r/g,'').split('\n'); const out=[];let code=null,list=false,table=false;
 const close=()=>{if(list){out.push(`</${list}>`);list=false;}if(table){out.push('</tbody></table></div>');table=false;}};
 for(let i=0;i<lines.length;i++){const l=lines[i];
 if(l.startsWith('```')){close();if(code!==null){out.push(`<pre><code>${escape(code.join('\n'))}</code></pre>`);code=null;}else code=[];continue;}
 if(code!==null){code.push(l);continue;}
 if(/^\|.*\|\s*$/.test(l)){
 const cells=l.trim().slice(1,-1).split('|').map(x=>inline(x.trim()));
 if(!table){close();out.push('<div class="table"><table><thead><tr>'+cells.map(x=>`<th>${x}</th>`).join('')+'</tr></thead><tbody>');table=true;if(/^\|[\s:|\-]+\|\s*$/.test(lines[i+1]||''))i++;}
 else out.push('<tr>'+cells.map(x=>`<td>${x}</td>`).join('')+'</tr>');continue;
 }
 if(table)close();
 if(/^[-*] /.test(l)||/^\d+\. /.test(l)){const ordered=l.match(/^(\d+)\. /);const kind=ordered?'ol':'ul';if(list&&list!==kind)close();if(!list){out.push(ordered?`<ol start="${Number(ordered[1])}">`:'<ul>');list=kind;}out.push(`<li>${inline(l.replace(/^(?:[-*]|\d+\.) /,''))}</li>`);continue;}
 close();const h=l.match(/^(#{1,6}) (.*)$/);if(h){out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);continue;}
 if(l.trim())out.push(`<p>${inline(l)}</p>`);
 }
 close();if(code!==null)out.push(`<pre><code>${escape(code.join('\n'))}</code></pre>`);return out.join('\n');
}
export function page({title,description,canonical,body,jsonld,indexable=false}){
 const structured=jsonld?`<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g,'\\u003c')}</script>`:'';
 return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} | 山代業務改善事務所</title><meta name="description" content="${escape(description)}"><meta name="robots" content="${indexable?'index,follow':'noindex,nofollow'}"><link rel="canonical" href="${escape(canonical)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(canonical)}"><meta property="og:type" content="article">${structured}<style>body{font-family:system-ui,sans-serif;color:#172b3a;background:#f6f8fa;line-height:1.85;margin:0}header,main,footer{max-width:880px;margin:auto;padding:24px}header{border-bottom:1px solid #d8e3e9}a{color:#075d86}article{background:white;padding:clamp(18px,4vw,40px);border-radius:16px}h1{font-size:clamp(1.5rem,4vw,2.1rem);line-height:1.5}h2{margin-top:2rem;border-bottom:2px solid #c9e4e8}p,li{overflow-wrap:anywhere}.table{overflow:auto}table{border-collapse:collapse;min-width:100%}td,th{border:1px solid #b9cbd6;padding:10px;text-align:left}pre{overflow:auto;background:#eaf1f5;padding:16px}.card{padding:16px;margin:12px 0;background:white;border:1px solid #d8e3e9;border-radius:12px}footer{font-size:.875rem}</style></head><body><header><a href="/">山代業務改善事務所｜AI業務改善ブログ</a></header><main>${body}</main><footer><a href="https://yamashirogyomukaizen.com/">事務所の公式サイト</a> · <a href="/llms.txt">記事一覧（テキスト）</a><p>掲載情報は各記事の確認日時点のものです。サービスの最新情報は公式の出典をご確認ください。</p></footer></body></html>`;
}
