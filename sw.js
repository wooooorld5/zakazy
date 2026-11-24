const C='zakazy-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.hostname==='firestore.googleapis.com')return;
  if(r.mode==='navigate'){
    e.respondWith((async()=>{
      try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),4000);
        const res=await fetch(r,{signal:ctl.signal});clearTimeout(t);
        if(res.ok){const c=await caches.open(C);c.put('./index.html',res.clone())}return res}
      catch(err){return (await caches.match('./index.html'))||(await caches.match(r,{ignoreSearch:true}))||Response.error()}
    })());return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||net;
  }));
});
