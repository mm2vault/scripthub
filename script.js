// ==========================================
// ANA SCRIPT - TÜM FONKSİYONLAR
// ==========================================

// STATE
let communityScripts = [];
let communityGames = [];
let favorites = [];
let currentCategory = 'all';
let searchTerm = '';
let sortMode = 'default';
let currentUser = null;
let currentPage = 1;
let selectedAvatar = AVATAR_1;
let uploadedAvatarUrl = null;
let filterType = 'all';
let filterRating = 0;
const ITEMS_PER_PAGE = 20;

let ratings = {};
let comments = {};
let viewCounts = {};
let notifications = [];
let notifCount = 0;
let currentLang = localStorage.getItem('scriptHubLang') || 'tr';
let leaderboardFilter = 'scripts';

// AVATARLAR
const AVATAR_1 = 'https://i.postimg.cc/HnwDsKJg/24a54c075ae7a7e7ae16d69e2766cefe.jpg';
const AVATAR_2 = 'https://i.postimg.cc/kMKdcVTT/1aa5e264dd077f5d1b17fec8f3f4406b.jpg';

// GÜNLÜK GÖREVLER
const dailyTasks = [
    { id: 'daily_login', name: 'Günlük Giriş', desc: 'Bugün giriş yap', reward: '🎁 10 XP', icon: '✅' },
    { id: 'daily_view', name: 'Script İncele', desc: '5 script görüntüle', reward: '🎁 20 XP', icon: '👁️' },
    { id: 'daily_comment', name: 'Yorum Yap', desc: '1 scripte yorum yap', reward: '🎁 15 XP', icon: '💬' },
    { id: 'daily_fav', name: 'Favori Ekle', desc: '1 script favorilere ekle', reward: '🎁 10 XP', icon: '❤️' }
];

// ROZETLER
const BADGES = [
    { id: 'first_script', name: 'İlk Script', icon: '📜', desc: 'İlk scriptini ekle' },
    { id: 'script_master', name: 'Script Ustası', icon: '🏆', desc: '10 script ekle' },
    { id: 'script_legend', name: 'Script Efsanesi', icon: '👑', desc: '50 script ekle' },
    { id: 'favorite_lover', name: 'Favori Sever', icon: '❤️', desc: '5 favori script' },
    { id: 'favorite_master', name: 'Favori Ustası', icon: '💖', desc: '20 favori script' },
    { id: 'comment_master', name: 'Yorum Ustası', icon: '💬', desc: '10 yorum yap' },
    { id: 'comment_legend', name: 'Yorum Efsanesi', icon: '🗣️', desc: '50 yorum yap' },
    { id: 'daily_grinder', name: 'Günlük Avcısı', icon: '🎯', desc: '7 gün görev tamamla' },
    { id: 'community_hero', name: 'Topluluk Kahramanı', icon: '🦸', desc: '20 topluluk scripti ekle' },
    { id: 'premium_user', name: 'Premium Kullanıcı', icon: '💎', desc: 'Premium script kullan' }
];

// ==========================================
// FAVORİ İŞLEMLERİ
// ==========================================
function favHandler(e) {
    const id = this.dataset.id;
    if (typeof id !== 'string') return;
    const idx = favorites.indexOf(id);
    if (idx > -1) favorites.splice(idx, 1);
    else favorites.push(id);
    favorites = favorites.filter(f => typeof f === 'string' && f.length > 0);
    localStorage.setItem('scriptHubFavs', JSON.stringify(favorites));
    render();
    showToast('❤️ Favori güncellendi');
    if (currentUser && favorites.filter(id => !id.startsWith('p')).length >= 3) {
        addNotification('🏆 Başarım kazandın: Favori Sever!', 'achievement');
    }
    completeDailyTask('daily_fav');
}

// ==========================================
// GET SCRIPT HANDLER
// ==========================================
function getHandler(e) {
    const id = this.dataset.id;
    const all = getAllScripts();
    const script = all.find(s => s.id === id);
    if (!script) return;
    
    incrementView(id);
    if (script.isCommunity) {
        db.collection('scripts').doc(id).update({ downloads: firebase.firestore.FieldValue.increment(1) }).catch(() => {});
    }
    
    modalState.scrollY = window.scrollY;
    modalState.code = script.code;
    modalState.taskStatus = { discord: false, youtube: false, tiktok: false };
    modalState.completed = 0;
    
    document.getElementById('modalScriptName').textContent = script.name;
    document.getElementById('taskStatus').textContent = '0/3';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('revealCodeBtn').classList.remove('active');
    document.getElementById('revealCodeBtn').textContent = '🔐 Kodu Göster';
    document.getElementById('codeContainer').classList.remove('show');
    
    document.querySelectorAll('.task-btn').forEach(b => {
        b.classList.remove('completed');
        const badge = b.querySelector('.timer-badge');
        if (badge) badge.remove();
    });
    
    Object.values(modalState.timers).forEach(t => {
        if (t) clearInterval(t);
    });
    modalState.timers = { discord: null, youtube: null, tiktok: null };
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${modalState.scrollY}px`;
    document.body.style.width = '100%';
    document.getElementById('taskModal').classList.add('open');
    setTimeout(() => { render(); }, 100);
}

// ==========================================
// DELETE HANDLER
// ==========================================
async function deleteHandler(e) {
    const id = this.dataset.id;
    const script = communityScripts.find(s => s.id === id);
    if (!script) { showToast('❌ Bu script silinemez!'); return; }
    if (!currentUser || currentUser.uid !== script.userId) {
        showToast('❌ Sadece kendi scriptini silebilirsin!');
        return;
    }
    if (!confirm(`"${script.name}" scriptini silmek istediğine emin misin?`)) return;
    if (await deleteScriptFromFirebase(id)) {
        const idx = favorites.indexOf(id);
        if (idx > -1) {
            favorites.splice(idx, 1);
            localStorage.setItem('scriptHubFavs', JSON.stringify(favorites));
        }
        await loadCommunityScripts();
        render();
        showToast('🗑️ Script silindi!');
    }
}

// ==========================================
// GAME DELETE HANDLER
// ==========================================
async function gameDeleteHandler(e) {
    const gameId = this.dataset.gameid;
    const game = communityGames.find(g => g.id === gameId);
    if (!game) { showToast('❌ Bu oyun silinemez!'); return; }
    if (!currentUser || currentUser.uid !== game.userId) {
        showToast('❌ Sadece kendi oyununu silebilirsin!');
        return;
    }
    if (!confirm(`"${game.name}" oyununu silmek istediğine emin misin?`)) return;
    if (await deleteGameFromFirebase(gameId)) {
        await loadCommunityGames();
        render();
        showToast('🗑️ Oyun silindi!');
    }
}

// ==========================================
// RENDER FONKSİYONU
// ==========================================
function render() {
    updateGameBadge();
    
    if (currentCategory === 'games') {
        const total = 7 + communityGames.length;
        totalCount.textContent = total;
        favCount.textContent = favorites.length;
        communityCount.textContent = communityScripts.length;
        grid.innerHTML = renderGames();
        paginationControls.innerHTML = '';
        document.querySelectorAll('[data-gameid]').forEach(b => b.addEventListener('click', gameDeleteHandler));
        return;
    }
    
    const all = getAllScripts();
    let filtered = all.filter(s => {
        let catMatch = currentCategory === 'all' ? true :
            (currentCategory === 'favorites' ? favorites.includes(s.id) :
            (currentCategory === 'community' ? s.isCommunity === true :
            s.category === currentCategory));
        let typeMatch = filterType === 'all' ? true :
            (filterType === 'premium' ? s.isPremium :
            filterType === 'community' ? s.isCommunity : true);
        let searchMatch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.features && s.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase())));
        let ratingMatch = true;
        if (filterRating > 0) {
            const r = ratings[s.id];
            if (r) ratingMatch = r.avg >= filterRating;
            else ratingMatch = false;
        }
        return catMatch && typeMatch && searchMatch && ratingMatch;
    });
    
    const sortVal = filterSort.value || sortMode;
    if (sortVal === 'az') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortVal === 'za') filtered.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortVal === 'popular') filtered.sort((a, b) => (viewCounts[b.id] || 0) - (viewCounts[a.id] || 0));
    else if (sortVal === 'newest') filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    else if (sortVal === 'default') filtered.sort((a, b) => {
        if (a.isPremium && !b.isPremium) return -1;
        if (!a.isPremium && b.isPremium) return 1;
        return 0;
    });
    
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = Math.max(1, totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
    
    totalCount.textContent = filtered.length;
    favCount.textContent = favorites.length;
    communityCount.textContent = communityScripts.length;
    
    if (!paginated.length) {
        grid.innerHTML = `
            <div class="empty">
                <div style="font-size:2.5rem">🔍</div>
                <h3 style="color:var(--text-secondary)">Sonuç bulunamadı</h3>
                <p style="color:var(--text-muted);font-size:0.85rem">Farklı bir kategori veya arama terimi dene.</p>
            </div>
        `;
        paginationControls.innerHTML = '';
        return;
    }
    
    grid.innerHTML = paginated.map(s => {
        const isFav = favorites.includes(s.id);
        const isCommunity = s.isCommunity || false;
        const isPremium = s.isPremium || false;
        const isOwner = currentUser && isCommunity && s.userId === currentUser.uid;
        const canDelete = isCommunity && isOwner;
        const imageUrl = s.image || getImageForCategory(s.category);
        const badgeImg = isCommunity ? IMG.community : IMG.premium;
        const badgeText = isCommunity ? 'Topluluk' : 'Premium';
        const badgeClass = isCommunity ? 'community' : '';
        const rating = ratings[s.id] || { avg: 0, count: 0 };
        const views = viewCounts[s.id] || 0;
        const scriptComments = comments[s.id] || [];
        const downloads = s.downloads || 0;
        const status = s.status || 'active';
        const version = s.version || '';
        
        return `
            <div class="script-card">
                <div class="card-image"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(s.name)}" loading="lazy" onerror="this.src='${DEFAULT_IMAGE}'"></div>
                <div class="card-body">
                    <div class="card-header">
                        <h3><img src="${getImageForCategory(s.category)}" style="width:20px;height:20px;border-radius:4px;object-fit:cover" onerror="this.src='${DEFAULT_IMAGE}'">${escapeHtml(s.name)} ${isPremium?'⭐':''}</h3>
                        <button class="fav-btn ${isFav?'active':''}" data-id="${s.id}">♥</button>
                    </div>
                    <span class="card-category">${s.category.toUpperCase()} ${isCommunity?'· 🌍':''}</span>
                    <div class="card-desc">${escapeHtml(s.desc)}</div>
                    <div class="rating-stars">
                        ${[1,2,3,4,5].map(i => `<span class="star ${i<=Math.round(rating.avg)?'active':''}" onclick="rateScript('${s.id}',${i})">★</span>`).join('')}
                        <span class="rating-avg">${rating.avg>0?rating.avg.toFixed(1)+' ('+rating.count+')':'Puan yok'}</span>
                        <span style="color:var(--text-muted);font-size:0.6rem;margin-left:0.3rem">👁️ ${views}</span>
                    </div>
                    <div class="card-features">${s.features?s.features.map(f=>`<span class="tag">${escapeHtml(f)}</span>`).join(''):''}</div>
                    ${s.userName?`<div class="script-owner"><img src="${IMG.users}" style="width:14px;height:14px">${escapeHtml(s.userName)}${isOwner?' <span class="badge owner-badge">👑 Sahibim</span>':''}</div>`:''}
                    <div class="comment-section">
                        ${isPremium ? `
                            <div style="color:var(--text-muted);font-size:0.65rem;text-align:center;padding:0.3rem;border-top:1px solid var(--border-color);margin-top:0.3rem">
                                ⭐ Premium scriptlere yorum yapılamaz
                            </div>
                        ` : `
                            <div style="max-height:80px;overflow-y:auto;margin-bottom:0.3rem">
                                ${scriptComments.length === 0 ? '<div style="color:var(--text-muted);font-size:0.65rem;text-align:center;padding:0.2rem">💬 İlk yorumu sen yap!</div>' :
                                    scriptComments.slice(0,3).map(c => `
                                        <div class="comment-item">
                                            <span class="cmt-user">${escapeHtml(c.user)}</span>
                                            <span style="color:var(--text-secondary);font-size:0.7rem">${escapeHtml(c.text)}</span>
                                            <span class="cmt-time">${c.time ? new Date(c.time.seconds * 1000).toLocaleString('tr-TR') : ''}</span>
                                            <span style="color:var(--text-muted);font-size:0.55rem;margin-left:0.3rem">❤️ ${c.likes || 0}</span>
                                        </div>
                                    `).join('')}
                            </div>
                            ${scriptComments.length > 3 ? `<div style="color:var(--text-muted);font-size:0.6rem;text-align:right;cursor:pointer" onclick="showAllComments('${s.id}')">+${scriptComments.length - 3} yorum daha...</div>` : ''}
                            <div class="comment-input">
                                <input type="text" placeholder="Yorum yaz..." id="cmt_${s.id}" onkeypress="if(event.key==='Enter') addComment('${s.id}', this.value)">
                                <button onclick="addComment('${s.id}', document.getElementById('cmt_${s.id}').value)">💬 Gönder</button>
                            </div>
                        `}
                    </div>
                    <div class="card-footer">
                        <div style="display:flex;gap:0.3rem;flex-wrap:wrap;align-items:center">
                            <span class="badge ${badgeClass}"><img src="${badgeImg}" style="width:14px;height:14px">${badgeText}</span>
                            ${status ? `<span class="script-status-badge ${status}">${status === 'active' ? '✅' : status === 'beta' ? '🔬' : '📅'} ${status}</span>` : ''}
                            ${version ? `<span class="script-version">📌 ${version}</span>` : ''}
                            <span class="script-downloads">⬇️ ${downloads || 0}</span>
                        </div>
                        <div style="display:flex;gap:0.3rem;flex-wrap:wrap">
                            ${isOwner ? `<button class="edit-script-btn" onclick="openEditScriptModal('${s.id}')">✏️ Düzenle</button>` : ''}
                            ${canDelete ? `<button class="delete-btn" data-id="${s.id}"><img src="${IMG.delete}" alt="Sil"> Sil</button>` : ''}
                            ${!isOwner ? `<button class="report-btn" onclick="reportScript('${s.id}')">🚨 Raporla</button>` : ''}
                            <button class="get-btn" data-id="${s.id}"><img src="${IMG.get}" alt="GET"> GET</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    renderPagination(totalItems);
    document.querySelectorAll('.fav-btn').forEach(b => b.addEventListener('click', favHandler));
    document.querySelectorAll('.get-btn').forEach(b => b.addEventListener('click', getHandler));
    document.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', deleteHandler));
}

// ==========================================
// PAGINATION
// ==========================================
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }
    let html = `<button class="page-btn" data-page="prev" ${currentPage<=1?'disabled':''}>‹ Önceki</button>`;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn ${i===currentPage?'active':''}" data-page="${i}">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<button class="page-btn" disabled>…</button>`;
        }
    }
    html += `<button class="page-btn" data-page="next" ${currentPage>=totalPages?'disabled':''}>Sonraki ›</button>`;
    paginationControls.innerHTML = html;
    
    document.querySelectorAll('.page-btn[data-page]').forEach(b => {
        b.addEventListener('click', function() {
            const p = this.dataset.page;
            const total = Math.ceil(totalItems / ITEMS_PER_PAGE);
            if (p === 'prev' && currentPage > 1) currentPage--;
            else if (p === 'next' && currentPage < total) currentPage++;
            else if (p !== 'prev' && p !== 'next') currentPage = parseInt(p);
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// ==========================================
// FIREBASE VERİ İŞLEMLERİ
// ==========================================
async function loadCommunityScripts() {
    try {
        const snap = await db.collection('scripts').orderBy('createdAt', 'desc').limit(500).get();
        communityScripts = [];
        snap.forEach(d => {
            const data = d.data();
            communityScripts.push({ id: d.id, ...data, isCommunity: true, isPremium: false });
        });
        for (const s of communityScripts) {
            try {
                const ratingSnap = await db.collection('scripts').doc(s.id).collection('ratings').doc('stats').get();
                if (ratingSnap.exists) {
                    const d = ratingSnap.data();
                    ratings[s.id] = d;
                }
                const commentSnap = await db.collection('scripts').doc(s.id).collection('comments').orderBy('time', 'desc').limit(10).get();
                comments[s.id] = [];
                commentSnap.forEach(c => comments[s.id].push(c.data()));
                const viewSnap = await db.collection('scripts').doc(s.id).collection('views').doc('stats').get();
                if (viewSnap.exists) viewCounts[s.id] = viewSnap.data().count || 0;
                else viewCounts[s.id] = 0;
            } catch(e) {
                console.error('Script verileri yüklenirken hata:', s.id, e);
            }
        }
        return communityScripts;
    } catch(e) {
        console.error(e);
        return [];
    }
}

async function loadCommunityGames() {
    try {
        const snap = await db.collection('games').orderBy('createdAt', 'desc').limit(200).get();
        communityGames = [];
        snap.forEach(d => {
            const data = d.data();
            communityGames.push({ id: d.id, ...data, isCommunityGame: true });
        });
        return communityGames;
    } catch(e) {
        console.error(e);
        return [];
    }
}

async function addScriptToFirebase(data) {
    try {
        const docRef = await db.collection('scripts').add({
            ...data,
            userId: currentUser?.uid || null,
            userEmail: currentUser?.email || null,
            userName: currentUser?.displayName || 'Anonim',
            commentCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('scripts').doc(docRef.id).collection('ratings').doc('stats').set({ avg: 0, count: 0 });
        await db.collection('scripts').doc(docRef.id).collection('views').doc('stats').set({ count: 0 });
        addNotification(`📜 Yeni script eklendi: ${data.name}`, 'script');
        return docRef.id;
    } catch(e) {
        console.error(e);
        showToast('❌ Script eklenirken hata oluştu!');
        return null;
    }
}

async function addGameToFirebase(data) {
    try {
        const docRef = await db.collection('games').add({
            ...data,
            userId: currentUser?.uid || null,
            userEmail: currentUser?.email || null,
            userName: currentUser?.displayName || 'Anonim',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        addNotification(`🎮 Yeni oyun eklendi: ${data.name}`, 'game');
        return docRef.id;
    } catch(e) {
        console.error(e);
        showToast('❌ Oyun eklenirken hata oluştu!');
        return null;
    }
}

async function deleteScriptFromFirebase(id) {
    try {
        await db.collection('scripts').doc(id).delete();
        return true;
    } catch(e) {
        console.error(e);
        return false;
    }
}

async function deleteGameFromFirebase(id) {
    try {
        await db.collection('games').doc(id).delete();
        return true;
    } catch(e) {
        console.error(e);
        return false;
    }
}

// ==========================================
// RATING & COMMENTS
// ==========================================
async function rateScript(scriptId, rating) {
    if (!currentUser) {
        showToast('❌ Puan vermek için giriş yapın!');
        openAuthModal();
        return;
    }
    try {
        const docRef = db.collection('scripts').doc(scriptId).collection('ratings').doc('stats');
        const userRef = db.collection('scripts').doc(scriptId).collection('ratings').doc(currentUser.uid);
        await userRef.set({ rating, user: currentUser.uid, name: currentUser.displayName || 'Anonim' });
        const all = await db.collection('scripts').doc(scriptId).collection('ratings').get();
        let total = 0, count = 0;
        all.forEach(d => {
            if (d.id !== 'stats') {
                total += d.data().rating;
                count++;
            }
        });
        const avg = count > 0 ? total / count : 0;
        await docRef.set({ avg, count });
        ratings[scriptId] = { avg, count };
        render();
        showToast(`⭐ Puan verildi! Ortalama: ${avg.toFixed(1)}`);
    } catch(e) {
        console.error('Puan hatası:', e);
        showToast('❌ Puan verilirken hata oluştu!');
    }
}

async function addComment(scriptId, text) {
    if (!currentUser) {
        showToast('❌ Yorum yapmak için giriş yapın!');
        openAuthModal();
        return;
    }
    if (!text || !text.trim()) {
        showToast('❌ Yorum boş olamaz!');
        return;
    }
    const all = getAllScripts();
    const script = all.find(s => s.id === scriptId);
    if (script && script.isPremium) {
        showToast('❌ Premium scriptlere yorum yapılamaz!');
        return;
    }
    const filteredText = filterContent(text.trim());
    const input = document.getElementById(`cmt_${scriptId}`);
    const btn = input?.nextElementSibling;
    try {
        if (btn) { btn.disabled = true; btn.textContent = '⏳'; }
        const docRef = await db.collection('scripts').doc(scriptId).collection('comments').add({
            user: currentUser.displayName || 'Anonim',
            userId: currentUser.uid,
            userPhoto: currentUser.photoURL || IMG.users,
            text: filteredText,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0
        });
        try {
            const scriptDoc = await db.collection('scripts').doc(scriptId).get();
            if (scriptDoc.exists) {
                if (scriptDoc.data().commentCount === undefined) {
                    await db.collection('scripts').doc(scriptId).set({ commentCount: 0 }, { merge: true });
                }
                await db.collection('scripts').doc(scriptId).update({
                    commentCount: firebase.firestore.FieldValue.increment(1)
                });
            }
        } catch(e) {
            console.log('commentCount güncelleme hatası:', e);
        }
        if (!comments[scriptId]) comments[scriptId] = [];
        comments[scriptId].unshift({
            id: docRef.id,
            user: currentUser.displayName || 'Anonim',
            userId: currentUser.uid,
            userPhoto: currentUser.photoURL || IMG.users,
            text: filteredText,
            time: { seconds: Date.now() / 1000 },
            likes: 0
        });
        if (input) input.value = '';
        completeDailyTask('daily_comment');
        addNotification(`💬 ${currentUser.displayName} bir yorum yazdı`, 'comment');
        render();
        showToast('✅ Yorum eklendi!');
        await loadCommunityScripts();
        render();
    } catch(error) {
        console.error('Yorum hatası:', error);
        showToast('❌ Yorum eklenirken hata oluştu: ' + error.message);
        render();
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Gönder'; }
    }
}

// ==========================================
// GÜNLÜK GÖREVLER
// ==========================================
function getDailyProgress() {
    if (!currentUser) return { date: new Date().toDateString(), tasks: {} };
    const today = new Date().toDateString();
    const progress = JSON.parse(localStorage.getItem(`daily_${currentUser.uid}`)) || {};
    if (progress.date !== today) {
        return { date: today, tasks: {} };
    }
    return progress;
}

function completeDailyTask(taskId) {
    if (!currentUser) return;
    const progress = getDailyProgress();
    if (progress.tasks[taskId]) return;
    progress.tasks[taskId] = true;
    progress.date = new Date().toDateString();
    localStorage.setItem(`daily_${currentUser.uid}`, JSON.stringify(progress));
    showToast(`✅ Görev tamamlandı!`);
    addNotification(`🎯 Günlük görev tamamlandı: ${dailyTasks.find(t => t.id === taskId)?.name}`, 'task');
    renderDailyTasks();
}

function renderDailyTasks() {
    if (!currentUser) return;
    const progress = getDailyProgress();
    dailyTasksList.innerHTML = dailyTasks.map(task => `
        <div class="daily-task ${progress.tasks[task.id] ? 'completed' : ''}">
            <span class="task-icon">${task.icon}</span>
            <div class="task-info">
                <div class="task-name">${task.name}</div>
                <div class="task-desc">${task.desc}</div>
                <div class="task-reward">${task.reward}</div>
            </div>
            <span class="task-status">${progress.tasks[task.id] ? '✅' : '⬜'}</span>
        </div>
    `).join('');
}

// ==========================================
// GÖRÜNTÜLENME SAYACI
// ==========================================
async function incrementView(scriptId) {
    if (!scriptId) return;
    try {
        const viewRef = db.collection('scripts').doc(scriptId).collection('views').doc('stats');
        await viewRef.set({ count: firebase.firestore.FieldValue.increment(1) }, { merge: true });
        viewCounts[scriptId] = (viewCounts[scriptId] || 0) + 1;
        const views = JSON.parse(localStorage.getItem(`daily_views_${currentUser?.uid}`)) || 0;
        localStorage.setItem(`daily_views_${currentUser?.uid}`, views + 1);
        if (views + 1 >= 5) {
            completeDailyTask('daily_view');
        }
    } catch(e) {
        console.error('Görüntülenme hatası:', e);
    }
}

// ==========================================
// BİLDİRİMLER
// ==========================================
function addNotification(msg, type = 'info') {
    const notif = { id: Date.now(), msg, type, time: new Date().toLocaleString('tr-TR'), read: false };
    notifications.unshift(notif);
    if (notifications.length > 50) notifications.pop();
    localStorage.setItem('scriptHubNotifs', JSON.stringify(notifications));
    updateNotificationUI();
    if (!document.hidden) showToast('🔔 ' + msg, 3000);
}

function updateNotificationUI() {
    const unread = notifications.filter(n => !n.read).length;
    notifDot.classList.toggle('show', unread > 0);
    notifCount = unread;
    notificationList.innerHTML = notifications.length === 0 ?
        '<div class="notif-item" style="color:var(--text-muted)">Bildirim yok</div>' :
        notifications.slice(0, 15).map(n =>
            `<div class="notif-item" style="${n.read ? 'opacity:0.6' : ''}">${n.msg}<span class="notif-time">${n.time}</span></div>`
        ).join('');
}

// ==========================================
// TEMA & DİL
// ==========================================
function setTheme(theme) {
    document.body.className = theme;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
    localStorage.setItem('scriptHubTheme', theme);
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('scriptHubLang', lang);
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    const translations = {
        tr: { search: 'Script veya oyun ara...', addScript: 'Script Ekle', addGame: 'Oyun Ekle', login: 'Giriş Yap' },
        en: { search: 'Search script or game...', addScript: 'Add Script', addGame: 'Add Game', login: 'Login' }
    };
    const t = translations[lang] || translations.tr;
    searchInput.placeholder = t.search;
    addScriptBtn.innerHTML = `<img src="https://i.postimg.cc/vT1sHWqq/Gemini-Generated-Image-xefq68xefq68xefq.png" alt="Ekle"> ${t.addScript}`;
    addGameBtn.textContent = `🎮 ${t.addGame}`;
    showToast(`🌐 ${lang === 'tr' ? 'Türkçe' : 'English'}`);
}

// ==========================================
// GAMES RENDER
// ==========================================
const GAME_LINKS = {
    mm2: 'https://www.roblox.com/games/142823291/Murder-Mystery-2',
    bloxfruits: 'https://www.roblox.com/games/2753915549/Blox-Fruits',
    petsim: 'https://www.roblox.com/games/13566893764/Pet-Simulator-99',
    dahood: 'https://www.roblox.com/games/2788229376/Da-Hood',
    bladeball: 'https://www.roblox.com/games/13772394625/Blade-Ball',
    brookhaven: 'https://www.roblox.com/games/4924922222/Brookhaven-RP',
    other: 'https://www.roblox.com/games'
};

const DEFAULT_GAME_NAMES = {
    mm2: 'Murder Mystery 2',
    bloxfruits: 'Blox Fruits',
    petsim: 'Pet Simulator 99',
    dahood: 'Da Hood',
    bladeball: 'Blade Ball',
    brookhaven: 'Brookhaven RP',
    other: 'Diğer Oyunlar'
};

function renderGames() {
    const defaultGameKeys = ['mm2', 'bloxfruits', 'petsim', 'dahood', 'bladeball', 'brookhaven', 'other'];
    const allGameKeys = [...defaultGameKeys];
    const gameData = {};
    defaultGameKeys.forEach(key => {
        gameData[key] = {
            name: DEFAULT_GAME_NAMES[key],
            link: GAME_LINKS[key],
            image: IMG[key] || IMG.other,
            isCustom: false
        };
    });
    communityGames.forEach(game => {
        const id = `custom_${game.id}`;
        allGameKeys.push(id);
        gameData[id] = {
            name: game.name,
            link: game.link,
            image: game.image,
            desc: game.desc || '',
            author: game.userName || 'Anonim',
            isCustom: true,
            gameId: game.id,
            userId: game.userId
        };
    });
    
    return `
        <div style="grid-column:1/-1;margin-bottom:0.5rem">
            <div class="section-title"><span>🎮</span> OYUNLAR <span style="font-size:0.7rem;color:var(--text-muted);font-weight:400;margin-left:0.5rem">Toplam ${allGameKeys.length} oyun</span></div>
        </div>
        ${allGameKeys.map(key => {
            const game = gameData[key];
            if (!game) return '';
            const isOwner = currentUser && game.isCustom && game.userId === currentUser.uid;
            return `
                <div class="game-card script-card">
                    <div class="card-image"><img src="${escapeHtml(game.image)}" alt="${escapeHtml(game.name)}" loading="lazy" onerror="this.src='${DEFAULT_IMAGE}'"></div>
                    <div class="card-body">
                        <div class="card-header"><h3><img src="${escapeHtml(game.image)}" alt="${escapeHtml(game.name)}" style="width:20px;height:20px;border-radius:4px;object-fit:cover" onerror="this.src='${DEFAULT_IMAGE}'">${escapeHtml(game.name)}${game.isCustom?'<span class="game-owner-tag">👤 Topluluk</span>':''}</h3><span style="font-size:1.2rem">▶️</span></div>
                        <div style="color:var(--text-muted);font-size:0.75rem;margin:0.2rem 0 0.5rem">${escapeHtml(game.desc||(game.isCustom?'Topluluk tarafından eklendi':'Roblox oyununa gitmek için tıkla'))}</div>
                        ${game.isCustom?`<div class="script-owner"><img src="${IMG.users}" style="width:14px;height:14px">${escapeHtml(game.author)}${isOwner?' <span class="badge owner-badge">👑 Sahibim</span>':''}</div>`:''}
                        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.3rem">
                            <span style="background:rgba(34,197,94,0.1);color:#4ade80;font-size:0.6rem;padding:0.05rem 0.6rem;border-radius:20px">🎮 Oyun</span>
                            <span style="background:rgba(167,139,250,0.1);color:var(--accent-light);font-size:0.6rem;padding:0.05rem 0.6rem;border-radius:20px">🟢 Açık</span>
                            ${game.isCustom?'<span style="background:rgba(251,191,36,0.1);color:#fbbf24;font-size:0.6rem;padding:0.05rem 0.6rem;border-radius:20px">👥 Topluluk</span>':''}
                        </div>
                        <div class="card-footer">
                            <span class="badge ${game.isCustom?'game-badge-custom':''}" style="${game.isCustom?'background:rgba(251,191,36,0.15);color:#fbbf24':''}">▶️ Oyna</span>
                            <div style="display:flex;gap:0.5rem">${isOwner?`<button class="delete-btn" data-gameid="${game.gameId}"><img src="${IMG.delete}" alt="Sil"> Sil</button>`:''}<a href="${escapeHtml(game.link)}" target="_blank" class="game-play-btn">🚀 Oyuna Git</a></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

// ==========================================
// LİDERLİK TABLOSU
// ==========================================
async function renderLeaderboard() {
    const container = document.getElementById('leaderboardContent');
    let html = `
        <div class="admin-tabs">
            <button class="${leaderboardFilter === 'scripts' ? 'active' : ''}" onclick="setLeaderboardFilter('scripts')">📜 Script</button>
            <button class="${leaderboardFilter === 'rating' ? 'active' : ''}" onclick="setLeaderboardFilter('rating')">⭐ Puan</button>
            <button class="${leaderboardFilter === 'comments' ? 'active' : ''}" onclick="setLeaderboardFilter('comments')">💬 Yorum</button>
            <button class="${leaderboardFilter === 'games' ? 'active' : ''}" onclick="setLeaderboardFilter('games')">🎮 Oyun</button>
        </div>
    `;
    let leaderboardData = [];
    try {
        if (leaderboardFilter === 'scripts') {
            const userScriptCounts = {};
            communityScripts.forEach(s => {
                if (s.userId) {
                    userScriptCounts[s.userId] = userScriptCounts[s.userId] || { count: 0, name: s.userName || 'Anonim' };
                    userScriptCounts[s.userId].count++;
                }
            });
            leaderboardData = Object.entries(userScriptCounts).map(([userId, data]) => ({
                id: userId, name: data.name, score: data.count, type: 'scripts'
            }));
        } else if (leaderboardFilter === 'rating') {
            const userRating = {};
            communityScripts.forEach(s => {
                if (s.userId && ratings[s.id]) {
                    userRating[s.userId] = userRating[s.userId] || { total: 0, count: 0, name: s.userName || 'Anonim' };
                    userRating[s.userId].total += ratings[s.id].avg || 0;
                    userRating[s.userId].count++;
                }
            });
            leaderboardData = Object.entries(userRating).map(([userId, data]) => ({
                id: userId, name: data.name, score: data.count > 0 ? (data.total / data.count) : 0, type: 'rating'
            }));
        } else if (leaderboardFilter === 'comments') {
            const userCommentCounts = {};
            Object.values(comments).forEach(commentList => {
                if (Array.isArray(commentList)) {
                    commentList.forEach(c => {
                        if (c && c.userId) {
                            userCommentCounts[c.userId] = userCommentCounts[c.userId] || { count: 0, name: c.user || 'Anonim' };
                            userCommentCounts[c.userId].count++;
                        }
                    });
                }
            });
            leaderboardData = Object.entries(userCommentCounts).map(([userId, data]) => ({
                id: userId, name: data.name, score: data.count, type: 'comments'
            }));
        } else if (leaderboardFilter === 'games') {
            const userGameCounts = {};
            communityGames.forEach(g => {
                if (g.userId) {
                    userGameCounts[g.userId] = userGameCounts[g.userId] || { count: 0, name: g.userName || 'Anonim' };
                    userGameCounts[g.userId].count++;
                }
            });
            leaderboardData = Object.entries(userGameCounts).map(([userId, data]) => ({
                id: userId, name: data.name, score: data.count, type: 'games'
            }));
        }
    } catch(e) {
        console.error('Liderlik verileri hatası:', e);
    }
    leaderboardData.sort((a, b) => b.score - a.score);
    leaderboardData = leaderboardData.slice(0, 20);
    
    if (leaderboardData.length === 0) {
        html += `<div class="empty-state"><div class="icon">📊</div><p>Henüz veri yok</p></div>`;
    } else {
        html += `<div class="leaderboard-list">
            ${leaderboardData.map((item, index) => {
                const rank = index + 1;
                let rankClass = '';
                if (rank === 1) rankClass = 'gold';
                else if (rank === 2) rankClass = 'silver';
                else if (rank === 3) rankClass = 'bronze';
                const scoreLabel = item.type === 'scripts' ? 'script' :
                    item.type === 'rating' ? '⭐ puan' :
                    item.type === 'comments' ? 'yorum' : 'oyun';
                const isCurrentUser = currentUser && item.id === currentUser.uid;
                return `<div class="leaderboard-item" style="${isCurrentUser ? 'border-color:var(--accent);border-width:2px' : ''}">
                    <div class="rank ${rankClass}">#${rank}</div>
                    <div class="info">
                        <div class="name">${escapeHtml(item.name)} ${isCurrentUser ? '👈' : ''}</div>
                        <div class="sub">${item.score} ${scoreLabel}</div>
                    </div>
                    <div class="score">${item.score}</div>
                </div>`;
            }).join('')}
        </div>`;
    }
    container.innerHTML = html;
}

function setLeaderboardFilter(filter) {
    leaderboardFilter = filter;
    renderLeaderboard();
}

// ==========================================
// KULLANICI ARAYÜZÜ
// ==========================================
function updateAuthUI(user) {
    currentUser = user;
    if (user) {
        const name = user.displayName || user.email || 'Kullanıcı';
        const photo = user.photoURL || IMG.users;
        authSection.innerHTML = `
            <button class="auth-btn" id="profileBtn" style="gap:0.5rem">
                <img src="${photo}" alt="Avatar" class="user-avatar" onerror="this.src='${IMG.users}'">
                <span class="user-name">${escapeHtml(name)}</span>
            </button>
        `;
        document.getElementById('profileBtn')?.addEventListener('click', openProfileModal);
        renderDailyTasks();
        dailyTasksContainer.style.display = 'block';
        if (isAdmin(user)) {
            adminBtn.style.display = 'flex';
        } else {
            adminBtn.style.display = 'none';
        }
    } else {
        authSection.innerHTML = `
            <button class="auth-btn" id="loginBtn">
                <img src="${IMG.login}" alt="Giriş" style="width:20px;height:20px;border-radius:4px"> Giriş Yap
            </button>
        `;
        document.getElementById('loginBtn')?.addEventListener('click', openAuthModal);
        dailyTasksContainer.style.display = 'none';
        adminBtn.style.display = 'none';
    }
}

// ==========================================
// PROFİL
// ==========================================
function renderProfile() {
    if (!currentUser) {
        document.getElementById('profileContent').innerHTML = `
            <div style="text-align:center;padding:2rem;color:var(--text-muted)">
                <div style="font-size:2rem">🔒</div>
                <p style="margin-top:0.5rem">Lütfen giriş yapın</p>
                <button class="submit-btn" style="margin-top:1rem;padding:0.5rem 2rem;width:auto" onclick="document.getElementById('loginBtn').click()">Giriş Yap</button>
            </div>
        `;
        return;
    }
    try {
        const userData = JSON.parse(localStorage.getItem(`user_${currentUser.uid}`)) || {};
        const userScripts = communityScripts.filter(s => s.userId === currentUser.uid);
        const userGames = communityGames.filter(g => g.userId === currentUser.uid);
        const safeFavs = favorites.filter(id => typeof id === 'string');
        const userFavs = safeFavs.filter(id => !id.startsWith('p'));
        let userComments = [];
        try {
            Object.values(comments).forEach(commentList => {
                if (Array.isArray(commentList)) {
                    commentList.forEach(c => {
                        if (c && c.userId === currentUser.uid) userComments.push(c);
                    });
                }
            });
        } catch(e) {}
        const userAchievements = getUserBadges(currentUser);
        
        const html = `
            <div class="profile-header">
                <img src="${currentUser.photoURL || IMG.users}" alt="Profil Avatarı" class="profile-avatar" onerror="this.src='${IMG.users}'" id="profileAvatar" style="border-radius:${userData.avatarFrame === 'rounded' ? '20px' : userData.avatarFrame === 'square' ? '8px' : '50%'};filter:${userData.avatarFilter === 'grayscale' ? 'grayscale(100%)' : userData.avatarFilter === 'sepia' ? 'sepia(80%)' : userData.avatarFilter === 'blur' ? 'blur(2px)' : 'none'}">
                <div class="profile-info">
                    <h3>${escapeHtml(currentUser.displayName || 'Kullanıcı')}</h3>
                    <p>📧 ${escapeHtml(currentUser.email)}</p>
                    ${userData.bio ? `<p style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.3rem">${escapeHtml(userData.bio)}</p>` : ''}
                    <p style="color:var(--text-muted);font-size:0.7rem">📅 Üyelik: ${new Date(currentUser.metadata?.creationTime || Date.now()).toLocaleDateString('tr-TR')}</p>
                    <div style="display:flex;gap:0.5rem;margin-top:0.5rem;flex-wrap:wrap">
                        ${userAchievements.filter(b => b.unlocked).map(a => `<span class="badge-achievement unlocked">${a.icon} ${a.name}</span>`).join('')}
                        <button class="profile-edit-btn" id="openProfileEditBtn">✏️ Profili Düzenle</button>
                    </div>
                    <div style="margin-top:0.5rem">
                        <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.3rem">🎖️ Tüm Rozetler</div>
                        <div class="badge-collection">
                            ${userAchievements.map(a => `
                                <div class="badge-item ${a.unlocked ? 'unlocked' : 'locked'}" style="min-width:60px;padding:0.3rem">
                                    <div class="icon" style="font-size:1.5rem">${a.icon}</div>
                                    <div class="name" style="font-size:0.5rem">${a.name}</div>
                                    ${a.unlocked ? '<div style="color:#4ade80;font-size:0.5rem">✅</div>' : '<div style="color:#6b6b92;font-size:0.5rem">🔒</div>'}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="profile-stats">
                <div class="stat"><div class="number">${userScripts.length}</div><span class="label">📜 Script</span></div>
                <div class="stat"><div class="number">${userGames.length}</div><span class="label">🎮 Oyun</span></div>
                <div class="stat"><div class="number">${userFavs.length}</div><span class="label">❤️ Favori</span></div>
                <div class="stat"><div class="number">${userComments.length}</div><span class="label">💬 Yorum</span></div>
                <div class="stat"><div class="number">${premiumScripts.length + communityScripts.length}</div><span class="label">📚 Toplam Script</span></div>
            </div>
            ${userData.social?.discord || userData.social?.youtube || userData.social?.tiktok ? `
                <div style="display:flex;gap:0.5rem;margin:0.5rem 0;flex-wrap:wrap">
                    ${userData.social.discord ? `<a href="${userData.social.discord}" target="_blank" style="color:var(--accent-light);font-size:0.7rem">💬 Discord</a>` : ''}
                    ${userData.social.youtube ? `<a href="${userData.social.youtube}" target="_blank" style="color:var(--accent-light);font-size:0.7rem">▶️ YouTube</a>` : ''}
                    ${userData.social.tiktok ? `<a href="${userData.social.tiktok}" target="_blank" style="color:var(--accent-light);font-size:0.7rem">🎵 TikTok</a>` : ''}
                </div>
            ` : ''}
            <div style="margin:1rem 0">
                <h4 style="color:var(--text-primary);font-size:0.9rem;margin-bottom:0.5rem">📜 Eklediğim Scriptler (${userScripts.length})</h4>
                <div class="profile-items">${userScripts.length === 0 ? '<div class="profile-empty">Henüz script eklemedin</div>' :
                    userScripts.map(s => `<div class="profile-item"><span><span class="item-name">${escapeHtml(s.name)}</span><span class="item-category">${s.category.toUpperCase()}</span></span><div class="item-actions"><button class="danger" data-id="${s.id}" data-type="script">🗑️</button></div></div>`).join('')}
                </div>
            </div>
            <div style="margin:1rem 0">
                <h4 style="color:var(--text-primary);font-size:0.9rem;margin-bottom:0.5rem">🎮 Eklediğim Oyunlar (${userGames.length})</h4>
                <div class="profile-items">${userGames.length === 0 ? '<div class="profile-empty">Henüz oyun eklemedin</div>' :
                    userGames.map(g => `<div class="profile-item"><span><span class="item-name">${escapeHtml(g.name)}</span><span class="item-category">🔗 Oyun</span></span><div class="item-actions"><button onclick="window.open('${escapeHtml(g.link)}','_blank')">▶️</button><button class="danger" data-id="${g.id}" data-type="game">🗑️</button></div></div>`).join('')}
                </div>
            </div>
            <div class="profile-actions">
                <button class="backup-btn" onclick="backupUserData()" style="font-size:0.7rem;padding:0.3rem 1rem">💾 Verileri Yedekle</button>
                <button class="logout-btn" id="profileLogoutBtn"><img src="${IMG.logout}" alt="Çıkış"> Çıkış Yap</button>
            </div>
        `;
        document.getElementById('profileContent').innerHTML = html;
        document.getElementById('profileLogoutBtn')?.addEventListener('click', () => {
            auth.signOut();
            closeProfileModalFn();
            showToast('👋 Çıkış yapıldı!');
        });
        document.getElementById('openProfileEditBtn')?.addEventListener('click', openProfileEditModal);
        document.querySelectorAll('#profileContent .profile-item .danger').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.dataset.id, type = this.dataset.type;
                if (!confirm('Silmek istediğine emin misin?')) return;
                if (type === 'script' && await deleteScriptFromFirebase(id)) {
                    await loadCommunityScripts();
                    render();
                    renderProfile();
                    showToast('🗑️ Script silindi!');
                } else if (type === 'game' && await deleteGameFromFirebase(id)) {
                    await loadCommunityGames();
                    render();
                    renderProfile();
                    showToast('🗑️ Oyun silindi!');
                }
            });
        });
    } catch(e) {
        console.error('Profil render hatası:', e);
        document.getElementById('profileContent').innerHTML = `
            <div style="text-align:center;padding:2rem;color:var(--text-muted)">
                <div style="font-size:2rem">⚠️</div>
                <p style="margin-top:0.5rem">Profil yüklenirken bir hata oluştu</p>
                <button class="submit-btn" style="margin-top:1rem;padding:0.5rem 2rem;width:auto" onclick="renderProfile()">🔄 Tekrar Dene</button>
            </div>
        `;
    }
}

function getUserBadges(user) {
    if (!user) return BADGES.map(b => ({ ...b, unlocked: false }));
    try {
        const safeFavs = favorites.filter(id => typeof id === 'string');
        const userFavs = safeFavs.filter(id => !id.startsWith('p'));
        const userScripts = communityScripts.filter(s => s.userId === user.uid);
        let userComments = 0;
        try {
            Object.values(comments).forEach(commentList => {
                if (Array.isArray(commentList)) {
                    commentList.forEach(c => {
                        if (c && c.userId === user.uid) userComments++;
                    });
                }
            });
        } catch(e) {}
        const dailyProgress = JSON.parse(localStorage.getItem(`daily_${user.uid}`)) || {};
        const dailyCount = Object.keys(dailyProgress.tasks || {}).length;
        return BADGES.map(badge => {
            let unlocked = false;
            try {
                if (badge.id === 'first_script') unlocked = userScripts.length >= 1;
                else if (badge.id === 'script_master') unlocked = userScripts.length >= 10;
                else if (badge.id === 'script_legend') unlocked = userScripts.length >= 50;
                else if (badge.id === 'favorite_lover') unlocked = userFavs.length >= 5;
                else if (badge.id === 'favorite_master') unlocked = userFavs.length >= 20;
                else if (badge.id === 'comment_master') unlocked = userComments >= 10;
                else if (badge.id === 'comment_legend') unlocked = userComments >= 50;
                else if (badge.id === 'daily_grinder') unlocked = dailyCount >= 7;
                else if (badge.id === 'community_hero') unlocked = userScripts.length >= 20;
                else if (badge.id === 'premium_user') unlocked = false;
            } catch(e) {}
            return { ...badge, unlocked };
        });
    } catch(e) {
        return BADGES.map(b => ({ ...b, unlocked: false }));
    }
}

// ==========================================
// BACKUP
// ==========================================
async function backupUserData() {
    if (!currentUser) {
        showToast('❌ Yedekleme için giriş yapın!');
        return;
    }
    try {
        const data = {
            user: currentUser.uid,
            favorites: favorites,
            notifications: notifications,
            userData: localStorage.getItem(`user_${currentUser.uid}`),
            date: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scripthub_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('✅ Veriler yedeklendi!');
    } catch(e) {
        showToast('❌ Yedekleme hatası: ' + e.message);
    }
}
window.backupUserData = backupUserData;

// ==========================================
// AVATAR SEÇİMİ
// ==========================================
function selectAvatar(el) {
    document.querySelectorAll('.avatar-option').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    selectedAvatar = el.dataset.avatar;
    uploadedAvatarUrl = null;
    document.getElementById('avatarStatus').textContent = '✅ Avatar seçildi';
    document.getElementById('avatarStatus').style.color = '#4ade80';
}
window.selectAvatar = selectAvatar;

// Avatar yükleme
avatarFileInput.addEventListener('change', function(e) {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        showToast('❌ Dosya boyutu 5MB\'dan büyük olamaz!');
        this.value = '';
        return;
    }
    if (!file.type.startsWith('image/')) {
        showToast('❌ Lütfen bir resim dosyası seçin!');
        this.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        uploadedAvatarUrl = dataUrl;
        selectedAvatar = dataUrl;
        const uploadOption = document.getElementById('uploadAvatarOption');
        uploadOption.innerHTML = `<img src="${dataUrl}" alt="Yüklenen Avatar" style="width:100%;height:100%;object-fit:cover">`;
        uploadOption.classList.add('selected');
        document.querySelectorAll('.avatar-option').forEach(el => {
            if (el.id !== 'uploadAvatarOption') el.classList.remove('selected');
        });
        document.getElementById('avatarStatus').textContent = '✅ Kendi avatarın yüklendi!';
        document.getElementById('avatarStatus').style.color = '#4ade80';
    };
    reader.readAsDataURL(file);
});

document.getElementById('googlePhotoBtn')?.addEventListener('click', function() {
    const url = prompt('Google Fotoğraflar\'dan paylaşım linkini veya resim URL\'sini yapıştır:');
    if (url && url.trim() && (url.startsWith('http://') || url.startsWith('https://'))) {
        uploadedAvatarUrl = url.trim();
        selectedAvatar = url.trim();
        const uploadOption = document.getElementById('uploadAvatarOption');
        uploadOption.innerHTML = `<img src="${url.trim()}" alt="Google Foto" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<span class=\\'upload-icon\\'>📤</span>'; showToast('❌ Geçersiz resim URL\\'si!')">`;
        uploadOption.classList.add('selected');
        document.querySelectorAll('.avatar-option').forEach(el => {
            if (el.id !== 'uploadAvatarOption') el.classList.remove('selected');
        });
        document.getElementById('avatarStatus').textContent = '✅ Google Fotoğraf seçildi!';
        document.getElementById('avatarStatus').style.color = '#4ade80';
    } else showToast('❌ Geçerli bir URL girin!');
});

// ==========================================
// AUTH İŞLEMLERİ
// ==========================================
// Login
document.getElementById('loginSubmitBtn')?.addEventListener('click', async function() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginError');
    if (!email || !password) {
        errorDiv.textContent = '❌ E-posta ve şifre girin!';
        errorDiv.style.display = 'block';
        return;
    }
    errorDiv.style.display = 'none';
    this.disabled = true;
    this.textContent = '⏳ Giriş yapılıyor...';
    try {
        await auth.signInWithEmailAndPassword(email, password);
        closeAuthModalFn();
        showToast('✅ Hoş geldin!');
        completeDailyTask('daily_login');
    } catch(error) {
        errorDiv.textContent = '❌ ' + error.message;
        errorDiv.style.display = 'block';
    } finally {
        this.disabled = false;
        this.textContent = '🚀 Giriş Yap';
    }
});

// Register
document.getElementById('registerSubmitBtn')?.addEventListener('click', async function() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    if (!username || !email || !password) {
        errorDiv.textContent = '❌ Tüm alanları doldurun!';
        errorDiv.style.display = 'block';
        return;
    }
    if (password.length < 6) {
        errorDiv.textContent = '❌ Şifre en az 6 karakter olmalı!';
        errorDiv.style.display = 'block';
        return;
    }
    if (username.length < 3) {
        errorDiv.textContent = '❌ Kullanıcı adı en az 3 karakter olmalı!';
        errorDiv.style.display = 'block';
        return;
    }
    let avatarUrl = selectedAvatar || AVATAR_1;
    if (uploadedAvatarUrl && uploadedAvatarUrl.startsWith('data:image')) {
        try {
            const resp = await fetch(uploadedAvatarUrl);
            const blob = await resp.blob();
            const avatarRef = storage.ref().child(`avatars/${Date.now()}_${username}.jpg`);
            await avatarRef.put(blob);
            avatarUrl = await avatarRef.getDownloadURL();
        } catch(e) {
            console.error(e);
            avatarUrl = AVATAR_1;
        }
    } else if (uploadedAvatarUrl && uploadedAvatarUrl.startsWith('http')) {
        avatarUrl = uploadedAvatarUrl;
    }
    this.disabled = true;
    this.textContent = '⏳ Kayıt yapılıyor...';
    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        await userCred.user.updateProfile({ displayName: username, photoURL: avatarUrl });
        successDiv.textContent = '✅ Hesabın oluşturuldu! Hoş geldin ' + username + '!';
        successDiv.style.display = 'block';
        setTimeout(() => {
            closeAuthModalFn();
            showToast('✅ Hoş geldin, ' + username + '! 🎉');
            completeDailyTask('daily_login');
        }, 1500);
    } catch(error) {
        errorDiv.textContent = '❌ ' + error.message;
        errorDiv.style.display = 'block';
    } finally {
        this.disabled = false;
        this.textContent = '🚀 Kayıt Ol';
    }
});

// Google Login
document.getElementById('googleLoginBtn')?.addEventListener('click', async function() {
    this.disabled = true;
    this.textContent = '⏳ Yönlendiriliyor...';
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        closeAuthModalFn();
        showToast('✅ Google ile giriş yapıldı!');
        completeDailyTask('daily_login');
    } catch(error) {
        showToast('❌ ' + error.message);
    } finally {
        this.disabled = false;
        this.textContent = 'Google ile Giriş Yap';
    }
});

document.getElementById('googleRegisterBtn')?.addEventListener('click', async function() {
    this.disabled = true;
    this.textContent = '⏳ Yönlendiriliyor...';
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        closeAuthModalFn();
        showToast('✅ Google ile kayıt yapıldı!');
        completeDailyTask('daily_login');
    } catch(error) {
        showToast('❌ ' + error.message);
    } finally {
        this.disabled = false;
        this.textContent = 'Google ile Kayıt Ol';
    }
});

// Auth state
auth.onAuthStateChanged(user => updateAuthUI(user));

// ==========================================
// EVENT LISTENERS
// ==========================================
// Chat widget
document.getElementById('chatToggleBtn')?.addEventListener('click', function(e) {
    e.stopPropagation();
    const frame = document.getElementById('chatFrame');
    const isOpen = frame.classList.toggle('open');
    this.innerHTML = isOpen ? '✕' : '💬';
    this.style.background = isOpen ?
        'linear-gradient(135deg, #ef4444, #dc2626)' :
        'linear-gradient(135deg, #7c3aed, #6d28d9)';
});

// Theme buttons
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
});

// Category buttons
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.cat;
        currentPage = 1;
        render();
    });
});

// Search
searchInput.addEventListener('input', function() {
    searchTerm = this.value;
    currentPage = 1;
    render();
});

// Sort buttons
document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        sortMode = this.dataset.sort;
        filterSort.value = sortMode;
        currentPage = 1;
        render();
    });
});

// Filter
filterSort.addEventListener('change', function() {
    sortMode = this.value;
    currentPage = 1;
    render();
});
filterTypeEl.addEventListener('change', function() {
    filterType = this.value;
    currentPage = 1;
    render();
});
filterRatingEl.addEventListener('change', function() {
    filterRating = parseInt(this.value);
    currentPage = 1;
    render();
});

// Modals
addScriptBtn.addEventListener('click', () => {
    if (!currentUser) {
        showToast('❌ Lütfen önce giriş yapın!');
        openAuthModal();
        return;
    }
    openModal('addModal');
});
closeAddModal.addEventListener('click', () => closeModal('addModal'));
addModal.addEventListener('click', e => {
    if (e.target === addModal) closeModal('addModal');
});

addGameBtn.addEventListener('click', () => {
    if (!currentUser) {
        showToast('❌ Lütfen önce giriş yapın!');
        openAuthModal();
        return;
    }
    openModal('addGameModal');
});
closeAddGameModal.addEventListener('click', () => closeModal('addGameModal'));
addGameModal.addEventListener('click', e => {
    if (e.target === addGameModal) closeModal('addGameModal');
});

loginBtn?.addEventListener('click', openAuthModal);
closeAuthModal.addEventListener('click', closeAuthModalFn);
authModal.addEventListener('click', e => {
    if (e.target === authModal) closeAuthModalFn();
});

closeProfileModal.addEventListener('click', closeProfileModalFn);
profileModal.addEventListener('click', e => {
    if (e.target === profileModal) closeProfileModalFn();
});

closeProfileEditModal.addEventListener('click', closeProfileEditModalFn);
profileEditModal.addEventListener('click', e => {
    if (e.target === profileEditModal) closeProfileEditModalFn();
});

closeAdminModal.addEventListener('click', closeAdminModalFn);
adminModal.addEventListener('click', e => {
    if (e.target === adminModal) closeAdminModalFn();
});

closeLeaderboardModal.addEventListener('click', closeLeaderboardFn);
leaderboardModal.addEventListener('click', e => {
    if (e.target === leaderboardModal) closeLeaderboardFn();
});

closeModalBtn.addEventListener('click', closeModalFn);
taskModal.addEventListener('click', e => {
    if (e.target === taskModal) closeModalFn();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && taskModal.classList.contains('open')) closeModalFn();
});

// Toast close
toastClose.addEventListener('click', () => {
    toast.classList.remove('show');
    clearTimeout(toastTimer);
});

// Scroll top
const scrollBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('visible', window.scrollY > 300);
});
scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Notification bell
notificationBell.addEventListener('click', function(e) {
    e.stopPropagation();
    notificationList.classList.toggle('show');
    if (notificationList.classList.contains('show')) {
        notifications.forEach(n => n.read = true);
        localStorage.setItem('scriptHubNotifs', JSON.stringify(notifications));
        updateNotificationUI();
    }
});
document.addEventListener('click', () => notificationList.classList.remove('show'));

// Auth tabs
document.querySelectorAll('.auth-tabs button').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.auth-tabs button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(this.dataset.tab === 'login' ? 'loginForm' : 'registerForm').classList.add('active');
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('registerError').style.display = 'none';
        document.getElementById('registerSuccess').style.display = 'none';
    });
});

// Password strength
document.getElementById('registerPassword')?.addEventListener('input', function() {
    const val = this.value;
    const fill = document.getElementById('passwordStrengthFill');
    let s = 0;
    if (val.length >= 6) s += 25;
    if (val.length >= 10) s += 25;
    if (/[A-Z]/.test(val)) s += 25;
    if (/[0-9]/.test(val)) s += 25;
    fill.style.width = s + '%';
    fill.style.background = s < 50 ? '#ff6b6b' : s < 75 ? '#fbbf24' : '#4ade80';
});

// ==========================================
// ADD SCRIPT FORM
// ==========================================
addForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('scriptName').value.trim();
    const category = document.getElementById('scriptCategory').value;
    const desc = document.getElementById('scriptDesc').value.trim();
    const featuresRaw = document.getElementById('scriptFeatures').value.trim();
    const code = document.getElementById('scriptCodeInput').value.trim();
    const image = document.getElementById('scriptImage').value.trim();
    if (!name || !desc || !code) {
        showToast('❌ Tüm zorunlu alanları doldurun!');
        return;
    }
    const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(f => f) : [];
    const data = {
        name, category, desc, features, code,
        image: image || null,
        userName: currentUser?.displayName || 'Anonim',
        userId: currentUser?.uid,
        isCommunity: true,
        isPremium: false,
        status: 'active',
        version: 'v1.0.0',
        downloads: 0,
        commentCount: 0
    };
    if (await addScriptToFirebase(data)) {
        closeModal('addModal');
        addForm.reset();
        document.getElementById('imagePreview').innerHTML = '🖼️ Resim önizlemesi burada';
        await loadCommunityScripts();
        render();
        showToast('✅ Script HERKESE açık olarak eklendi!');
        if (currentUser) {
            const userScripts = communityScripts.filter(s => s.userId === currentUser.uid);
            if (userScripts.length === 1) addNotification('🏆 Başarım kazandın: İlk Script!', 'achievement');
            if (userScripts.length >= 5) addNotification('🏆 Başarım kazandın: Script Ustası!', 'achievement');
            if (userScripts.length >= 10) addNotification('🏆 Başarım kazandın: Script Efsanesi!', 'achievement');
            if (userScripts.length >= 20) addNotification('🏆 Başarım kazandın: Topluluk Kahramanı!', 'achievement');
        }
    }
});

// ==========================================
// ADD GAME FORM
// ==========================================
addGameForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('gameName').value.trim();
    const link = document.getElementById('gameLink').value.trim();
    const image = document.getElementById('gameImage').value.trim();
    const desc = document.getElementById('gameDesc').value.trim();
    if (!name || !link || !image) {
        showToast('❌ Tüm zorunlu alanları doldurun!');
        return;
    }
    const data = {
        name, link, image,
        desc: desc || `${name} - Roblox oyunu`,
        userName: currentUser?.displayName || 'Anonim',
        userId: currentUser?.uid
    };
    if (await addGameToFirebase(data)) {
        closeModal('addGameModal');
        addGameForm.reset();
        document.getElementById('gameImagePreview').innerHTML = '🖼️ Resim önizlemesi burada';
        await loadCommunityGames();
        render();
        showToast('🎮 Oyun HERKESE açık olarak eklendi!');
    }
});

// ==========================================
// TASK HANDLERS
// ==========================================
document.querySelectorAll('.task-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const task = this.dataset.task;
        if (modalState.taskStatus[task]) {
            showToast('⚠️ Zaten tamamlandı.');
            return;
        }
        if (modalState.timers[task]) return;
        let seconds = 25;
        this.disabled = true;
        const badge = document.createElement('span');
        badge.className = 'timer-badge';
        badge.textContent = `${seconds}s`;
        this.appendChild(badge);
        const interval = setInterval(() => {
            seconds--;
            if (seconds <= 0) {
                clearInterval(interval);
                modalState.timers[task] = null;
                this.disabled = false;
                this.classList.add('completed');
                modalState.taskStatus[task] = true;
                modalState.completed++;
                document.getElementById('taskStatus').textContent = `${modalState.completed}/3`;
                document.getElementById('progressFill').style.width = `${(modalState.completed / 3) * 100}%`;
                if (modalState.completed === 3) {
                    document.getElementById('revealCodeBtn').classList.add('active');
                    document.getElementById('revealCodeBtn').textContent = '🔓 Kodu Göster';
                    showToast('✅ Tüm görevler tamamlandı!');
                }
                const b = this.querySelector('.timer-badge');
                if (b) b.remove();
            } else {
                const b = this.querySelector('.timer-badge');
                if (b) b.textContent = `${seconds}s`;
            }
        }, 1000);
        modalState.timers[task] = interval;
    });
});

document.getElementById('revealCodeBtn')?.addEventListener('click', function() {
    if (!this.classList.contains('active')) {
        showToast('❌ Önce tüm görevleri tamamla!');
        return;
    }
    document.getElementById('codeContainer').classList.add('show');
    document.getElementById('scriptCode').textContent = modalState.code;
    this.textContent = '✅ Kod hazır!';
});

document.getElementById('copyCodeBtn')?.addEventListener('click', function() {
    const code = document.getElementById('scriptCode').textContent;
    navigator.clipboard.writeText(code).then(() => showToast('📋 Kopyalandı!'))
        .catch(() => {
            const t = document.createElement('textarea');
            t.value = code;
            document.body.appendChild(t);
            t.select();
            document.execCommand('copy');
            t.remove();
            showToast('📋 Kopyalandı!');
        });
});

// ==========================================
// SCRIPT IMAGE PREVIEW
// ==========================================
document.getElementById('scriptImage')?.addEventListener('input', function() {
    const preview = document.getElementById('imagePreview');
    const url = this.value.trim();
    if (url) {
        preview.innerHTML = `<img src="${url}" alt="Resim Önizleme" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='❌ Geçersiz resim URL\\'si'">`;
    } else {
        preview.innerHTML = '🖼️ Resim önizlemesi burada';
    }
});

document.getElementById('gameImage')?.addEventListener('input', function() {
    const preview = document.getElementById('gameImagePreview');
    const url = this.value.trim();
    if (url) {
        preview.innerHTML = `<img src="${url}" alt="Resim Önizleme" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='❌ Geçersiz resim URL\\'si'">`;
    } else {
        preview.innerHTML = '🖼️ Resim önizlemesi burada';
    }
});

// ==========================================
// SERVICE WORKER
// ==========================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('SW Kayıtlı'))
        .catch(e => console.log('SW Hatası', e));
}

// ==========================================
// COOKIE CONSENT
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('cookieConsent')) {
        document.getElementById('cookieConsent').style.display = 'block';
    }
});
window.acceptCookies = acceptCookies;

// ==========================================
// INIT
// ==========================================
async function init() {
    sanitizeFavorites();
    const savedNotifs = localStorage.getItem('scriptHubNotifs');
    if (savedNotifs) notifications = JSON.parse(savedNotifs);
    updateNotificationUI();
    
    // Temayı yükle
    const savedTheme = localStorage.getItem('scriptHubTheme') || 'dark';
    setTheme(savedTheme);
    
    // Dili yükle
    const savedLang = localStorage.getItem('scriptHubLang') || 'tr';
    setLanguage(savedLang);
    
    await Promise.all([loadCommunityScripts(), loadCommunityGames()]);
    render();
    
    if (!localStorage.getItem('scriptHubWelcomed')) {
        addNotification('👋 ScriptHub\'a hoş geldin! 120+ script ve oyun seni bekliyor.', 'welcome');
        localStorage.setItem('scriptHubWelcomed', 'true');
    }
}

init();

console.log('🚀 ScriptHub başarıyla başlatıldı!');
console.log(`📊 ${premiumScripts.length} premium script yüklendi!`);
