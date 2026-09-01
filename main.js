// ==========================================
// ANA KOD - TÜM İŞLEMLER
// ==========================================

// STATE
let communityScripts = [];
let communityGames = [];
let favorites = JSON.parse(localStorage.getItem('scriptHubFavs')) || [];
let currentCategory = 'all';
let searchTerm = '';
let sortMode = 'default';
let currentUser = null;
let currentPage = 1;
let filterType = 'all';
let filterRating = 0;
const ITEMS_PER_PAGE = 20;

// DOM ELEMANLARI
const grid = document.getElementById('scriptGrid');
const searchInput = document.getElementById('searchInput');
const catBtns = document.querySelectorAll('.cat-btn');
const totalCount = document.getElementById('totalCount');
const favCount = document.getElementById('favCount');
const communityCount = document.getElementById('communityCount');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ===== YARDIMCI FONKSİYONLAR =====
function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function getAllScripts() {
    return [...premiumScripts, ...communityScripts];
}

// ===== TÜM SCRIPTLERİ YÜKLE =====
async function loadCommunityScripts() {
    try {
        const snap = await db.collection('scripts').orderBy('createdAt', 'desc').limit(500).get();
        communityScripts = [];
        snap.forEach(d => {
            const data = d.data();
            communityScripts.push({
                id: d.id,
                ...data,
                isCommunity: true,
                isPremium: false
            });
        });
        return communityScripts;
    } catch (e) {
        console.error('Script yükleme hatası:', e);
        return [];
    }
}

// ===== RENDER =====
function render() {
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
        
        return catMatch && typeMatch && searchMatch;
    });
    
    // Sıralama
    if (sortMode === 'az') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortMode === 'za') filtered.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortMode === 'popular') filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    else if (sortMode === 'newest') filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    else filtered.sort((a, b) => {
        if (a.isPremium && !b.isPremium) return -1;
        if (!a.isPremium && b.isPremium) return 1;
        return 0;
    });
    
    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = Math.max(1, totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
    
    // Stats
    totalCount.textContent = filtered.length;
    favCount.textContent = favorites.length;
    communityCount.textContent = communityScripts.length;
    
    // Render
    if (!paginated.length) {
        grid.innerHTML = `
            <div class="empty">
                <div style="font-size:2.5rem">🔍</div>
                <h3>Sonuç bulunamadı</h3>
                <p style="color:var(--text-muted)">Farklı bir kategori veya arama terimi dene.</p>
                <button onclick="render()" style="margin-top:1rem;padding:0.5rem 2rem;background:var(--accent-gradient);border:none;border-radius:60px;color:white;cursor:pointer">🔄 Yenile</button>
            </div>
        `;
        paginationControls.innerHTML = '';
        return;
    }
    
    grid.innerHTML = paginated.map(s => {
        const isFav = favorites.includes(s.id);
        const isPremium = s.isPremium || false;
        const isCommunity = s.isCommunity || false;
        const imageUrl = s.image || 'https://i.postimg.cc/rFhbs0Xg/images.jpg';
        
        return `
            <div class="script-card">
                <div class="card-image">
                    <img src="${imageUrl}" alt="${escapeHtml(s.name)}" onerror="this.src='https://i.postimg.cc/rFhbs0Xg/images.jpg'">
                </div>
                <div class="card-body">
                    <div class="card-header">
                        <h3>${escapeHtml(s.name)} ${isPremium ? '⭐' : ''}</h3>
                        <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${s.id}">♥</button>
                    </div>
                    <div class="card-desc">${escapeHtml(s.desc)}</div>
                    <div class="card-features">
                        ${s.features ? s.features.map(f => `<span class="tag">${escapeHtml(f)}</span>`).join('') : ''}
                    </div>
                    <div class="card-footer">
                        <span class="badge ${isCommunity ? 'community' : ''}">
                            ${isCommunity ? '🌍 Topluluk' : '⭐ Premium'}
                        </span>
                        <button class="get-btn" data-id="${s.id}">🔓 GET</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Pagination
    paginationControls.innerHTML = '';
    if (totalPages > 1) {
        let html = `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="changePage('prev')">‹</button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += `<button disabled>…</button>`;
            }
        }
        html += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick="changePage('next')">›</button>`;
        paginationControls.innerHTML = html;
    }
    
    // Event listeners
    document.querySelectorAll('.fav-btn').forEach(b => b.addEventListener('click', favHandler));
    document.querySelectorAll('.get-btn').forEach(b => b.addEventListener('click', getHandler));
}

// ===== SAYFA DEĞİŞTİR =====
function changePage(page) {
    const all = getAllScripts();
    const totalPages = Math.ceil(all.length / ITEMS_PER_PAGE);
    if (page === 'prev' && currentPage > 1) currentPage--;
    else if (page === 'next' && currentPage < totalPages) currentPage++;
    else if (typeof page === 'number') currentPage = page;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== FAVORİ HANDLER =====
function favHandler(e) {
    const id = this.dataset.id;
    const idx = favorites.indexOf(id);
    if (idx > -1) favorites.splice(idx, 1);
    else favorites.push(id);
    localStorage.setItem('scriptHubFavs', JSON.stringify(favorites));
    render();
    showToast('❤️ Favori güncellendi');
}

// ===== GET HANDLER =====
function getHandler(e) {
    const id = this.dataset.id;
    const all = getAllScripts();
    const script = all.find(s => s.id === id);
    if (!script) return;
    
    if (script.isPremium) {
        // Premium script - görevleri göster
        document.getElementById('taskScriptName').textContent = script.name;
        document.getElementById('taskScriptCode').textContent = script.code;
        document.getElementById('taskModal').classList.add('open');
    } else {
        // Community script - direkt göster
        alert(`📜 ${script.name}\n\n${script.code}`);
    }
}

// ===== CATEGORY DEĞİŞTİR =====
catBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        catBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.cat;
        currentPage = 1;
        render();
    });
});

// ===== SEARCH =====
searchInput.addEventListener('input', function() {
    searchTerm = this.value;
    currentPage = 1;
    render();
});

// ===== SORT =====
document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        sortMode = this.dataset.sort;
        currentPage = 1;
        render();
    });
});

// ===== AUTH =====
document.getElementById('loginBtn').addEventListener('click', function() {
    document.getElementById('authModal').classList.add('open');
});

document.getElementById('closeAuthModal').addEventListener('click', function() {
    document.getElementById('authModal').classList.remove('open');
});

document.getElementById('loginSubmitBtn').addEventListener('click', async function() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) {
        document.getElementById('loginError').textContent = '❌ E-posta ve şifre girin!';
        document.getElementById('loginError').style.display = 'block';
        return;
    }
    try {
        await auth.signInWithEmailAndPassword(email, password);
        document.getElementById('authModal').classList.remove('open');
        showToast('✅ Hoş geldin!');
    } catch (error) {
        document.getElementById('loginError').textContent = '❌ ' + error.message;
        document.getElementById('loginError').style.display = 'block';
    }
});

// ===== ADD SCRIPT =====
document.getElementById('addScriptBtn').addEventListener('click', function() {
    if (!currentUser) {
        showToast('❌ Lütfen önce giriş yapın!');
        document.getElementById('authModal').classList.add('open');
        return;
    }
    document.getElementById('addModal').classList.add('open');
});

document.getElementById('closeAddModal').addEventListener('click', function() {
    document.getElementById('addModal').classList.remove('open');
});

document.getElementById('addScriptForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('scriptName').value.trim();
    const category = document.getElementById('scriptCategory').value;
    const desc = document.getElementById('scriptDesc').value.trim();
    const featuresRaw = document.getElementById('scriptFeatures').value.trim();
    const code = document.getElementById('scriptCodeInput').value.trim();
    
    if (!name || !desc || !code) {
        showToast('❌ Tüm zorunlu alanları doldurun!');
        return;
    }
    
    const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()) : [];
    
    try {
        await db.collection('scripts').add({
            name,
            category,
            desc,
            features,
            code,
            userId: currentUser.uid,
            userName: currentUser.displayName || 'Anonim',
            isCommunity: true,
            isPremium: false,
            status: 'active',
            version: 'v1.0.0',
            downloads: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('addModal').classList.remove('open');
        this.reset();
        showToast('✅ Script eklendi!');
        await loadCommunityScripts();
        render();
    } catch (error) {
        showToast('❌ Hata: ' + error.message);
    }
});

// ===== ADD GAME =====
document.getElementById('addGameBtn').addEventListener('click', function() {
    if (!currentUser) {
        showToast('❌ Lütfen önce giriş yapın!');
        document.getElementById('authModal').classList.add('open');
        return;
    }
    document.getElementById('addGameModal').classList.add('open');
});

document.getElementById('closeAddGameModal').addEventListener('click', function() {
    document.getElementById('addGameModal').classList.remove('open');
});

document.getElementById('addGameForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('gameName').value.trim();
    const link = document.getElementById('gameLink').value.trim();
    const image = document.getElementById('gameImage').value.trim();
    
    if (!name || !link || !image) {
        showToast('❌ Tüm alanları doldurun!');
        return;
    }
    
    try {
        await db.collection('games').add({
            name,
            link,
            image,
            userId: currentUser.uid,
            userName: currentUser.displayName || 'Anonim',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('addGameModal').classList.remove('open');
        this.reset();
        showToast('🎮 Oyun eklendi!');
    } catch (error) {
        showToast('❌ Hata: ' + error.message);
    }
});

// ===== TASK MODAL =====
document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('taskModal').classList.remove('open');
});

// ===== AUTH STATE =====
auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        document.getElementById('loginBtn').innerHTML = `👤 ${escapeHtml(user.displayName || user.email)}`;
        document.getElementById('loginBtn').style.borderColor = 'var(--accent)';
    } else {
        document.getElementById('loginBtn').innerHTML = '🔑 Giriş Yap';
        document.getElementById('loginBtn').style.borderColor = '';
    }
});

// ===== SCROLL TOP =====
const scrollBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('visible', window.scrollY > 300);
});
scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== INIT =====
async function init() {
    await loadCommunityScripts();
    render();
    console.log(`🔥 ScriptHub başlatıldı! ${premiumScripts.length} premium + ${communityScripts.length} topluluk scripti`);
}

init();
