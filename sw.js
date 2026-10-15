const CACHE = 'pinyin-castle-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/castle.jpg',
  './assets/guide.jpg',
  './assets/dad.jpg',
  './assets/mom.jpg',
  './assets/climb.jpg',
  './assets/rice.jpg',
  './assets/pen.jpg',
  './assets/grandma.jpg',
  './assets/plane.jpg',
  './assets/cat.jpg',
  './assets/flower.jpg',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // 页面导航：联网优先，离线时回退到缓存的首页
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 图片等静态资源：缓存优先，未命中再走网络并写回缓存
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }))
  );
});
