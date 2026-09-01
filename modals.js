// ==========================================
// MODAL İŞLEMLERİ
// ==========================================

let modalState = {
    code: '',
    taskStatus: { discord: false, youtube: false, tiktok: false },
    timers: { discord: null, youtube: null, tiktok: null },
    completed: 0,
    scrollY: 0
};

// Modal aç/kapa
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Profil Modalları
function openProfileModal() {
    openModal('profileModal');
    renderProfile();
}

function closeProfileModalFn() {
    closeModal('profileModal');
}

function openProfileEditModal() {
    if (!currentUser) {
        showToast('❌ Lütfen giriş yapın!');
        return;
    }
    openModal('profileEditModal');
    renderProfileEdit();
}

function closeProfileEditModalFn() {
    closeModal('profileEditModal');
}

// Auth Modal
function openAuthModal() {
    openModal('authModal');
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('registerError').style.display = 'none';
    document.getElementById('registerSuccess').style.display = 'none';
    selectedAvatar = AVATAR_1;
    uploadedAvatarUrl = null;
    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
    const first = document.querySelector('.avatar-option[data-avatar]');
    if (first) first.classList.add('selected');
    document.getElementById('avatarStatus').textContent = '✅ Varsayılan avatar seçili';
    document.getElementById('avatarStatus').style.color = 'var(--text-muted)';
    const uploadOption = document.getElementById('uploadAvatarOption');
    uploadOption.innerHTML = '<span class="upload-icon">📤</span>';
    if (avatarFileInput) avatarFileInput.value = '';
}

function closeAuthModalFn() {
    closeModal('authModal');
}

// Task Modal
function closeModalFn() {
    closeModal('taskModal');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    if (modalState.scrollY > 0) window.scrollTo(0, modalState.scrollY);
    Object.values(modalState.timers).forEach(t => {
        if (t) clearInterval(t);
    });
}

// Admin Modal
function openAdminModal() {
    if (!currentUser) {
        showToast('❌ Lütfen giriş yapın!');
        openAuthModal();
        return;
    }
    if (!isAdmin(currentUser)) {
        showToast('❌ Bu sayfaya erişim yetkin yok!');
        return;
    }
    openModal('adminModal');
    renderAdminPanel();
}

function closeAdminModalFn() {
    closeModal('adminModal');
}

// Leaderboard Modal
function openLeaderboard() {
    openModal('leaderboardModal');
    renderLeaderboard();
}

function closeLeaderboardFn() {
    closeModal('leaderboardModal');
}

console.log('📦 Modals yüklendi!');
