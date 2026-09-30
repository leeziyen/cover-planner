const CACHE='cover-planner-v3';
const CORE=['./','./manifest.json','./icon-192.png','./icon-512.png','./icon-180.png','./icon-32.png'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});
// Network-first: always try to fetch the latest version while online, so
// edits published to the page show up next time the app is opened. Only
// fall back to the last cached copy when there's no network (offline use).
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request,{cache:'no-store'}).then(resp=>{
      if(resp&&resp.status===200){
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
      }
      return resp;
    }).catch(()=>caches.match(e.request))
  );
});
