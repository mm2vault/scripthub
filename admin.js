// ==========================================
// ADMIN PANELİ
// ==========================================

let adminTabs = ['scripts', 'users', 'reports', 'stats'];
let currentAdminTab = 'scripts';
let adminSearchTerm = '';
let adminFilterType = 'all';

// Admin sekmesi değiştir
function switchAdminTab(tab) {
    currentAdminTab = tab;
    renderAdminPanel();
}

// Admin panelini render et
async function renderAdminPanel() {
    const container = document.getElementById('adminContent');
    const stats = await getAdminStats();
    
    let html = `
        <div class="admin-tabs">
            ${adminTabs.map(tab => `
                <button class="${currentAdminTab === tab ? 'active' : ''}" onclick="switchAdminTab('${tab}')">
                    ${tab === 'scripts' ? '📜' : tab === 'users' ? '👤' : tab === 'reports' ? '🚨' : '📊'} 
                    ${tab === 'scripts' ? 'Scriptler' : tab === 'users' ? 'Kullanıcılar' : tab === 'reports' ? 'Raporlar' : 'İstatistikler'}
                </button>
            `).join('')}
        </div>
        <div class="admin-stats">
            <div class="admin-stat-card"><div class="number">${stats.totalScripts}</div><span class="label">📜 Toplam Script</span></div>
            <div class="admin-stat-card"><div class="number">${stats.pendingScripts}</div><span class="label">⏳ Bekleyen Script</span></div>
            <div class="admin-stat-card"><div class="number">${stats.totalUsers}</div><span class="label">👤 Toplam Kullanıcı</span></div>
            <div class="admin-stat-card"><div class="number">${stats.totalReports}</div><span class="label">🚨 Toplam Rapor</span></div>
            <div class="admin-stat-card"><div class="number">${stats.totalGames}</div><span class="label">🎮 Toplam Oyun</span></div>
            <div class="admin-stat-card"><div class="number">${stats.totalComments}</div><span class="label">💬 Toplam Yorum</span></div>
        </div>
    `;
    
    if (currentAdminTab === 'scripts') {
        html += await renderAdminScripts();
    } else if (currentAdminTab === 'users') {
        html += await renderAdminUsers();
    } else if (currentAdminTab === 'reports') {
        html += await renderAdminReports();
    } else if (currentAdminTab === 'stats') {
        html += await renderAdminDetailedStats(stats);
    }
    
    container.innerHTML = html;
}

// Admin istatistikleri
async function getAdminStats() {
    try {
        const scriptsSnap = await db.collection('scripts').get();
        const allScripts = [];
        scriptsSnap.forEach(d => allScripts.push({ id: d.id, ...d.data() }));
        const pendingScripts = allScripts.filter(s => s.approved === undefined);
        
        let totalUsers = 0;
        try {
            const usersSnap = await db.collection('users').get();
            totalUsers = usersSnap.size;
        } catch(e) {}
        
        let totalReports = 0;
        try {
            const reportsSnap = await db.collection('reports').get();
            totalReports = reportsSnap.size;
        } catch(e) {}
        
        let totalGames = 0;
        try {
            const gamesSnap = await db.collection('games').get();
            totalGames = gamesSnap.size;
        } catch(e) {}
        
        let totalComments = 0;
        for (const script of allScripts) {
            try {
                const commentSnap = await db.collection('scripts').doc(script.id).collection('comments').get();
                totalComments += commentSnap.size;
            } catch(e) {}
        }
        
        return { 
            totalScripts: allScripts.length + premiumScripts.length, 
            pendingScripts: pendingScripts.length, 
            totalUsers, 
            totalReports, 
            totalGames, 
            totalComments 
        };
    } catch(e) {
        console.error('İstatistik hatası:', e);
        return { totalScripts: 0, pendingScripts: 0, totalUsers: 0, totalReports: 0, totalGames: 0, totalComments: 0 };
    }
}

// Admin script listesi
async function renderAdminScripts() {
    try {
        const snap = await db.collection('scripts').orderBy('createdAt', 'desc').get();
        const scripts = [];
        snap.forEach(d => scripts.push({ id: d.id, ...d.data() }));
        
        let allScripts = [...scripts, ...premiumScripts];
        
        if (adminSearchTerm.trim()) {
            const search = adminSearchTerm.toLowerCase().trim();
            allScripts = allScripts.filter(s => 
                (s.name && s.name.toLowerCase().includes(search)) ||
                (s.desc && s.desc.toLowerCase().includes(search)) ||
                (s.category && s.category.toLowerCase().includes(search)) ||
                (s.id && s.id.toLowerCase().includes(search)) ||
                (s.userName && s.userName.toLowerCase().includes(search))
            );
        }
        
        if (adminFilterType !== 'all') {
            if (adminFilterType === 'premium') {
                allScripts = allScripts.filter(s => s.isPremium === true);
            } else if (adminFilterType === 'community') {
                allScripts = allScripts.filter(s => s.isCommunity === true);
            } else if (adminFilterType === 'pending') {
                allScripts = allScripts.filter(s => s.approved === undefined && s.isCommunity === true);
            }
        }
        
        return `
            <div class="admin-search-bar">
                <input type="text" id="adminSearchInput" placeholder="🔍 Script ara..." value="${escapeHtml(adminSearchTerm)}">
                <select id="adminFilterTypeSelect">
                    <option value="all" ${adminFilterType === 'all' ? 'selected' : ''}>📂 Tümü</option>
                    <option value="premium" ${adminFilterType === 'premium' ? 'selected' : ''}>⭐ Premium</option>
                    <option value="community" ${adminFilterType === 'community' ? 'selected' : ''}>🌍 Topluluk</option>
                    <option value="pending" ${adminFilterType === 'pending' ? 'selected' : ''}>⏳ Bekleyen</option>
                </select>
                <button class="search-btn" onclick="adminSearchScripts()">🔍 Ara</button>
                <button class="search-btn" onclick="adminResetSearch()" style="background:rgba(255,255,255,0.1)">🔄 Sıfırla</button>
                <span style="color:var(--text-muted);font-size:0.7rem;margin-left:auto">📊 ${allScripts.length} script</span>
            </div>
            <div class="admin-list">
                ${allScripts.slice(0, 50).map(s => {
                    const isPremium = s.isPremium || false;
                    const scriptType = isPremium ? '⭐ Premium' : '🌍 Topluluk';
                    const scriptStatus = s.approved === undefined ? '⏳ Beklemede' : s.approved ? '✅ Onaylı' : '❌ Reddedildi';
                    return `
                        <div class="admin-list-item">
                            <div class="info">
                                <div class="title">
                                    ${escapeHtml(s.name || 'İsimsiz Script')}
                                    <span style="font-size:0.6rem;background:${isPremium ? 'rgba(251,191,36,0.15)' : 'rgba(167,139,250,0.15)'};padding:0.05rem 0.5rem;border-radius:12px;margin-left:0.5rem;color:${isPremium ? '#fbbf24' : 'var(--accent-light)'}">
                                        ${scriptType}
                                    </span>
                                </div>
                                <div class="sub">
                                    ${escapeHtml(s.userName || 'Anonim')} · ${s.category ? s.category.toUpperCase() : 'Kategori yok'}
                                    ${s.createdAt ? ` · ${new Date(s.createdAt.seconds * 1000).toLocaleDateString('tr-TR')}` : ''}
                                </div>
                                <div style="margin-top:0.2rem;display:flex;gap:0.3rem;flex-wrap:wrap">
                                    <span class="${s.approved === undefined ? 'badge-pending' : s.approved ? 'badge-approved' : 'badge-rejected'}">${scriptStatus}</span>
                                </div>
                            </div>
                            <div class="actions">
                                ${!isPremium && s.approved === undefined ? `
                                    <button class="approve-btn" onclick="adminApproveScript('${s.id}')">✅ Onayla</button>
                                    <button class="reject-btn" onclick="adminRejectScript('${s.id}')">❌ Reddet</button>
                                ` : !isPremium && s.approved ? `
                                    <button class="reject-btn" onclick="adminRejectScript('${s.id}')">⛔ Onayı Kaldır</button>
                                ` : !isPremium && s.approved === false ? `
                                    <button class="approve-btn" onclick="adminApproveScript('${s.id}')">✅ Yeniden Onayla</button>
                                ` : ''}
                                <button class="edit-btn" onclick="adminEditScript('${s.id}')">✏️ Düzenle</button>
                                <button class="delete-btn-admin" onclick="adminDeleteAnyScript('${s.id}')">🗑️ SİL</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch(e) {
        console.error('Script listesi hatası:', e);
        return `<div class="empty-state"><p>❌ Scriptler yüklenirken hata oluştu</p></div>`;
    }
}

// Diğer admin fonksiyonları (kullanıcılar, raporlar, vs.)
// ... devam eder

console.log('🔧 Admin paneli yüklendi!');
