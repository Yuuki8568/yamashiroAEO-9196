// Public-only pre-rendered resources, compressed separately at build time.
const resources = /*RESOURCE_MAP*/ {};
const indexable = /*INDEXABLE*/ false;
export default {
 async fetch(request) {
  const url=new URL(request.url);
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD','X-Robots-Tag':'noindex'}});
  const resource=Object.hasOwn(resources,url.pathname)?resources[url.pathname]:null;
  const headers={'Content-Type':resource?.type??'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",'Cache-Control':'public, max-age=300','X-Robots-Tag':indexable&&resource?'index, follow':'noindex, nofollow'};
  if(request.method==='HEAD')return new Response(null,{status:resource?200:404,headers});
  if(!resource)return new Response('Not found',{status:404,headers});
  const compressed=Uint8Array.from(atob(resource.gzip),c=>c.charCodeAt(0));
  const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream,{headers});
 }
};
