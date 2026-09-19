const CACHE_NAME = 'scripthub-v3-responsive';
const APP_SHELL = ['./', './index.html', './manifest.json'];

const RESPONSIVE_CSS = `
/* ScriptHub responsive + accessibility layer — visual style preserved */
html{overflow-x:hidden;scroll-behavior:smooth}
body{overflow-x:hidden;min-width:0;padding:max(.5rem,env(safe-area-inset-top)) max(.5rem,env(safe-area-inset-right)) max(.75rem,env(safe-area-inset-bottom)) max(.5rem,env(safe-area-inset-left))}
.app{width:100%;min-width:0}
.header>div:last-child{min-width:0}
.header>div:last-child>div,.header>div:last-child>button{max-width:100%}
button,a,input,select,textarea{touch-action:manipulation}
button,.auth-btn,.add-btn,.add-game-btn,.get-btn,.cat-btn,.sort-btn,.theme-btn,.lang-btn,.modal-close,.copy-btn,.delete-btn,.backup-btn,.task-btn,.buy-btn,.use-btn{min-height:40px}
img{max-width:100%}
.card-image,.game-card .card-image{aspect-ratio:16/9;height:auto;min-height:120px}
.card-image img,.game-card .card-image img{width:100%;height:100%;object-fit:cover;display:block}
.modal-overlay{padding:clamp(.5rem,2vw,1rem);overscroll-behavior:contain}
.modal-card{width:min(100%,550px);max-height:min(92dvh,900px);overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch}
.modal-card.wide{width:min(100%,900px)}
.modal-header{top:-1px}
.form-group input,.form-group select,.form-group textarea{min-width:0;max-width:100%}
.admin-list-item,.leaderboard-item,.leaderboard-list-item{min-width:0}
.admin-list-item .info,.leaderboard-item .info,.leaderboard-list-item .info{min-width:0;overflow-wrap:anywhere}
.chat-frame{max-width:calc(100vw - 24px);max-height:calc(100dvh - 110px)}
#cookieConsent{padding-bottom:max(1rem,env(safe-area-inset-bottom))}
@media (min-width:601px) and (max-width:1024px){
  .app{padding:1.25rem;border-radius:2rem}
  .header{align-items:flex-start}
  .header>.logo{flex:0 0 auto}
  .header>div:last-child{flex:1;display:flex;justify-content:flex-end}
  .script-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:1rem!important}
  .daily-tasks{grid-template-columns:repeat(2,minmax(0,1fr))}
  .collection-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .modal-card.wide{width:94vw}
  .admin-dashboard-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (max-width:600px){
  .app{padding:.65rem!important;border-radius:16px!important}
  .status-strip{font-size:.62rem;line-height:1.35;padding:.55rem .65rem}
  .header{gap:.65rem!important;margin-bottom:1rem}
  .logo{width:100%;justify-content:center}
  .logo img{height:34px}
  .logo h1{font-size:1.35rem!important}
  .logo span{font-size:.62rem}
  .header>div:last-child{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem!important;width:100%}
  .header>div:last-child>.search-box{grid-column:1/-1;order:-10;width:100%!important}
  .header>div:last-child>.stats{grid-column:1/-1;width:100%;justify-content:center;gap:.35rem}
  .stats span{padding:.25rem .55rem;font-size:.68rem}
  .header>div:last-child>.auth-section{grid-column:1/-1}
  .auth-section{width:100%;justify-content:center}
  .auth-section .auth-btn{flex:1}
  .coin-display{justify-content:center;width:100%;min-height:40px}
  .theme-controls,.lang-selector{justify-content:center;width:100%}
  .notification-bell{display:flex;align-items:center;justify-content:center;min-height:40px}
  .header>div:last-child>.add-btn,.header>div:last-child>.add-game-btn,.header>div:last-child>.admin-btn,.header>div:last-child>#collectionBtn{width:100%;justify-content:center}
  .filter-bar{display:grid;grid-template-columns:1fr 1fr;gap:.45rem;padding:.45rem}
  .filter-bar label{min-width:0}
  .filter-bar select{width:100%;min-width:0}
  .filter-bar .backup-btn{width:100%}
  .categories{gap:.4rem;padding-bottom:.65rem;margin-bottom:1rem}
  .cat-btn{font-size:.72rem;padding:.35rem .75rem;min-height:40px}
  .script-grid{grid-template-columns:1fr!important;gap:.8rem!important}
  .script-card,.game-card{border-radius:20px}
  .card-image,.game-card .card-image{min-height:135px}
  .card-body{padding:.9rem 1rem 1rem}
  .card-header h3{font-size:.98rem}
  .card-desc{font-size:.76rem}
  .card-footer{align-items:stretch}
  .card-footer>*{max-width:100%}
  .get-btn,.game-card .game-play-btn{width:100%;justify-content:center}
  .daily-tasks{grid-template-columns:1fr!important}
  .daily-task{padding:.65rem}
  .shop-item{align-items:flex-start}
  .shop-item .item-info{min-width:0;width:100%}
  .shop-item .item-price{margin-left:0}
  .collection-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem}
  .profile-header{flex-direction:column;align-items:center;text-align:center;gap:.8rem}
  .profile-stats{width:100%;justify-content:center;gap:.5rem}
  .profile-stats .stat{flex:1;min-width:0;padding:.5rem .6rem}
  .script-detail-hero{grid-template-columns:1fr}
  .script-detail-hero img,.script-detail-cover{width:100%;height:auto;aspect-ratio:16/9}
  .script-detail-actions>*{flex:1 1 100%}
  .admin-dashboard-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .admin-tabs{overflow-x:auto;flex-wrap:nowrap;padding-bottom:.6rem}
  .admin-tabs button{flex:0 0 auto}
  .admin-list-item{align-items:stretch}
  .admin-list-item .info{width:100%}
  .admin-list-item .actions{width:100%}
  .admin-list-item .actions button{flex:1}
  .leaderboard-item,.leaderboard-list-item{padding:.6rem .7rem;gap:.5rem}
  .leaderboard-item .score,.leaderboard-list-item .score{font-size:.9rem}
  .unlock-option{min-width:0;width:100%}
  .task-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
  .task-btn{min-height:64px}
  .modal-overlay{align-items:flex-end;padding:.35rem}
  .modal-card,.modal-card.wide{width:100%!important;max-width:none!important;max-height:94dvh;border-radius:22px!important;padding:1rem!important;margin:0!important}
  .modal-header h2{font-size:1.15rem}
  .modal-close{width:42px;height:42px;flex:0 0 42px}
  .code-area{align-items:flex-start;flex-direction:column;border-radius:18px}
  .copy-btn{width:100%}
  .chat-toggle-btn{right:max(12px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));width:54px;height:54px}
  .chat-frame{right:12px;bottom:82px;width:calc(100vw - 24px);height:min(70dvh,560px);max-height:70dvh;border-radius:16px}
  .toast{bottom:max(12px,env(safe-area-inset-bottom));max-width:calc(100vw - 20px)}
  .footer{flex-direction:column;align-items:center;text-align:center}
  .footer .social-links{justify-content:center;flex-wrap:wrap}
}
@media (max-width:360px){
  .header>div:last-child{grid-template-columns:1fr}
  .header>div:last-child>.search-box,.header>div:last-child>.stats,.header>div:last-child>.auth-section{grid-column:1}
  .filter-bar{grid-template-columns:1fr}
  .collection-grid{grid-template-columns:1fr}
  .task-row{grid-template-columns:1fr}
}
@media (hover:none) and (pointer:coarse){
  .script-card:hover,.game-card:hover,.daily-task:hover,.collection-item:hover{transform:none}
  .shortcut-hint{display:none!important}
}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
}
`;

function injectResponsive(html) {
  if (!html || html.indexOf('</head>') === -1) return html;
  if (html.includes('data-scripthub-responsive="v3"')) return html;
  const style = '<style data-scripthub-responsive="v3">' + RESPONSIVE_CSS + '</style>';
  return html.replace('</head>', style + '</head>');
}

async function putShell(cache) {
  const requests = APP_SHELL.map(path => new Request(path));
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (request.url.endsWith('/index.html') || request.url.endsWith('/')) {
        const type = response.headers.get('content-type') || '';
        if (type.includes('text/html')) {
          const html = injectResponsive(await response.text());
          cache.put(request, new Response(html, {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers(response.headers)
          }));
          continue;
        }
      }
      await cache.put(request, response);
    } catch (_) {}
  }
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(putShell).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
