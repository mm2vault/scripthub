// ==========================================
// YARDIMCI FONKSİYONLAR
// ==========================================

// Toast mesajı
let toastTimer = null;

function showToast(msg, duration = 4000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

// İçerik filtreleme
const badWords = ['küfür', 'spam', 'reklam', 'kötü', 'yasak', 'sex', 'porno', 'kumar'];

function filterContent(text) {
    let filtered = text;
    badWords.forEach(word => {
        filtered = filtered.replace(new RegExp(word, 'gi'), '***');
    });
    return filtered;
}

// Admin kontrolü
function isAdmin(user) {
    if (!user) return false;
    return user.uid === ADMIN_UID;
}

function requireAdmin() {
    if (!currentUser || !isAdmin(currentUser)) {
        showToast('❌ Admin yetkisi gerekli!');
        return false;
    }
    return true;
}

// Kategori görseli
function getImageForCategory(cat) {
    return IMG[cat] || IMG.other;
}

// Tüm scriptleri getir
function getAllScripts() {
    return [...premiumScripts, ...communityScripts];
}

// Favorileri temizle
function sanitizeFavorites() {
    favorites = JSON.parse(localStorage.getItem('scriptHubFavs')) || [];
    favorites = favorites.filter(id => typeof id === 'string' && id.length > 0);
    localStorage.setItem('scriptHubFavs', JSON.stringify(favorites));
}

// Oyun rozetini güncelle
function updateGameBadge() {
    const total = 7 + communityGames.length;
    const badge = document.getElementById('gameCountBadge');
    if (badge) badge.textContent = `${total} OYUN`;
}

// Çerez kabulü
function acceptCookies() {
    document.getElementById('cookieConsent').style.display = 'none';
    localStorage.setItem('cookieConsent', 'true');
}

console.log('🛠️ Utils yüklendi!');
