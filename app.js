(function(){
    'use strict';

    const firebaseConfig = {
        apiKey: "AIzaSyB8xU0CUXkzl1AbOBusUxr3J77TU5d6Mlg",
        authDomain: "scripthub-b7b7b.firebaseapp.com",
        projectId: "scripthub-b7b7b",
        storageBucket: "scripthub-b7b7b.firebasestorage.app",
        messagingSenderId: "962415554423",
        appId: "1:962415554423:web:9035ce9e4035d6ab6c3b72",
        measurementId: "G-ZNQK09DBRQ"
    };
    
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    const storage = firebase.storage();

    const ADMIN_UID = 'WAtZhXqj2KUEib0RaRXMTOAgYpc2';
    const ITEMS_PER_PAGE = 20;
    const DEFAULT_UNLOCK_PRICE = 30;

    const IMG = {
        login:'https://i.postimg.cc/xdgmwFsB/7ed5b6f5-a917-4d66-975c-4b78e8183462.jpg',
        logout:'https://i.postimg.cc/PJmpX3fH/Gemini-Generated-Image-bnwgx9bnwgx9bnwg.png',
        get:'https://i.postimg.cc/3N9mTfJW/0676206d-5160-4133-8935-100c53330d11.jpg',
        premium:'https://i.postimg.cc/ydHZSCDR/c81e5600-2e02-4e6f-b565-f78c98b8aac6.jpg',
        community:'https://i.postimg.cc/cLz7Cz7g/d59075c0-b97d-405e-9c4e-a4a6f4b5a333.jpg',
        delete:'https://i.postimg.cc/ydjkgg4g/b032e832-7b9b-4b65-8b5f-8da77392bed9.jpg',
        users:'https://i.postimg.cc/rm58SGCq/1786707704031.png',
        mm2:'https://i.postimg.cc/rFhbs0Xg/images.jpg',
        bloxfruits:'https://i.postimg.cc/jScztNGG/no-Filter.jpg',
        petsim:'https://i.postimg.cc/28fvW2mz/PS99Icon.webp',
        dahood:'https://i.postimg.cc/s28GgJwX/no-Filter.webp',
        bladeball:'https://i.postimg.cc/gkDwZpNw/no-Filter-(1).webp',
        brookhaven:'https://i.postimg.cc/yYdKLz7P/no-Filter-(2).webp',
        other:'https://i.postimg.cc/d12QcRfB/Gemini-Generated-Image-q6hh2jq6hh2jq6hh.png'
    };
    const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%231a1a3a"/%3E%3Ctext x="50" y="55" font-size="40" text-anchor="middle" fill="%23a78bfa"%3E⚡%3C/text%3E%3C/svg%3E';

    // ✅ DÜZELTME 1: Kategori ikonları (resim yoksa gösterilecek)
    const CATEGORY_ICONS = {
        mm2:'🗡️', bloxfruits:'🍉', petsim:'🐾', dahood:'🔫',
        bladeball:'⚡', brookhaven:'🏡', other:'🎮'
    };

    const DAILY_TASKS = [
        { id: 'daily_login', name: 'Günlük Giriş', desc: 'Bugün giriş yap', reward: 10, icon: '✅' },
        { id: 'daily_view', name: '3 Script Görüntüle', desc: '3 farklı script görüntüle', reward: 15, icon: '👁️' },
        { id: 'daily_comment', name: '2 Yorum Yap', desc: '2 scripte yorum yap', reward: 15, icon: '💬' },
        { id: 'daily_fav', name: '2 Favori Ekle', desc: '2 script favorilere ekle', reward: 10, icon: '❤️' },
        { id: 'daily_add_script', name: 'Script Ekle', desc: '1 yeni script ekle', reward: 25, icon: '📜' },
        { id: 'daily_add_game', name: 'Oyun Ekle', desc: '1 yeni oyun ekle', reward: 20, icon: '🎮' },
        { id: 'daily_rate', name: '3 Script Beğen', desc: '3 scripte puan ver', reward: 10, icon: '⭐' },
        { id: 'daily_categories', name: '3 Kategori Gez', desc: '3 farklı kategori ziyaret et', reward: 15, icon: '📂' }
    ];

    const SHOP_SCRIPTS = [
        { id: 'shop_p1', name: 'Zen X MM2', price: 200, scriptId: 'p1', desc: 'Otomatik kasa, aimbot ve bıçak toplama' },
        { id: 'shop_p2', name: 'MM2 Sniper Pro', price: 300, scriptId: 'p2', desc: 'Otomatik bıçak toplama, aim ve ESP' },
        { id: 'shop_p3', name: 'MM2 OP Script', price: 250, scriptId: 'p3', desc: 'Full panel ile ESP, Murderer ve Sheriff' },
        { id: 'shop_p4', name: 'MM2 Coin Auto Farm', price: 200, scriptId: 'p4', desc: 'Otomatik coin toplama ve anti AFK' },
        { id: 'shop_p5', name: 'Infinite Fun IY', price: 350, scriptId: 'p5', desc: '407+ komut ile gelişmiş admin scripti' }
    ];

    const COSMETIC_ITEMS = [
        { id: 'frame_gold', name: 'Altın Çerçeve', price: 150, type: 'frame', value: 'gold', icon: '🟡' },
        { id: 'frame_premium', name: 'Premium Çerçeve', price: 200, type: 'frame', value: 'premium', icon: '💎' },
        { id: 'name_purple', name: 'Mor İsim', price: 100, type: 'nameColor', value: '#a78bfa', icon: '🟣' },
        { id: 'name_gold', name: 'Altın İsim', price: 200, type: 'nameColor', value: '#fbbf24', icon: '🟡' }
    ];

    // ✅ DÜZELTME 2: Premium scriptler (Firebase'e yazılacak)
    const premiumScripts = [
        {id:"p1",name:"Zen X MM2",category:"mm2",desc:"Otomatik kasa, aimbot ve bıçak toplama.",features:["Aimbot","Auto Farm","ESP"],code:"loadstring(game:HttpGet('https://raw.githubusercontent.com/7GrandDad/7GrandDad/main/MM2.lua'))()",isPremium:true,isCommunity:false,coinPrice:200},
        {id:"p2",name:"MM2 Sniper Pro",category:"mm2",desc:"Otomatik bıçak toplama, aim ve ESP.",features:["Auto Collect","Aimbot","ESP"],code:"loadstring(game:HttpGet('https://raw.githubusercontent.com/MM2Sniper/script/main/sniper.lua'))()",isPremium:true,isCommunity:false,coinPrice:300},
        {id:"p3",name:"MM2 OP Script",category:"mm2",desc:"Full panel ile ESP, Murderer ve Sheriff araçları.",features:["God Mode","ESP","Auto Kill"],code:"loadstring(game:HttpGet('https://raw.githubusercontent.com/Roman34296589/SnapSanixHUB/refs/heads/main/SnapSanixHUB.lua'))()",isPremium:true,isCommunity:false,coinPrice:250},
        {id:"p4",name:"MM2 Coin Auto Farm",category:"mm2",desc:"Otomatik coin toplama ve anti AFK.",features:["Auto Farm","Anti AFK"],code:"loadstring(game:HttpGet('https://raw.githubusercontent.com/bugxiefun/roblox-scripts/refs/heads/main/MM2%20Coin%20Autofarm', true))()",isPremium:true,isCommunity:false,coinPrice:200},
        {id:"p5",name:"Infinite Fun IY",category:"mm2",desc:"407+ komut ile gelişmiş admin scripti.",features:["ESP","Fullbright","Goto"],code:"loadstring(game:HttpGet('https://raw.githubusercontent.com/Xane123/InfiniteFun_IY/master/source'))()",isPremium:true,isCommunity:false,coinPrice:350},
        {id:"p6",name:"MM2 Aim Trainer 2",category:"mm2",desc:"Özel hedef eğitim menüsü, key yok.",features:["Full Menu","No Key"],code:"loadstring(game:HttpGet('https://raw.githubusercontent.com/Ewerton99BRYT99/99Hub/refs/heads/main/MM2AimTrainer2.luau'))()",isPremium:true,isCommunity:false,coinPrice:180},
        {id:"p7",name:"MM2 Auto Farm OP",category:"mm2",desc:"Otomatik coin farm ve anti AFK.",features:["Auto Farm","Anti AFK"],code:"loadstring(game:HttpGet('https://raw.githubusercontent.com/MM2AutoFarm/script/main/farm.lua'))()",isPremium:true,isCommunity:false,coinPrice:220},
        {id:"p8",name:"MM2 Hub V2",category:"mm2",desc:"Gelişmiş MM2 menüsü.",features:["ESP","Aimbot"],code:"loadstring(game:HttpGet('https://raw.githubusercontent.com/MM2Hub/script/main/v2.lua'))()",isPremium:true,isCommunity:false,coinPrice:280},
        {id:"p9",name:"MM2 Coin Farmer",category:"mm2",desc:"Hızlı coin toplama.",features:["Auto Farm"],code:"loadstring(game:HttpGet('https://raw.githubusercontent.com/MM2Farmer/script/main/coin.lua'))()",isPremium:true,isCommunity:false,coinPrice:150},
        {id:"p10",name:"MM2 God Mode",category:"mm2",desc:"God mode, speed hack ve esp.",features:["God Mode","Speed Hack","ESP"],code:"loadstring(game:HttpGet('https://raw.githubusercontent.com/MM2God/script/main/god.lua'))()",isPremium:true,isCommunity:false,coinPrice:150}
    ];

    let currentUser = null;
    let userCoins = 0;
    let purchasedScripts = [];
    let inventory = [];
    let dailyProgress = {};
    let communityScripts = [];
    let communityGames = [];
    let favorites = [];
    let notifications = [];
    let currentCategory = 'all';
    let searchTerm = '';
    let currentPage = 1;
    let filterType = 'all';
    let ratings = {};
    let comments = {};
    let viewCounts = {};
    let selectedAvatar = 'https://i.postimg.cc/HnwDsKJg/24a54c075ae7a7e7ae16d69e2766cefe.jpg';
    let uploadedAvatarUrl = null;
    let currentShopTab = 'scripts';
    let pendingUnlockScript = null;

    const grid = document.getElementById('scriptGrid');
    const searchInput = document.getElementById('searchInput');
    const catBtns = document.querySelectorAll('.cat-btn');
    const totalCount = document.getElementById('totalCount');
    const favCount = document.getElementById('favCount');
    const communityCount = document.getElementById('communityCount');
    const gameCountBadge = document.getElementById('gameCountBadge');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastClose = document.getElementById('toastClose');
    const modal = document.getElementById('taskModal');
    const unlockChoiceModal = document.getElementById('unlockChoiceModal');
    const addModal = document.getElementById('addModal');
    const addGameModal = document.getElementById('addGameModal');
    const authModal = document.getElementById('authModal');
    const profileModal = document.getElementById('profileModal');
    const profileEditModal = document.getElementById('profileEditModal');
    const editScriptModal = document.getElementById('editScriptModal');
    const adminEditScriptModal = document.getElementById('adminEditScriptModal');
    const adminModal = document.getElementById('adminModal');
    const leaderboardModal = document.getElementById('leaderboardModal');
    const coinShopModal = document.getElementById('coinShopModal');
    const paginationControls = document.getElementById('paginationControls');
    const filterSort = document.getElementById('filterSort');
    const filterTypeEl = document.getElementById('filterType');
    const notificationBell = document.getElementById('notificationBell');
    const notificationList = document.getElementById('notificationList');
    const notifDot = document.getElementById('notifDot');
    const dailyTasksList = document.getElementById('dailyTasksList');
    const adminBtn = document.getElementById('adminBtn');
    const coinDisplay = document.getElementById('coinDisplay');
    const authSection = document.getElementById('authSection');

    function escapeHtml(str){ if(!str)return ''; const d=document.createElement('div'); d.textContent=str; return d.innerHTML; }

    function showToast(msg, duration=4000){
        toastMessage.textContent=msg; toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer=setTimeout(()=>toast.classList.remove('show'), duration);
    }
    toastClose.addEventListener('click', ()=>{toast.classList.remove('show'); clearTimeout(toast._timer);});

    function addNotification(msg, type='info'){
        const notif={id:Date.now(), msg, type, time:new Date().toLocaleString('tr-TR'), read:false};
        notifications.unshift(notif);
        if(notifications.length>50) notifications.pop();
        localStorage.setItem('scriptHubNotifs', JSON.stringify(notifications));
        updateNotificationUI();
    }

    function updateNotificationUI(){
        const unread=notifications.filter(n=>!n.read).length;
        if(notifDot) notifDot.classList.toggle('show', unread>0);
        if(notificationList) {
            notificationList.innerHTML=notifications.length===0?'<div class="notif-item" style="color:var(--text-muted)">Bildirim yok</div>':
                notifications.slice(0,15).map(n=>`<div class="notif-item" style="${n.read?'opacity:0.6':''}">${n.msg}<span class="notif-time">${n.time}</span></div>`).join('');
        }
    }

    function getImageForCategory(cat){ return IMG[cat]||IMG.other; }
    function getAllScripts() { return [...premiumScripts, ...communityScripts]; }
    function isAdmin(user) { return user && user.uid === ADMIN_UID; }

    function updateCoinDisplay() {
        if (coinDisplay) {
            coinDisplay.textContent = userCoins;
            coinDisplay.style.transform = 'scale(1.3)';
            setTimeout(() => coinDisplay.style.transform = 'scale(1)', 300);
        }
        const shopBalance = document.getElementById('shopCoinBalance');
        if (shopBalance) shopBalance.textContent = userCoins;
    }

    async function loadUserData(user) {
        if (!user) return;
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                const data = doc.data();
                if(data.banned && !isAdmin(user)){
                    showToast('🚫 Bu hesap yönetici tarafından engellendi.');
                    await auth.signOut();
                    return;
                }
                userCoins = data.coins || 0;
                purchasedScripts = data.purchasedScripts || [];
                inventory = data.inventory || [];
                dailyProgress = data.dailyTasks || {};
            } else {
                userCoins = 50;
                purchasedScripts = [];
                inventory = [];
                dailyProgress = {};
                await db.collection('users').doc(user.uid).set({
                    coins: 50, totalCoinsEarned: 50, purchasedScripts: [], inventory: [], dailyTasks: {},
                    displayName: user.displayName || 'Kullanıcı',
                    email: user.email || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            updateCoinDisplay();
        } catch(e) {
            console.error('Kullanıcı verileri hatası:', e);
            userCoins = 50;
            updateCoinDisplay();
        }
    }

    async function addCoins(amount, reason) {
        if (!currentUser) return false;
        amount = Math.floor(Number(amount));
        if (!Number.isFinite(amount) || amount <= 0) return false;
        try {
            const ref = db.collection('users').doc(currentUser.uid);
            await ref.update({
                coins: firebase.firestore.FieldValue.increment(amount),
                totalCoinsEarned: firebase.firestore.FieldValue.increment(amount)
            });
            userCoins += amount;
            updateCoinDisplay();
            await ref.collection('coinLedger').add({
                type:'earn', amount, reason:String(reason||''),
                createdAt:firebase.firestore.FieldValue.serverTimestamp()
            }).catch(()=>{});
            showToast(`🪙 +${amount} coin kazandın! (${reason})`);
            addNotification(`🪙 +${amount} coin kazandın! (${reason})`, 'coin');
            return true;
        } catch(e) {
            console.error('Coin ekleme hatası:',e);
            showToast('❌ Coin eklenemedi, tekrar dene.');
            return false;
        }
    }

    async function spendCoins(amount, item) {
        if (!currentUser) { showToast('❌ Lütfen giriş yapın!'); return false; }
        amount = Math.floor(Number(amount));
        if (!Number.isFinite(amount) || amount <= 0) return false;
        const ref = db.collection('users').doc(currentUser.uid);
        try {
            let newBalance = 0;
            await db.runTransaction(async tx => {
                const snap = await tx.get(ref);
                const balance = Number(snap.data()?.coins || 0);
                if (balance < amount) throw new Error('INSUFFICIENT_COINS');
                newBalance = balance - amount;
                tx.update(ref,{coins:newBalance});
            });
            userCoins = newBalance;
            updateCoinDisplay();
            await ref.collection('coinLedger').add({
                type:'spend', amount, item:String(item||''),
                createdAt:firebase.firestore.FieldValue.serverTimestamp()
            }).catch(()=>{});
            showToast(`🪙 -${amount} coin harcadın: ${item}`);
            addNotification(`🪙 -${amount} coin harcadın: ${item}`, 'coin');
            return true;
        } catch(e) {
            if(e.message==='INSUFFICIENT_COINS'){
                showToast(`❌ Yeterli coinin yok! (${userCoins}/${amount})`);
            } else {
                console.error('Coin harcama hatası:',e);
                showToast('❌ Coin harcanamadı, tekrar dene.');
            }
            return false;
        }
    }

    function getDailyProgress() {
        if (!currentUser) return { date: new Date().toDateString(), tasks: {} };
        const today = new Date().toDateString();
        const progress = dailyProgress || {};
        if (progress.date !== today) return { date: today, tasks: {} };
        return progress;
    }

    function saveDailyProgress(progress) {
        if (!currentUser) return;
        dailyProgress = progress;
        localStorage.setItem(`daily_${currentUser.uid}`, JSON.stringify(progress));
        db.collection('users').doc(currentUser.uid).update({ dailyTasks: progress }).catch(e => console.error(e));
    }

    async function completeDailyTask(taskId) {
        if (!currentUser) return false;
        const progress = getDailyProgress();
        if (progress.tasks[taskId]) return false;
        progress.tasks[taskId] = true;
        progress.date = new Date().toDateString();
        saveDailyProgress(progress);
        const task = DAILY_TASKS.find(t => t.id === taskId);
        if (task) {
            showToast(`🎯 ${task.name} tamamlandı! Ödülünü "Tümünü Topla" ile alabilirsin.`);
        }
        renderDailyTasks();
        return true;
    }

    async function claimAllRewards() {
        if (!currentUser) { showToast('❌ Lütfen giriş yapın!'); return; }
        const progress = getDailyProgress();
        const completed = DAILY_TASKS.filter(t => progress.tasks[t.id]);
        if (completed.length === 0) { showToast('❌ Henüz tamamlanmış görev yok!'); return; }
        if (progress.claimed) { showToast('✅ Bugünkü ödüller zaten toplandı!'); return; }
        const totalReward = completed.reduce((sum, t) => sum + t.reward, 0);
        await addCoins(totalReward, 'Tüm günlük görevler');
        progress.claimed = true;
        saveDailyProgress(progress);
        renderDailyTasks();
        showToast(`📦 Tüm ödüller toplandı! 🪙 +${totalReward} coin`);
    }

    function renderDailyTasks() {
        if (!currentUser) {
            document.getElementById('dailyTasksContainer').style.display = 'none';
            return;
        }
        document.getElementById('dailyTasksContainer').style.display = 'block';
        const progress = getDailyProgress();
        const completedCount = DAILY_TASKS.filter(t => progress.tasks[t.id]).length;
        const totalReward = DAILY_TASKS.filter(t => progress.tasks[t.id]).reduce((sum, t) => sum + t.reward, 0);
        document.getElementById('dailyTotalReward').textContent = `🪙 +${totalReward} coin`;
        document.getElementById('dailyProgressText').textContent = `(${completedCount}/${DAILY_TASKS.length})`;
        const claimBtn = document.getElementById('claimAllBtn');
        claimBtn.disabled = completedCount === 0 || progress.claimed;
        claimBtn.textContent = progress.claimed ? '✅ Ödüller Toplandı!' : '📦 Tümünü Topla';
        dailyTasksList.innerHTML = DAILY_TASKS.map(task => {
            const done = progress.tasks[task.id] || false;
            return `
                <div class="daily-task ${done ? 'completed' : ''}">
                    <span class="task-icon">${task.icon}</span>
                    <div class="task-info">
                        <div class="task-name">${task.name}</div>
                        <div class="task-desc">${task.desc}</div>
                        <div class="task-reward">🪙 +${task.reward} coin</div>
                    </div>
                    <span class="task-status">${done ? '✅' : '⬜'}</span>
                </div>
            `;
        }).join('');
    }

    function openCoinShop() {
        if (!currentUser) { showToast('❌ Lütfen giriş yapın!'); openAuthModal(); return; }
        coinShopModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        renderShop('scripts');
    }

    function closeCoinShopFn() {
        coinShopModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    function switchShopTab(tab) {
        currentShopTab = tab;
        document.querySelectorAll('.shop-tabs button').forEach(b => {
            b.classList.toggle('active', b.dataset.shopTab === tab);
        });
        renderShop(tab);
    }

    function renderShop(tab) {
        const container = document.getElementById('shopContent');
        document.getElementById('shopCoinBalance').textContent = userCoins;
        if (tab === 'scripts') {
            const shopItems = SHOP_SCRIPTS.map(item => {
                const owned = purchasedScripts.includes(item.scriptId);
                return `
                    <div class="shop-item">
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-desc">${item.desc}</div>
                        </div>
                        <span class="item-price">🪙 ${item.price}</span>
                        <button class="buy-btn ${owned ? 'owned' : ''}" onclick="purchaseScript('${item.scriptId}', ${item.price})" ${owned ? 'disabled' : ''}>
                            ${owned ? '✅ Sahipsin' : '🛒 Satın Al'}
                        </button>
                    </div>
                `;
            }).join('');
            container.innerHTML = `<div style="color:var(--text-secondary);font-size:0.8rem;margin-bottom:0.5rem">📜 Premium scriptleri coin ile satın al!</div>${shopItems}`;
        } else if (tab === 'cosmetics') {
            const cosmeticItems = COSMETIC_ITEMS.map(item => {
                const owned = inventory.some(i => i.id === item.id);
                return `
                    <div class="shop-item">
                        <div class="item-info">
                            <div class="item-name">${item.icon} ${item.name}</div>
                            <div class="item-desc">${item.type === 'frame' ? '🖼️ Çerçeve' : '🎨 İsim rengi'}</div>
                        </div>
                        <span class="item-price">🪙 ${item.price}</span>
                        <button class="buy-btn ${owned ? 'owned' : ''}" onclick="purchaseCosmetic('${item.id}', ${item.price})" ${owned ? 'disabled' : ''}>
                            ${owned ? '✅ Sahipsin' : '🛒 Satın Al'}
                        </button>
                    </div>
                `;
            }).join('');
            container.innerHTML = `<div style="color:var(--text-secondary);font-size:0.8rem;margin-bottom:0.5rem">✨ Profilini özelleştir!</div>${cosmeticItems}`;
        } else if (tab === 'owned') {
            const ownedScripts = SHOP_SCRIPTS.filter(item => purchasedScripts.includes(item.scriptId));
            const ownedCosmetics = COSMETIC_ITEMS.filter(item => inventory.some(i => i.id === item.id));
            let html = `<div style="color:var(--text-secondary);font-size:0.8rem;margin-bottom:0.5rem">📦 Sahip olduğun öğeler (${ownedScripts.length + ownedCosmetics.length})</div>`;
            if (ownedScripts.length === 0 && ownedCosmetics.length === 0) {
                html += `<div class="empty-state"><div class="icon">📭</div><p>Henüz hiçbir şey satın almadın</p></div>`;
            } else {
                html += `<div class="collection-grid">`;
                ownedScripts.forEach(item => {
                    html += `<div class="collection-item"><div class="item-icon">📜</div><div class="item-name">${item.name}</div><div class="item-type">Premium Script</div><button class="use-btn" onclick="useScript('${item.scriptId}')">▶️ Kullan</button></div>`;
                });
                ownedCosmetics.forEach(item => {
                    const isActive = inventory.some(i => i.id === item.id && i.active);
                    html += `<div class="collection-item"><div class="item-icon">${item.icon}</div><div class="item-name">${item.name}</div><div class="item-type">${item.type === 'frame' ? '🖼️ Çerçeve' : '🎨 Renk'}</div><button class="use-btn ${isActive ? 'active' : ''}" onclick="toggleCosmetic('${item.id}')">${isActive ? '✅ Aktif' : '🔘 Kullan'}</button></div>`;
                });
                html += `</div>`;
            }
            container.innerHTML = html;
        }
    }

    async function purchaseScript(scriptId, price) {
        if (!currentUser) return;
        if (purchasedScripts.includes(scriptId)) { showToast('❌ Zaten satın alındı!'); return; }
        const item = SHOP_SCRIPTS.find(s => s.scriptId === scriptId);
        if (await spendCoins(price, item?.name || 'Script')) {
            purchasedScripts.push(scriptId);
            await db.collection('users').doc(currentUser.uid).update({
                purchasedScripts: firebase.firestore.FieldValue.arrayUnion(scriptId)
            });
            showToast(`✅ Script satın alındı!`);
            renderShop(currentShopTab);
            render();
        }
    }

    async function purchaseCosmetic(itemId, price) {
        if (!currentUser) return;
        if (inventory.some(i => i.id === itemId)) { showToast('❌ Zaten satın alındı!'); return; }
        const item = COSMETIC_ITEMS.find(i => i.id === itemId);
        if (await spendCoins(price, item?.name || 'Kozmetik')) {
            const newItem = { ...item, active: false };
            inventory.push(newItem);
            await db.collection('users').doc(currentUser.uid).update({
                inventory: firebase.firestore.FieldValue.arrayUnion(newItem)
            });
            showToast(`✅ ${item?.name} satın alındı!`);
            renderShop(currentShopTab);
        }
    }

    function toggleCosmetic(itemId) {
        const item = inventory.find(i => i.id === itemId);
        if (!item) return;
        inventory.forEach(i => { if (i.type === item.type) i.active = false; });
        item.active = !item.active;
        saveInventory();
        showToast(`✅ ${item.name} ${item.active ? 'aktif' : 'pasif'}!`);
        renderShop('owned');
    }

    async function saveInventory() {
        if (!currentUser) return;
        await db.collection('users').doc(currentUser.uid).update({ inventory: inventory });
    }

    function useScript(scriptId) {
        const all = getAllScripts();
        const script = all.find(s => s.id === scriptId);
        if (!script) { showToast('❌ Bulunamadı!'); return; }
        openTaskModalDirect(script);
    }

    function openCollection() {
        if (!currentUser) { showToast('❌ Lütfen giriş yapın!'); openAuthModal(); return; }
        openCoinShop();
        setTimeout(() => switchShopTab('owned'), 100);
    }

    function updateAuthUI(user) {
        currentUser = user;
        if (user) {
            const name = user.displayName || user.email || 'Kullanıcı';
            const photo = user.photoURL || IMG.users;
            authSection.innerHTML = `<button class="auth-btn" id="profileBtn" style="gap:0.5rem"><img loading="lazy" decoding="async" src="${photo}" alt="Avatar" class="user-avatar" onerror="this.src='${IMG.users}'"><span class="user-name">${escapeHtml(name)}</span></button>`;
            document.getElementById('profileBtn')?.addEventListener('click', openProfileModal);
            loadUserData(user);
            renderDailyTasks();
            document.getElementById('dailyTasksContainer').style.display = 'block';
            if (isAdmin(user)) adminBtn.style.display = 'flex';
            else adminBtn.style.display = 'none';
        } else {
            authSection.innerHTML = `<button class="auth-btn" id="loginBtn"><img loading="lazy" decoding="async" src="${IMG.login}" alt="Giriş" style="width:20px;height:20px;border-radius:4px"> Giriş Yap</button>`;
            document.getElementById('loginBtn')?.addEventListener('click', openAuthModal);
            document.getElementById('dailyTasksContainer').style.display = 'none';
            adminBtn.style.display = 'none';
            userCoins = 0;
            updateCoinDisplay();
        }
    }

    function openAuthModal(){ authModal.classList.add('open'); document.body.style.overflow='hidden'; }
    function closeAuthModalFn(){ authModal.classList.remove('open'); document.body.style.overflow=''; }

    function openProfileModal(){ profileModal.classList.add('open'); document.body.style.overflow='hidden'; renderProfile(); }
    function closeProfileModalFn(){ profileModal.classList.remove('open'); document.body.style.overflow=''; }

    function renderProfile() {
        if (!currentUser) {
            document.getElementById('profileContent').innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted)"><p>Lütfen giriş yapın</p></div>`;
            return;
        }
        const userScripts = communityScripts.filter(s => s.userId === currentUser.uid);
        const userFavs = favorites.filter(id => !id.startsWith('p'));
        const html = `
            <div class="profile-banner"></div>
            <div class="profile-header">
                <img loading="lazy" decoding="async" src="${currentUser.photoURL || IMG.users}" class="profile-avatar" onerror="this.src='${IMG.users}'">
                <div class="profile-info">
                    <h3>${escapeHtml(currentUser.displayName || 'Kullanıcı')}</h3>
                    <p>📧 ${escapeHtml(currentUser.email)}</p>
                    <button class="profile-edit-btn" id="openProfileEditBtn" style="margin-top:0.5rem">✏️ Profili Düzenle</button>
                </div>
            </div>
            <div class="profile-stats">
                <div class="stat"><div class="number">${userScripts.length}</div><span class="label">📜 Script</span></div>
                <div class="stat"><div class="number">${userFavs.length}</div><span class="label">❤️ Favori</span></div>
                <div class="stat"><div class="number">${userCoins}</div><span class="label">🪙 Coin</span></div>
                <div class="stat"><div class="number">${purchasedScripts.length}</div><span class="label">📦 Satın Alınan</span></div>
            </div>
            <div style="display:flex;gap:.45rem;flex-wrap:wrap;margin:-.5rem 0 1rem">
                <span class="badge community">✨ Topluluk Üyesi</span>
                ${userScripts.length >= 5 ? '<span class="badge" style="background:rgba(251,191,36,.15);color:#fbbf24">🏆 Üretici</span>' : ''}
                ${favorites.length >= 10 ? '<span class="badge" style="background:rgba(244,114,182,.15);color:#f472b6">❤️ Koleksiyoncu</span>' : ''}
                ${purchasedScripts.length >= 5 ? '<span class="badge" style="background:rgba(59,130,246,.15);color:#60a5fa">💎 Destekçi</span>' : ''}
            </div>
            <div class="profile-actions">
                <button class="backup-btn" onclick="backupUserData()">💾 Yedekle</button>
                <button class="logout-btn" id="profileLogoutBtn">👋 Çıkış</button>
            </div>
        `;
        document.getElementById('profileContent').innerHTML = html;
        document.getElementById('profileLogoutBtn')?.addEventListener('click', () => { auth.signOut(); closeProfileModalFn(); showToast('👋 Çıkış yapıldı!'); });
        document.getElementById('openProfileEditBtn')?.addEventListener('click', openProfileEditModal);
    }

    function openProfileEditModal(){ if(!currentUser){showToast('❌ Giriş yapın!');return;} profileEditModal.classList.add('open'); document.body.style.overflow='hidden'; renderProfileEdit(); }
    function closeProfileEditModalFn(){ profileEditModal.classList.remove('open'); document.body.style.overflow=''; }

    function renderProfileEdit(){
        if(!currentUser){document.getElementById('profileEditContent').innerHTML='';return;}
        const html=`
            <form id="profileEditForm">
                <div style="text-align:center;margin-bottom:1.5rem">
                    <img loading="lazy" decoding="async" src="${currentUser.photoURL||IMG.users}" class="profile-edit-avatar" id="editAvatar" onerror="this.src='${IMG.users}'">
                </div>
                <div class="form-group"><label>👤 Kullanıcı Adı</label><input type="text" id="editUsername" value="${escapeHtml(currentUser.displayName||'')}" required></div>
                <div class="form-group"><label>📧 E-posta</label><input type="email" value="${escapeHtml(currentUser.email||'')}" disabled style="opacity:0.6"></div>
                <div class="form-group"><label>🖼️ Avatar URL</label><input type="url" id="editAvatarUrl" value="${escapeHtml(currentUser.photoURL||'')}"></div>
                <div class="profile-edit-actions">
                    <button type="button" class="cancel-btn" id="cancelEditBtn">İptal</button>
                    <button type="submit" class="save-btn" id="saveProfileBtn">💾 Kaydet</button>
                </div>
            </form>
        `;
        document.getElementById('profileEditContent').innerHTML=html;
        document.getElementById('cancelEditBtn')?.addEventListener('click', closeProfileEditModalFn);
        document.getElementById('profileEditForm')?.addEventListener('submit', async function(e){
            e.preventDefault();
            const newUsername=document.getElementById('editUsername').value.trim();
            const newAvatarUrl=document.getElementById('editAvatarUrl').value.trim();
            if(!newUsername||newUsername.length<3){showToast('❌ En az 3 karakter!');return;}
            const saveBtn=document.getElementById('saveProfileBtn'); saveBtn.disabled=true; saveBtn.textContent='⏳...';
            try{
                const updates={displayName:newUsername};
                if(newAvatarUrl) updates.photoURL=newAvatarUrl;
                await currentUser.updateProfile(updates);
                await currentUser.reload();
                currentUser=auth.currentUser;
                showToast('✅ Güncellendi!');
                closeProfileEditModalFn(); renderProfile(); updateAuthUI(currentUser);
            }catch(error){showToast('❌ '+error.message);}
            finally{saveBtn.disabled=false; saveBtn.textContent='💾 Kaydet';}
        });
    }

    function openLeaderboard() {
        leaderboardModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        renderLeaderboard();
    }
    function closeLeaderboardFn() {
        leaderboardModal.classList.remove('open');
        document.body.style.overflow = '';
    }
    async function renderLeaderboard() {
        const el = document.getElementById('leaderboardContent');
        el.innerHTML = '<div class="empty-state"><div class="icon">⏳</div><p>Liderlik tablosu yükleniyor...</p></div>';
        try {
            const snap = await db.collection('users').orderBy('totalCoinsEarned','desc').limit(25).get();
            if (snap.empty) {
                el.innerHTML = '<div class="empty-state"><div class="icon">🏆</div><p>Henüz liderlik verisi yok.</p></div>';
                return;
            }
            const rows = [];
            snap.forEach((doc, index) => {
                const d = doc.data();
                const name = escapeHtml(d.displayName || 'Kullanıcı');
                const coins = Number(d.totalCoinsEarned || d.coins || 0);
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                rows.push(`<div class="leaderboard-list-item"><div class="rank">${medal} <strong>#${index+1}</strong></div><div class="info"><div class="title">${name}</div><div class="sub">Toplam kazanılan coin</div></div><div class="score">🪙 ${coins.toLocaleString('tr-TR')}</div></div>`);
            });
            el.innerHTML = rows.join('');
        } catch (e) {
            console.error(e);
            el.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Liderlik tablosu şu anda yüklenemiyor.</p></div>';
        }
    }

    // ========== FIREBASE ==========
    async function loadCommunityScripts(){
        try{
            // Açılışta yalnızca ana script listesini getir. Yorum/rating/view istatistikleri
            // detay modalı açıldığında gerektiğinde yüklenir; böylece N+1 Firebase sorguları kalkar.
            const snap=await db.collection('scripts').orderBy('createdAt','desc').limit(150).get();
            communityScripts=[];
            snap.forEach(d=>{
                const data=d.data();
                let cp = data.coinPrice;
                if (cp === undefined || cp === null || isNaN(cp)) cp = data.isPremium ? 100 : DEFAULT_UNLOCK_PRICE;
                cp = parseInt(cp) || 0;
                communityScripts.push({
                    id:d.id,
                    ...data,
                    isCommunity: data.isCommunity !== undefined ? data.isCommunity : !data.isPremium,
                    isPremium: data.isPremium === true,
                    coinPrice: cp
                });
            });
            return communityScripts;
        }catch(e){console.error(e); return [];}
    }

    async function loadCommunityGames(){
        try{ const snap=await db.collection('games').orderBy('createdAt','desc').limit(200).get();
            communityGames=[]; snap.forEach(d=>{const data=d.data(); communityGames.push({id:d.id,...data});});
            return communityGames;
        }catch(e){console.error(e); return [];}
    }

    // ✅ DÜZELTME 4: Premium scriptleri Firebase'e yaz/güncelle
    async function seedPremiumScripts() {
        try {
            console.log('Premium scriptler Firebase\'e kontrol ediliyor...');
            const batch = db.batch();
            let needsWrite = false;
            
            for (const script of premiumScripts) {
                const ref = db.collection('scripts').doc(script.id);
                const doc = await ref.get();
                if (!doc.exists) {
                    // Yoksa ekle
                    batch.set(ref, {
                        ...script,
                        userName: 'ScriptHub',
                        userId: 'system',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    needsWrite = true;
                } else {
                    // Varsa coinPrice ve isPremium'u güncelle
                    const existing = doc.data();
                    if (existing.coinPrice !== script.coinPrice || existing.isPremium !== true) {
                        batch.update(ref, {
                            coinPrice: script.coinPrice,
                            isPremium: true,
                            isCommunity: false
                        });
                        needsWrite = true;
                    }
                }
            }
            
            if (needsWrite) {
                await batch.commit();
                console.log('✅ Premium scriptler güncellendi!');
            } else {
                console.log('✅ Premium scriptler zaten doğru');
            }
        } catch(e) { console.error('Seed hatası:', e); }
    }

    async function addScriptToFirebase(data){
        try{
            const docRef=await db.collection('scripts').add({
                ...data, userId:currentUser?.uid||null, userEmail:currentUser?.email||null,
                userName:currentUser?.displayName||'Anonim',
                commentCount: 0,
                createdAt:firebase.firestore.FieldValue.serverTimestamp()
            });
            await db.collection('scripts').doc(docRef.id).collection('ratings').doc('stats').set({avg:0,count:0});
            await db.collection('scripts').doc(docRef.id).collection('views').doc('stats').set({count:0});
            addNotification(`📜 Yeni script eklendi: ${data.name}`, 'script');
            await completeDailyTask('daily_add_script');
            return docRef.id;
        }catch(e){console.error(e); showToast('❌ Hata!'); return null;}
    }

    async function addGameToFirebase(data){
        try{
            const docRef=await db.collection('games').add({...data, userId:currentUser?.uid||null, userName:currentUser?.displayName||'Anonim', createdAt:firebase.firestore.FieldValue.serverTimestamp()});
            await completeDailyTask('daily_add_game');
            return docRef.id;
        }catch(e){console.error(e); return null;}
    }

    async function deleteScriptFromFirebase(id){ try{ await db.collection('scripts').doc(id).delete(); return true; }catch(e){return false;} }
    async function deleteGameFromFirebase(id){ try{ await db.collection('games').doc(id).delete(); return true; }catch(e){return false;} }

    async function rateScript(scriptId, rating){
        if(!currentUser){showToast('❌ Giriş yapın!'); openAuthModal(); return;}
        try {
            await db.collection('scripts').doc(scriptId).collection('ratings').doc(currentUser.uid).set({rating, user:currentUser.uid, name:currentUser.displayName||'Anonim'});
            const all=await db.collection('scripts').doc(scriptId).collection('ratings').get();
            let total=0, count=0;
            all.forEach(d=>{ if(d.id!=='stats'){ total+=d.data().rating; count++; }});
            const avg=count>0?total/count:0;
            await db.collection('scripts').doc(scriptId).collection('ratings').doc('stats').set({avg, count});
            ratings[scriptId]={avg,count};
            render();
            showToast(`⭐ Puan verildi! (${avg.toFixed(1)})`);
            await completeDailyTask('daily_rate');
        } catch(e) { showToast('❌ Hata!'); }
    }

    async function addComment(scriptId, text) {
        if (!currentUser) { showToast('❌ Giriş yapın!'); openAuthModal(); return; }
        if (!text || !text.trim()) { showToast('❌ Yorum boş!'); return; }
        const input = document.getElementById(`cmt_${scriptId}`);
        try {
            await db.collection('scripts').doc(scriptId).collection('comments').add({
                user: currentUser.displayName || 'Anonim',
                userId: currentUser.uid,
                userPhoto: currentUser.photoURL || IMG.users,
                text: text.trim(),
                time: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0
            });
            if (input) input.value = '';
            await completeDailyTask('daily_comment');
            await loadCommunityScripts();
            render();
            showToast('✅ Yorum eklendi!');
        } catch (error) { showToast('❌ Hata!'); }
    }

    async function incrementView(scriptId){
        if(!scriptId) return;
        try {
            await db.collection('scripts').doc(scriptId).collection('views').doc('stats').set({count:firebase.firestore.FieldValue.increment(1)}, {merge:true});
            viewCounts[scriptId]=(viewCounts[scriptId]||0)+1;
            if (currentUser) {
                const viewCount = parseInt(localStorage.getItem(`daily_views_${currentUser.uid}`) || 0) + 1;
                localStorage.setItem(`daily_views_${currentUser.uid}`, viewCount);
                if (viewCount >= 3) await completeDailyTask('daily_view');
            }
        } catch(e) {}
    }

    window.adminToggleBan=async function(uid,banned){if(!isAdmin(currentUser))return;await db.collection('users').doc(uid).update({banned:!banned,bannedAt:!banned?firebase.firestore.FieldValue.serverTimestamp():null,bannedBy:!banned?currentUser.uid:null});showToast(!banned?'🚫 Kullanıcı engellendi':'🔓 Kullanıcının engeli kaldırıldı');renderAdminPanel();};
    window.resolveReport=async function(id){if(!isAdmin(currentUser))return;await db.collection('reports').doc(id).update({status:'resolved',resolvedAt:firebase.firestore.FieldValue.serverTimestamp(),resolvedBy:currentUser.uid});showToast('✅ Rapor çözüldü');renderAdminPanel();};
    window.adminInspectUser=async function(uid){
        if(!isAdmin(currentUser))return;
        const d=await db.collection('users').doc(uid).get();
        const x=d.data()||{};
        const action=prompt(
            'Kullanıcı: '+(x.displayName||'Kullanıcı')+
            '\\nE-posta: '+(x.email||'')+
            '\\nCoin: '+(x.coins||0)+
            '\\nSatın alınan: '+((x.purchasedScripts||[]).length)+
            '\\n\\nCoin eklemek için pozitif, çıkarmak için negatif sayı gir:'
        );
        if(action===null || action.trim()==='') return;
        const delta=parseInt(action,10);
        if(!Number.isFinite(delta)||delta===0){showToast('❌ Geçerli bir coin miktarı gir.');return;}
        try{
            await db.collection('users').doc(uid).update({
                coins:firebase.firestore.FieldValue.increment(delta),
                totalCoinsEarned:delta>0?firebase.firestore.FieldValue.increment(delta):firebase.firestore.FieldValue.increment(0)
            });
            await db.collection('users').doc(uid).collection('coinLedger').add({
                type:delta>0?'admin_grant':'admin_deduct',
                amount:Math.abs(delta),delta,by:currentUser.uid,
                createdAt:firebase.firestore.FieldValue.serverTimestamp()
            });
            showToast((delta>0?'🪙 +':'🪙 ')+delta+' coin uygulandı.');
            renderAdminPanel();
        }catch(e){showToast('❌ Coin işlemi başarısız: '+e.message);}
    };
    window.deleteReportedTarget=async function(reportId){if(!isAdmin(currentUser))return;const d=await db.collection('reports').doc(reportId).get();const x=d.data()||{};if(x.targetType==='script'&&x.targetId)await db.collection('scripts').doc(x.targetId).delete();if(x.targetType==='comment'&&x.scriptId&&x.targetId)await db.collection('scripts').doc(x.scriptId).collection('comments').doc(x.targetId).delete();await db.collection('reports').doc(reportId).update({status:'resolved',resolvedAt:firebase.firestore.FieldValue.serverTimestamp(),resolvedBy:currentUser.uid});showToast('🗑️ İçerik ve rapor işlendi');renderAdminPanel();};

    async function reportScript(scriptId){
        if(!currentUser){showToast('❌ Raporlamak için giriş yapmalısın!');openAuthModal();return;}
        const s=getAllScripts().find(x=>x.id===scriptId); if(!s)return;
        const reason=prompt('Rapor nedeni? (Örn: spam, zararlı içerik, yanlış kategori)');
        if(!reason||!reason.trim())return;
        try{
            await db.collection('reports').add({targetType:'script',targetId:scriptId,targetName:s.name||'Script',reporterId:currentUser.uid,reporterName:currentUser.displayName||'Anonim',reason:reason.trim(),details:'',status:'open',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
            showToast('🚨 Rapor adminlere gönderildi.');
        }catch(e){showToast('❌ Rapor gönderilemedi.');}
    }
    window.reportScript=reportScript;

    // ========== SCRIPT DETAILS ==========
    function ensureScriptDetailModal(){
        if(document.getElementById('scriptDetailModal')) return;
        const wrap=document.createElement('div'); wrap.id='scriptDetailModal'; wrap.className='modal-overlay';
        wrap.innerHTML='<div class="modal-card wide"><div class="modal-header"><h2 id="detailTitle">Script Detayı</h2><button class="modal-close" id="closeScriptDetail">✕</button></div><div id="scriptDetailContent"></div></div>';
        document.body.appendChild(wrap);
        document.getElementById('closeScriptDetail').addEventListener('click',closeScriptDetails);
        wrap.addEventListener('click',e=>{if(e.target===wrap)closeScriptDetails();});
    }
    function closeScriptDetails(){const m=document.getElementById('scriptDetailModal');if(m)m.classList.remove('open');document.body.style.overflow='';}
    async function loadScriptDetailsStats(scriptId) {
        try {
            const [ratingSnap, commentSnap, viewSnap] = await Promise.all([
                db.collection('scripts').doc(scriptId).collection('ratings').doc('stats').get(),
                db.collection('scripts').doc(scriptId).collection('comments').orderBy('time','desc').limit(10).get(),
                db.collection('scripts').doc(scriptId).collection('views').doc('stats').get()
            ]);
            if (ratingSnap.exists) ratings[scriptId] = ratingSnap.data();
            comments[scriptId] = [];
            commentSnap.forEach(d => comments[scriptId].push(d.data()));
            viewCounts[scriptId] = viewSnap.exists ? (viewSnap.data().count || 0) : 0;
        } catch (e) {
            console.warn('Script detay istatistikleri yüklenemedi:', e);
        }
    }

    async function openScriptDetails(scriptId){
        ensureScriptDetailModal();
        const s=getAllScripts().find(x=>x.id===scriptId); if(!s){showToast('❌ Script bulunamadı!');return;}
        const rating=ratings[s.id]||{avg:0,count:0}, views=viewCounts[s.id]||0;
        const unlocked=(s.coinPrice===0)||(currentUser&&((s.isCommunity&&s.userId===currentUser.uid)||isAdmin(currentUser)||purchasedScripts.includes(s.id)));
        document.getElementById('detailTitle').textContent=s.name||'Script Detayı';
        document.getElementById('scriptDetailContent').innerHTML='<div class="script-detail-hero"><div class="script-detail-cover">'+getCardImageHTML(s)+'</div><div><h3 style="color:var(--text-primary);font-size:1.25rem">'+escapeHtml(s.name)+'</h3><div class="script-detail-meta"><span class="script-detail-chip">📂 '+escapeHtml((s.category||'other').toUpperCase())+'</span><span class="script-detail-chip">⭐ '+(rating.count?rating.avg.toFixed(1):'Puan yok')+'</span><span class="script-detail-chip">👁️ '+views+'</span><span class="script-detail-chip">💬 '+((comments[s.id]||[]).length)+'</span></div><p style="color:var(--text-secondary);line-height:1.6;font-size:.82rem">'+escapeHtml(s.desc||'Açıklama yok.')+'</p><div class="script-detail-actions"><button class="get-btn '+(unlocked?'':'locked')+'" onclick="closeScriptDetails();document.querySelector(\'.get-btn[data-id=\\\''+s.id+'\\\']\')?.click()">'+(unlocked?'🔓 Kodu Aç':'🔒 '+(s.coinPrice||0)+' Coin')+'</button><button class="detail-btn" onclick="navigator.clipboard.writeText(location.href+\'#script-\'+encodeURIComponent(\''+s.id+'\'));showToast(\'🔗 Script bağlantısı kopyalandı!\')">🔗 Paylaş</button></div></div></div><div class="script-detail-section"><h3 style="color:var(--text-primary);font-size:.9rem;margin-bottom:.5rem">🏷️ Özellikler</h3><div class="script-detail-meta">'+((s.features||[]).length?(s.features||[]).map(f=>'<span class="script-detail-chip">#'+escapeHtml(f)+'</span>').join(''):'<span style="color:var(--text-muted);font-size:.7rem">Özellik belirtilmemiş.</span>')+'</div></div><div class="script-detail-section"><h3 style="color:var(--text-primary);font-size:.9rem;margin-bottom:.5rem">💬 Son Yorumlar</h3>'+((comments[s.id]||[]).slice(0,5).map(x=>'<div style="padding:.45rem 0;border-bottom:1px solid var(--border-color);font-size:.72rem"><strong style="color:var(--accent-light)">'+escapeHtml(x.user||'Anonim')+'</strong> <span style="color:var(--text-secondary)">'+escapeHtml(x.text||'')+'</span></div>').join('')||'<span style="color:var(--text-muted);font-size:.7rem">Henüz yorum yok.</span>')+'</div><div class="script-detail-section"><h3 style="color:var(--text-primary);font-size:.9rem;margin-bottom:.5rem">🧩 Kod</h3><div class="script-detail-code">'+(unlocked?escapeHtml(s.code||'Kod yok.'):'🔒 Kodu görmek için scripti açman gerekiyor.')+'</div></div>';
        document.getElementById('scriptDetailModal').classList.add('open');document.body.style.overflow='hidden';
        if (ratings[s.id] === undefined || comments[s.id] === undefined || viewCounts[s.id] === undefined) {
            await loadScriptDetailsStats(s.id);
            openScriptDetails(s.id);
        }
    }
    window.openScriptDetails=openScriptDetails;

    // ========== ADMIN ==========
    function openAdminModal() {
        if (!currentUser) { showToast('❌ Giriş yapın!'); openAuthModal(); return; }
        if (!isAdmin(currentUser)) { showToast('❌ Yetkin yok!'); return; }
        adminModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        renderAdminPanel();
    }
    function closeAdminModalFn() {
        adminModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    async function renderAdminPanel() {
        const content=document.getElementById('adminContent');
        content.innerHTML='<div class="empty-state"><div class="icon">⏳</div><p>Yönetim verileri yükleniyor...</p></div>';
        try{
            const [usersSnap,scriptsSnap,gamesSnap,reportsSnap]=await Promise.all([
                db.collection('users').limit(500).get(),
                db.collection('scripts').limit(500).get(),
                db.collection('games').limit(200).get(),
                db.collection('reports').where('status','==','open').limit(100).get().catch(()=>({empty:true,forEach:()=>{}}))
            ]);
            let totalViews=0,totalComments=0;
            scriptsSnap.forEach(d=>{
                const x=d.data(); totalViews+=Number(x.views||0);
                totalComments+=Number(x.commentCount||0);
            });
            const reportsCount=reportsSnap.size||0;
            const recent=[];
            scriptsSnap.forEach(d=>{const x=d.data();recent.push({id:d.id,...x});});
            recent.sort((a,b)=>{
                const ta=a.createdAt?.toMillis?a.createdAt.toMillis():Number(a.createdAt||0);
                const tb=b.createdAt?.toMillis?b.createdAt.toMillis():Number(b.createdAt||0);
                return tb-ta;
            });
            const stats=[
                ['👥','Kullanıcı',usersSnap.size],['📜','Script',scriptsSnap.size],
                ['🎮','Oyun',gamesSnap.size],['🚨','Açık Rapor',reportsCount],
                ['👁️','Görüntülenme',totalViews],['💬','Yorum',totalComments]
            ];
            content.innerHTML=`
                <div class="admin-dashboard-grid">${stats.map(x=>`<div class="admin-stat-card"><div class="admin-stat-icon">${x[0]}</div><div class="number">${Number(x[2]).toLocaleString('tr-TR')}</div><span class="label">${x[1]}</span></div>`).join('')}</div>
                <div class="admin-toolbar">
                    <button class="admin-tab active" data-admin-tab="scripts">📜 Scriptler</button>
                    <button class="admin-tab" data-admin-tab="reports">🚨 Raporlar (${reportsCount})</button>
                    <button class="admin-tab" data-admin-tab="users">👥 Kullanıcılar</button>
                    <button class="admin-tab" data-admin-tab="activity">📊 Aktivite</button>
                </div>
                <div id="adminTabContent"></div>
            `;
            const tabContent=document.getElementById('adminTabContent');
            const showScripts=()=>{
                tabContent.innerHTML=`<div class="admin-list">${recent.slice(0,50).map(s=>`
                    <div class="admin-list-item">
                        <div class="info"><div class="title">${escapeHtml(s.name||'İsimsiz')} ${s.isPremium?'⭐':''} <span style="color:var(--gold)">🪙${Number(s.coinPrice||0)}</span></div>
                        <div class="sub">${escapeHtml(s.userName||'Anonim')} · ${s.isCommunity?'Topluluk':'Premium'} · 👁️ ${Number(s.views||0)}</div></div>
                        <div class="actions"><button class="edit-btn" onclick="adminEditScript('${s.id}')">✏️</button><button class="delete-btn-admin" onclick="adminDeleteAnyScript('${s.id}')">🗑️</button></div>
                    </div>`).join('')||'<div class="empty-state"><p>Script bulunamadı.</p></div>'}</div>`;
            };
            const showReports=async()=>{
                const snap=await db.collection('reports').where('status','==','open').limit(100).get().catch(()=>null);
                if(!snap||snap.empty){tabContent.innerHTML='<div class="empty-state"><div class="icon">✅</div><p>Açık rapor yok.</p></div>';return;}
                const rows=[]; snap.forEach(d=>{const x=d.data();rows.push(`<div class="admin-list-item"><div class="info"><div class="title">🚨 ${escapeHtml(x.reason||'Rapor')}</div><div class="sub">${escapeHtml(x.targetName||x.targetId||'Bilinmeyen')} · ${escapeHtml(x.reporterName||'Anonim')}</div><div style="color:var(--text-muted);font-size:.65rem;margin-top:.2rem">${escapeHtml(x.details||'Detay yok')}</div></div><div class="actions"><button class="edit-btn" onclick="resolveReport('${d.id}')">✅</button><button class="delete-btn-admin" onclick="deleteReportedTarget('${d.id}')">🗑️ Sil</button></div></div>`);});
                tabContent.innerHTML='<div class="admin-list">'+rows.join('')+'</div>';
            };
            const showUsers=async()=>{
                const rows=[]; usersSnap.forEach(d=>{const x=d.data();rows.push(`<div class="admin-list-item"><div class="info"><div class="title">👤 ${escapeHtml(x.displayName||'Kullanıcı')}</div><div class="sub">${escapeHtml(x.email||'')} · 🪙 ${Number(x.coins||0)} · 📦 ${(x.purchasedScripts||[]).length}</div></div><div class="actions"><button class="edit-btn" onclick="adminInspectUser('${d.id}')">👁️</button><button class="delete-btn-admin" onclick="adminToggleBan('${d.id}', ${!!x.banned})">${x.banned?'🔓':'🚫'}</button></div></div>`);});
                tabContent.innerHTML='<div class="admin-list">'+rows.join('')+'</div>';
            };
            const showActivity=()=>{tabContent.innerHTML=`<div class="admin-activity-card"><h3>📊 Sistem Özeti</h3><p>Toplam kullanıcı: <b>${usersSnap.size}</b></p><p>Toplam script: <b>${scriptsSnap.size}</b></p><p>Toplam oyun: <b>${gamesSnap.size}</b></p><p>Açık rapor: <b>${reportsCount}</b></p><p>Panel yenilendi: <b>${new Date().toLocaleString('tr-TR')}</b></p></div>`;};
            const tabs={scripts:showScripts,reports:showReports,users:showUsers,activity:showActivity};
            document.querySelectorAll('.admin-tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.admin-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');tabs[b.dataset.adminTab]();}));
            showScripts();
        }catch(e){console.error(e);content.innerHTML='<div class="empty-state"><div class="icon">⚠️</div><p>Admin verileri yüklenemedi.</p></div>';}
    }


    window.adminEditScript = function(scriptId) {
        const script = getAllScripts().find(s => s.id === scriptId);
        if (!script) { showToast('❌ Bulunamadı!'); return; }
        document.getElementById('adminEditScriptId').value = script.id;
        document.getElementById('adminEditScriptName').value = script.name || '';
        document.getElementById('adminEditScriptCategory').value = script.category || 'mm2';
        document.getElementById('adminEditScriptDesc').value = script.desc || '';
        document.getElementById('adminEditScriptFeatures').value = script.features ? script.features.join(', ') : '';
        document.getElementById('adminEditScriptCode').value = script.code || '';
        document.getElementById('adminEditScriptImage').value = script.image || '';
        document.getElementById('adminEditScriptCoinPrice').value = script.coinPrice || 0;
        adminEditScriptModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    window.adminDeleteAnyScript = async function(scriptId) {
        if (!isAdmin(currentUser)) return;
        if (!confirm('Silmek istediğine emin misin?')) return;
        const script = getAllScripts().find(s => s.id === scriptId);
        if (script?.isCommunity) {
            await deleteScriptFromFirebase(scriptId);
            await loadCommunityScripts();
            render();
            renderAdminPanel();
            showToast('🗑️ Silindi!');
        } else {
            showToast('❌ Premium silinemez!');
        }
    };

    document.getElementById('adminEditScriptForm')?.addEventListener('submit', async function(e){
        e.preventDefault();
        const id = document.getElementById('adminEditScriptId').value;
        const name = document.getElementById('adminEditScriptName').value.trim();
        const category = document.getElementById('adminEditScriptCategory').value;
        const desc = document.getElementById('adminEditScriptDesc').value.trim();
        const featuresRaw = document.getElementById('adminEditScriptFeatures').value.trim();
        const code = document.getElementById('adminEditScriptCode').value.trim();
        const image = document.getElementById('adminEditScriptImage').value.trim();
        const coinPrice = parseInt(document.getElementById('adminEditScriptCoinPrice').value) || 0;
        if(!name||!desc||!code){showToast('❌ Zorunlu alanları doldur!');return;}
        const features = featuresRaw ? featuresRaw.split(',').map(f=>f.trim()).filter(f=>f) : [];
        try {
            const script = getAllScripts().find(s => s.id === id);
            if (script?.isCommunity) {
                await db.collection('scripts').doc(id).update({
                    name, category, desc, features, code, image: image || null, coinPrice,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                await loadCommunityScripts();
                showToast('✅ Güncellendi!');
            } else {
                showToast('❌ Sadece topluluk scriptleri düzenlenebilir!');
            }
            adminEditScriptModal.classList.remove('open');
            document.body.style.overflow = '';
            render();
            renderAdminPanel();
        } catch(error) { showToast('❌ Hata: ' + error.message); }
    });

    // ========== UNLOCK ==========
    function openUnlockChoice(script) {
        pendingUnlockScript = script;
        document.getElementById('unlockScriptName').textContent = script.name;
        const price = script.coinPrice || DEFAULT_UNLOCK_PRICE;
        document.getElementById('unlockCoinPrice').textContent = `🪙 ${price} coin`;
        unlockChoiceModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeUnlockChoiceFn() {
        unlockChoiceModal.classList.remove('open');
        document.body.style.overflow = '';
        pendingUnlockScript = null;
    }

    document.getElementById('coinUnlockOption')?.addEventListener('click', async function() {
        if (!pendingUnlockScript) return;
        if (!currentUser) { showToast('❌ Giriş yapın!'); closeUnlockChoiceFn(); openAuthModal(); return; }
        const script = pendingUnlockScript;
        const price = script.coinPrice || DEFAULT_UNLOCK_PRICE;
        if (await spendCoins(price, script.name)) {
            purchasedScripts.push(script.id);
            await db.collection('users').doc(currentUser.uid).update({
                purchasedScripts: firebase.firestore.FieldValue.arrayUnion(script.id)
            });
            showToast(`✅ "${script.name}" açıldı!`);
            closeUnlockChoiceFn();
            openTaskModalDirect(script);
            render();
        }
    });

    document.getElementById('taskUnlockOption')?.addEventListener('click', function() {
        if (!pendingUnlockScript) return;
        const script = pendingUnlockScript;
        closeUnlockChoiceFn();
        openTaskModal(script);
    });

    let modalState = { code: '', scriptId: null, taskStatus: {discord: false, youtube: false, tiktok: false}, timers: {discord: null, youtube: null, tiktok: null}, completed: 0, scrollY: 0 };

    function openTaskModalDirect(script) {
        modalState.scrollY = window.scrollY;
        modalState.code = script.code;
        modalState.completed = 3;
        modalState.scriptId = script.id;
        document.getElementById('modalScriptName').textContent = script.name;
        document.getElementById('taskStatus').textContent = '3/3';
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('revealCodeBtn').classList.add('active');
        document.getElementById('revealCodeBtn').textContent = '🔓 Kodu Göster';
        document.getElementById('codeContainer').classList.remove('show');
        document.querySelectorAll('.task-btn').forEach(b => { b.classList.add('completed'); b.disabled = true; });
        document.body.style.overflow = 'hidden';
        modal.classList.add('open');
    }

    function openTaskModal(script) {
        modalState.scrollY = window.scrollY;
        modalState.code = script.code;
        modalState.scriptId = script.id;
        modalState.taskStatus = {discord: false, youtube: false, tiktok: false};
        modalState.completed = 0;
        document.getElementById('modalScriptName').textContent = script.name;
        document.getElementById('taskStatus').textContent = '0/3';
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('revealCodeBtn').classList.remove('active');
        document.getElementById('revealCodeBtn').textContent = '🔐 Kodu Göster';
        document.getElementById('codeContainer').classList.remove('show');
        document.querySelectorAll('.task-btn').forEach(b => {
            b.classList.remove('completed');
            b.disabled = false;
            const badge = b.querySelector('.timer-badge');
            if (badge) badge.remove();
        });
        Object.values(modalState.timers).forEach(t => { if (t) clearInterval(t); });
        modalState.timers = {discord: null, youtube: null, tiktok: null};
        document.body.style.overflow = 'hidden';
        modal.classList.add('open');
    }

    function closeModalFn() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        if (modalState.scrollY > 0) window.scrollTo(0, modalState.scrollY);
        Object.values(modalState.timers).forEach(t => { if (t) clearInterval(t); });
    }

    document.querySelectorAll('.task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const task = this.dataset.task;
            if (modalState.taskStatus[task]) { showToast('⚠️ Zaten tamamlandı.'); return; }
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
                        if (currentUser && modalState.scriptId && !purchasedScripts.includes(modalState.scriptId)) {
                            purchasedScripts.push(modalState.scriptId);
                            db.collection('users').doc(currentUser.uid).update({
                                purchasedScripts: firebase.firestore.FieldValue.arrayUnion(modalState.scriptId)
                            });
                        }
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

    document.getElementById('revealCodeBtn').addEventListener('click', function() {
        if (!this.classList.contains('active')) { showToast('❌ Önce görevleri tamamla!'); return; }
        document.getElementById('codeContainer').classList.add('show');
        document.getElementById('scriptCode').textContent = modalState.code;
        this.textContent = '✅ Kod hazır!';
    });

    document.getElementById('copyCodeBtn').addEventListener('click', function() {
        const code = document.getElementById('scriptCode').textContent;
        navigator.clipboard.writeText(code).then(() => showToast('📋 Kopyalandı!'))
            .catch(() => { const t = document.createElement('textarea'); t.value = code; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); showToast('📋 Kopyalandı!'); });
    });

    // ✅ DÜZELTME 5: GET Handler - kilit kontrolü düzgün
    function getHandler() {
        const id = this.dataset.id;
        const all = getAllScripts();
        const script = all.find(s => s.id === id);
        if (!script) return;
        
        const isOwner = script.isCommunity && currentUser && script.userId === currentUser.uid;
        const adminUser = isAdmin(currentUser);
        const isPurchased = purchasedScripts.includes(script.id);
        const isFree = script.coinPrice === 0;
        const isUnlocked = isOwner || adminUser || isPurchased || isFree;
        
        if (isUnlocked) {
            incrementView(id);
            openTaskModalDirect(script);
            return;
        }
        
        if (!currentUser) {
            showToast('❌ Bu scripti açmak için giriş yapmalısın!');
            openAuthModal();
            return;
        }
        
        incrementView(id);
        openUnlockChoice(script);
    }

    // ✅ DÜZELTME 6: Kart resmi - resim yoksa kategori ikonu göster
    function getCardImageHTML(script) {
        if (script.image && script.image.trim()) {
            return `<img src="${escapeHtml(script.image)}" alt="${escapeHtml(script.name)}" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'font-size:3rem\\'>${CATEGORY_ICONS[script.category] || '🎮'}</div>'">`;
        }
        return `<div style="font-size:3rem">${CATEGORY_ICONS[script.category] || '🎮'}</div>`;
    }


function renderGamesView(){
    const games = [...communityGames].sort((a,b)=>{
        const ta=a.createdAt?.toMillis?a.createdAt.toMillis():Number(a.createdAt||0);
        const tb=b.createdAt?.toMillis?b.createdAt.toMillis():Number(b.createdAt||0);
        return tb-ta;
    });
    if(gameCountBadge) gameCountBadge.textContent = games.length + (games.length===1?' OYUN':' OYUN');
    totalCount.textContent = games.length;
    communityCount.textContent = communityScripts.length;
    favCount.textContent = favorites.length;
    paginationControls.innerHTML = '';
    if(!games.length){
        grid.innerHTML = `
          <div class="games-empty">
            <div class="games-empty-icon">🎮</div>
            <h3>Henüz oyun eklenmemiş</h3>
            <p>Topluluktan ilk oyunu sen ekleyebilirsin.</p>
            <button class="add-game-btn" onclick="document.getElementById('addGameBtn')?.click()">➕ Oyun Ekle</button>
          </div>`;
        return;
    }
    grid.innerHTML = '<div class="game-grid">'+games.map(g=>{
        const owner=currentUser && g.userId===currentUser.uid;
        const adminUser=isAdmin(currentUser);
        const image=g.image||g.imageUrl||'';
        const safeLink=String(g.link||g.url||'').replace(/"/g,'&quot;');
        const imageHtml=image
          ? '<img src="'+escapeHtml(image)+'" alt="'+escapeHtml(g.name||'Oyun')+'" loading="lazy" onerror="this.parentElement.classList.add(\'image-failed\');this.remove()">'
          : '<div class="game-placeholder">🎮</div>';
        return '<article class="game-card"><div class="game-cover">'+imageHtml+'</div><div class="game-body"><div class="game-top"><span class="game-chip">🎮 OYUN</span><span class="game-author">'+escapeHtml(g.userName||'Anonim')+'</span></div><h3>'+escapeHtml(g.name||'İsimsiz Oyun')+'</h3><p>'+escapeHtml(g.desc||'Topluluk tarafından eklenen oyun.')+'</p><div class="game-actions"><a class="game-play-btn" href="'+safeLink+'" target="_blank" rel="noopener noreferrer">▶️ Oyunu Aç</a>'+(owner||adminUser?'<button class="game-delete-btn" onclick="deleteCommunityGame(\''+g.id+'\')">🗑️ Sil</button>':'')+'</div></div></article>';
    }).join('')+'</div>';
}
window.deleteCommunityGame=async function(id){
    if(!currentUser){showToast('❌ Giriş yapın!');return;}
    const game=communityGames.find(g=>g.id===id);
    if(!game)return;
    if(!isAdmin(currentUser)&&game.userId!==currentUser.uid){showToast('❌ Yetkin yok!');return;}
    if(!confirm('"'+(game.name||'Oyun')+'" silinsin mi?'))return;
    if(await deleteGameFromFirebase(id)){
        await loadCommunityGames();
        render();
        showToast('🗑️ Oyun silindi.');
    }
};

    function render() {
        if(currentCategory==='games'){ renderGamesView(); return; }
        const all = getAllScripts();
        let filtered = all.filter(s => {
            let catMatch = currentCategory === 'all' ? true : 
                (currentCategory === 'favorites' ? favorites.includes(s.id) : 
                (currentCategory === 'community' ? s.isCommunity === true : s.category === currentCategory));
            let typeMatch = filterType === 'all' ? true : 
                (filterType === 'premium' ? s.isPremium : filterType === 'community' ? s.isCommunity : true);
            let searchMatch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                (s.desc || '').toLowerCase().includes(searchTerm.toLowerCase());
            return catMatch && typeMatch && searchMatch;
        });

        const sortVal = filterSort.value;
        if (sortVal === 'az') filtered.sort((a,b) => (a.name||'').localeCompare(b.name||''));
        else if (sortVal === 'za') filtered.sort((a,b) => (b.name||'').localeCompare(a.name||''));
        else if (sortVal === 'popular') filtered.sort((a,b) => (viewCounts[b.id]||0) - (viewCounts[a.id]||0));
        else if (sortVal === 'newest') filtered.sort((a,b) => (b.createdAt||0) - (a.createdAt||0));

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        if (currentPage > totalPages) currentPage = Math.max(1, totalPages);
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

        totalCount.textContent = filtered.length;
        favCount.textContent = favorites.length;
        communityCount.textContent = communityScripts.length;

        if (!paginated.length) {
            grid.innerHTML = `<div class="empty"><div style="font-size:2.5rem">🔍</div><h3>Sonuç bulunamadı</h3></div>`;
            paginationControls.innerHTML = '';
            return;
        }

        grid.innerHTML = paginated.map(s => {
            const isFav = favorites.includes(s.id);
            const isCommunity = s.isCommunity || false;
            const isPremium = s.isPremium || false;
            const isOwner = currentUser && isCommunity && s.userId === currentUser.uid;
            const canDelete = isCommunity && isOwner;
            const badgeImg = isCommunity ? IMG.community : IMG.premium;
            const badgeText = isCommunity ? 'Topluluk' : 'Premium';
            const rating = ratings[s.id] || {avg:0, count:0};
            const views = viewCounts[s.id] || 0;
            const scriptComments = comments[s.id] || [];
            const isPurchased = purchasedScripts.includes(s.id);
            const isAdminUser = isAdmin(currentUser);
            const isFree = (s.coinPrice === 0);
            const isUnlocked = isOwner || isAdminUser || isPurchased || isFree;
            const coinPrice = s.coinPrice || 0;

            return `
                <div class="script-card ${((inventory||[]).find(i=>i.type==='scriptFrame'&&i.active)?.value||'') ? 'script-frame-'+((inventory||[]).find(i=>i.type==='scriptFrame'&&i.active)?.value||'') : ''}">
                    <div class="card-image">${getCardImageHTML(s)}</div>
                    <div class="card-body">
                        <div class="card-header">
                            <h3><img loading="lazy" decoding="async" src="${getImageForCategory(s.category)}" style="width:20px;height:20px;border-radius:4px" onerror="this.src='${DEFAULT_IMAGE}'">${escapeHtml(s.name)} ${isPremium ? '⭐' : ''}</h3>
                            <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${s.id}">♥</button>
                        </div>
                        <span class="card-category">${(s.category||'other').toUpperCase()} ${isCommunity ? '· 🌍' : ''}</span>
                        <div class="card-desc">${escapeHtml(s.desc)}</div>
                        <div class="rating-stars">
                            ${[1,2,3,4,5].map(i => `<span class="star ${i <= Math.round(rating.avg) ? 'active' : ''}" onclick="rateScript('${s.id}',${i})">★</span>`).join('')}
                            <span class="rating-avg">${rating.avg > 0 ? rating.avg.toFixed(1) : 'Puan yok'}</span>
                            <span style="color:var(--text-muted);font-size:0.6rem;margin-left:0.3rem">👁️ ${views}</span>
                        </div>
                        <div class="card-features">${s.features ? s.features.map(f => `<span class="tag">${escapeHtml(f)}</span>`).join('') : ''}</div>
                        ${s.userName ? `<div class="script-owner"><img loading="lazy" decoding="async" src="${IMG.users}" style="width:14px;height:14px">${escapeHtml(s.userName)}${isOwner ? ' <span class="badge" style="background:rgba(251,191,36,0.15);color:#fbbf24;font-size:0.5rem;padding:0.05rem 0.5rem;border-radius:20px">👑 Sahibim</span>' : ''}</div>` : ''}
                        <div class="comment-section">
                            ${isPremium ? `<div style="color:var(--text-muted);font-size:0.65rem;text-align:center;padding:0.3rem">⭐ Premium yorum kapalı</div>` : `
                                <div style="max-height:80px;overflow-y:auto;margin-bottom:0.3rem">
                                    ${scriptComments.length === 0 ? '<div style="color:var(--text-muted);font-size:0.65rem;text-align:center;padding:0.2rem">💬 İlk yorumu sen yap!</div>' :
                                        scriptComments.slice(0,3).map(c => `
                                            <div class="comment-item">
                                                <span class="cmt-user">${escapeHtml(c.user)}</span>
                                                <span style="color:var(--text-secondary);font-size:0.7rem">${escapeHtml(c.text)}</span>
                                            </div>
                                        `).join('')}
                                </div>
                                <div class="comment-input">
                                    <input type="text" placeholder="Yorum yaz..." id="cmt_${s.id}" onkeypress="if(event.key==='Enter') addComment('${s.id}', this.value)">
                                    <button onclick="addComment('${s.id}', document.getElementById('cmt_${s.id}').value)">💬 Gönder</button>
                                </div>
                            `}
                        </div>
                        <div class="card-footer">
                            <div style="display:flex;gap:0.3rem;flex-wrap:wrap;align-items:center">
                                <span class="badge ${isCommunity ? 'community' : ''}"><img loading="lazy" decoding="async" src="${badgeImg}" style="width:14px;height:14px">${badgeText}</span>
                                ${!isUnlocked ? `<span class="badge price-badge">🪙 ${coinPrice}</span>` : ''}
                                ${isUnlocked && !isOwner && !isAdminUser ? `<span class="badge" style="background:rgba(74,222,128,0.15);color:#4ade80">✅ Açık</span>` : ''}
                            </div>
                            <div style="display:flex;gap:0.3rem;flex-wrap:wrap">
                                ${isOwner ? `<button class="edit-script-btn" onclick="openEditScriptModal('${s.id}')" style="background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.15);border-radius:20px;padding:0.05rem 0.6rem;color:var(--accent-light);font-size:0.55rem;cursor:pointer">✏️ Düzenle</button>` : ''}
                                ${canDelete ? `<button class="delete-btn" data-id="${s.id}"><img loading="lazy" decoding="async" src="${IMG.delete}" alt="Sil"> Sil</button>` : ''}
                                <button class="detail-btn" onclick="openScriptDetails('${s.id}')">ℹ️ Detay</button>
                                <button class="detail-btn" onclick="reportScript('${s.id}')">🚨 Rapor</button>
                                <button class="get-btn ${isUnlocked ? '' : 'locked'}" data-id="${s.id}">
                                    ${isUnlocked ? `<img loading="lazy" decoding="async" src="${IMG.get}" alt="GET"> GET` : `🔒 ${coinPrice > 0 ? '🪙 '+coinPrice : 'Aç'}`}
                                </button>
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

    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        if (totalPages <= 1) { paginationControls.innerHTML = ''; return; }
        let html = `<button data-page="prev" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
        }
        html += `<button data-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>`;
        paginationControls.innerHTML = html;
        paginationControls.querySelectorAll('button[data-page]').forEach(b => {
            b.addEventListener('click', function() {
                const p = this.dataset.page;
                if (p === 'prev' && currentPage > 1) currentPage--;
                else if (p === 'next' && currentPage < totalPages) currentPage++;
                else if (p !== 'prev' && p !== 'next') currentPage = parseInt(p);
                render();
            });
        });
    }

    function favHandler() {
        const id = this.dataset.id;
        const idx = favorites.indexOf(id);
        if (idx > -1) favorites.splice(idx, 1);
        else favorites.push(id);
        localStorage.setItem('scriptHubFavs', JSON.stringify(favorites));
        render();
        showToast('❤️ Favori güncellendi');
        completeDailyTask('daily_fav');
    }

    async function deleteHandler() {
        const id = this.dataset.id;
        const script = communityScripts.find(s => s.id === id);
        if (!script || !currentUser || currentUser.uid !== script.userId) { showToast('❌ Yetkin yok!'); return; }
        if (!confirm(`"${script.name}" silinsin mi?`)) return;
        if (await deleteScriptFromFirebase(id)) {
            await loadCommunityScripts();
            render();
            showToast('🗑️ Silindi!');
        }
    }

    async function openEditScriptModal(scriptId) {
        if (!currentUser) { showToast('❌ Giriş yapın!'); return; }
        const script = getAllScripts().find(s => s.id === scriptId);
        if (!script || !script.isCommunity || script.userId !== currentUser.uid) { showToast('❌ Yetkin yok!'); return; }
        document.getElementById('editScriptId').value = script.id;
        document.getElementById('editScriptName').value = script.name;
        document.getElementById('editScriptCategory').value = script.category;
        document.getElementById('editScriptDesc').value = script.desc;
        document.getElementById('editScriptFeatures').value = script.features ? script.features.join(', ') : '';
        document.getElementById('editScriptCode').value = script.code;
        document.getElementById('editScriptImage').value = script.image || '';
        document.getElementById('editScriptCoinPrice').value = script.coinPrice || DEFAULT_UNLOCK_PRICE;
        editScriptModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    window.openEditScriptModal = openEditScriptModal;

    document.getElementById('editScriptForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = document.getElementById('editScriptId').value;
        const name = document.getElementById('editScriptName').value.trim();
        const category = document.getElementById('editScriptCategory').value;
        const desc = document.getElementById('editScriptDesc').value.trim();
        const featuresRaw = document.getElementById('editScriptFeatures').value.trim();
        const code = document.getElementById('editScriptCode').value.trim();
        const image = document.getElementById('editScriptImage').value.trim();
        const coinPrice = parseInt(document.getElementById('editScriptCoinPrice').value) || 0;
        if (!name || !desc || !code) { showToast('❌ Zorunlu alanları doldur!'); return; }
        const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(f => f) : [];
        try {
            await db.collection('scripts').doc(id).update({
                name, category, desc, features, code, image: image || null, coinPrice,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            editScriptModal.classList.remove('open');
            document.body.style.overflow = '';
            await loadCommunityScripts();
            render();
            showToast('✅ Güncellendi!');
        } catch (error) { showToast('❌ Hata: ' + error.message); }
    });

    async function backupUserData() {
        if (!currentUser) { showToast('❌ Giriş yapın!'); return; }
        try {
            const data = { user: currentUser.uid, favorites, notifications, coins: userCoins, purchasedScripts, inventory, dailyProgress, date: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `scripthub_backup_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('✅ Yedeklendi!');
        } catch(e) { showToast('❌ Hata: ' + e.message); }
    }
    window.backupUserData = backupUserData;

    function setLanguage(lang) {
        localStorage.setItem('scriptHubLang', lang);
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
        showToast(`🌐 ${lang === 'tr' ? 'Türkçe' : 'English'}`);
    }
    window.setLanguage = setLanguage;

    function selectAvatar(el) {
        document.querySelectorAll('.avatar-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        selectedAvatar = el.dataset.avatar;
        document.getElementById('avatarStatus').textContent = '✅ Seçildi';
    }
    window.selectAvatar = selectAvatar;

    document.getElementById('avatarFileInput')?.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedAvatarUrl = e.target.result;
            selectedAvatar = e.target.result;
            const uploadOption = document.getElementById('uploadAvatarOption');
            uploadOption.innerHTML = `<img loading="lazy" decoding="async" src="${e.target.result}" style="width:100%;height:100%;object-fit:cover">`;
            uploadOption.classList.add('selected');
            document.querySelectorAll('.avatar-option').forEach(el => { if (el.id !== 'uploadAvatarOption') el.classList.remove('selected'); });
            document.getElementById('avatarStatus').textContent = '✅ Yüklendi!';
        };
        reader.readAsDataURL(file);
    });

    async function uploadCommunityImage(file, kind) {
        if (!file || !currentUser) return null;
        if (!file.type.startsWith('image/')) { showToast('❌ Sadece resim dosyası seçebilirsin!'); return null; }
        if (file.size > 5 * 1024 * 1024) { showToast('❌ Resim 5 MB\'dan küçük olmalı!'); return null; }
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const path = 'community-images/' + currentUser.uid + '/' + kind + '-' + Date.now() + '-' + Math.random().toString(36).slice(2,8) + '.' + ext;
        try {
            const ref = storage.ref(path);
            const snapshot = await ref.put(file, { contentType: file.type, cacheControl: 'public,max-age=31536000' });
            return await snapshot.ref.getDownloadURL();
        } catch (error) {
            console.error('Image upload error:', error);
            showToast('❌ Resim yüklenemedi: ' + error.message);
            return null;
        }
    }

    function setupImagePicker(inputId, urlId, previewId) {
        const input = document.getElementById(inputId);
        const urlInput = document.getElementById(urlId);
        const preview = document.getElementById(previewId);
        if (!input) return;
        input.addEventListener('change', function() {
            const file = this.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
                showToast('❌ Geçersiz resim veya 5 MB üzeri dosya!');
                this.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = e => {
                preview.innerHTML = '<img loading="lazy" decoding="async" src="' + e.target.result + '" style="max-width:100%;max-height:180px;border-radius:12px;object-fit:cover">';
                if (urlInput) urlInput.value = '';
            };
            reader.readAsDataURL(file);
        });
        urlInput?.addEventListener('input', function() {
            if (!this.value.trim()) return;
            preview.innerHTML = '<img loading="lazy" decoding="async" src="' + this.value.trim().replace(/"/g, '&quot;') + '" style="max-width:100%;max-height:180px;border-radius:12px;object-fit:cover" onerror="this.parentElement.innerHTML=\'🖼️ Resim önizlemesi burada\'">';
            if (input) input.value = '';
        });
    }

    setupImagePicker('scriptImageFile', 'scriptImage', 'imagePreview');
    setupImagePicker('gameImageFile', 'gameImage', 'gameImagePreview');

    document.getElementById('addScriptForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('scriptName').value.trim();
        const category = document.getElementById('scriptCategory').value;
        const desc = document.getElementById('scriptDesc').value.trim();
        const featuresRaw = document.getElementById('scriptFeatures').value.trim();
        const code = document.getElementById('scriptCodeInput').value.trim();
        let image = document.getElementById('scriptImage').value.trim();
        const imageFile = document.getElementById('scriptImageFile')?.files?.[0];
        if (imageFile) {
            showToast('⏳ Script resmi yükleniyor...');
            image = await uploadCommunityImage(imageFile, 'script');
            if (!image) return;
        }
        const coinPrice = parseInt(document.getElementById('scriptCoinPrice').value) || 0;
        if (!name || !desc || !code) { showToast('❌ Zorunlu alanları doldur!'); return; }
        const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(f => f) : [];
        const data = { name, category, desc, features, code, image: image || null, coinPrice, isCommunity: true, isPremium: false, status: 'active', downloads: 0, commentCount: 0 };
        if (await addScriptToFirebase(data)) {
            addModal.classList.remove('open');
            document.body.style.overflow = '';
            this.reset();
            document.getElementById('scriptCoinPrice').value = '30';
            document.getElementById('imagePreview').innerHTML = '🖼️ Resim önizlemesi';
            await loadCommunityScripts();
            render();
            showToast('✅ Script eklendi! 🪙 +25 coin');
        }
    });

    document.getElementById('addGameForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('gameName').value.trim();
        const link = document.getElementById('gameLink').value.trim();
        let image = document.getElementById('gameImage').value.trim();
        const imageFile = document.getElementById('gameImageFile')?.files?.[0];
        if (imageFile) {
            showToast('⏳ Oyun resmi yükleniyor...');
            image = await uploadCommunityImage(imageFile, 'game');
            if (!image) return;
        }
        const desc = document.getElementById('gameDesc').value.trim();
        if (!name || !link || !image) { showToast('❌ Oyun adı, linki ve resmi gerekli!'); return; }
        const data = { name, link, image, desc: desc || `${name}`, userName: currentUser?.displayName || 'Anonim', userId: currentUser?.uid };
        if (await addGameToFirebase(data)) {
            addGameModal.classList.remove('open');
            document.body.style.overflow = '';
            this.reset();
            await loadCommunityGames();
            render();
            showToast('🎮 Oyun eklendi! 🪙 +20 coin');
        }
    });

    document.querySelectorAll('.auth-tabs button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.auth-tabs button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById(this.dataset.tab === 'login' ? 'loginForm' : 'registerForm').classList.add('active');
        });
    });

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

    document.getElementById('loginSubmitBtn')?.addEventListener('click', async function() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const errorDiv = document.getElementById('loginError');
        if (!email || !password) { errorDiv.textContent = '❌ Tüm alanları doldur!'; errorDiv.style.display = 'block'; return; }
        errorDiv.style.display = 'none';
        this.disabled = true; this.textContent = '⏳...';
        try {
            await auth.signInWithEmailAndPassword(email, password);
            closeAuthModalFn();
            showToast('✅ Hoş geldin!');
            completeDailyTask('daily_login');
        } catch(error) {
            errorDiv.textContent = '❌ ' + error.message;
            errorDiv.style.display = 'block';
        } finally { this.disabled = false; this.textContent = '🚀 Giriş Yap'; }
    });

    document.getElementById('registerSubmitBtn')?.addEventListener('click', async function() {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        const errorDiv = document.getElementById('registerError');
        const successDiv = document.getElementById('registerSuccess');
        errorDiv.style.display = 'none'; successDiv.style.display = 'none';
        if (!username || !email || !password) { errorDiv.textContent = '❌ Tüm alanları doldur!'; errorDiv.style.display = 'block'; return; }
        if (password.length < 6) { errorDiv.textContent = '❌ Şifre en az 6 karakter!'; errorDiv.style.display = 'block'; return; }
        if (username.length < 3) { errorDiv.textContent = '❌ Kullanıcı adı en az 3 karakter!'; errorDiv.style.display = 'block'; return; }
        let avatarUrl = selectedAvatar;
        this.disabled = true; this.textContent = '⏳...';
        try {
            const userCred = await auth.createUserWithEmailAndPassword(email, password);
            await userCred.user.updateProfile({ displayName: username, photoURL: avatarUrl });
            successDiv.textContent = '✅ Hesabın oluşturuldu!';
            successDiv.style.display = 'block';
            setTimeout(() => { closeAuthModalFn(); showToast('✅ Hoş geldin, ' + username + '!'); completeDailyTask('daily_login'); }, 1500);
        } catch(error) {
            errorDiv.textContent = '❌ ' + error.message;
            errorDiv.style.display = 'block';
        } finally { this.disabled = false; this.textContent = '🚀 Kayıt Ol'; }
    });

    document.getElementById('googleLoginBtn')?.addEventListener('click', async function() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
            closeAuthModalFn();
            showToast('✅ Google ile giriş!');
            completeDailyTask('daily_login');
        } catch(error) { showToast('❌ ' + error.message); }
    });

    document.getElementById('googleRegisterBtn')?.addEventListener('click', async function() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
            closeAuthModalFn();
            showToast('✅ Google ile kayıt!');
            completeDailyTask('daily_login');
        } catch(error) { showToast('❌ ' + error.message); }
    });

    filterSort.addEventListener('change', () => { currentPage = 1; render(); });
    filterTypeEl.addEventListener('change', () => { currentPage = 1; filterType = filterTypeEl.value; render(); });

    catBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            catBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.cat;
            currentPage = 1;
            render();
        });
    });

    searchInput.addEventListener('input', function() { searchTerm = this.value; currentPage = 1; render(); });

    document.getElementById('addScriptBtn').addEventListener('click', () => { if (!currentUser) { showToast('❌ Giriş yapın!'); openAuthModal(); return; } addModal.classList.add('open'); document.body.style.overflow = 'hidden'; });
    document.getElementById('closeAddModal').addEventListener('click', () => { addModal.classList.remove('open'); document.body.style.overflow = ''; });
    
    document.getElementById('addGameBtn').addEventListener('click', () => { if (!currentUser) { showToast('❌ Giriş yapın!'); openAuthModal(); return; } addGameModal.classList.add('open'); document.body.style.overflow = 'hidden'; });
    document.getElementById('closeAddGameModal').addEventListener('click', () => { addGameModal.classList.remove('open'); document.body.style.overflow = ''; });
    
    document.getElementById('closeAuthModal').addEventListener('click', closeAuthModalFn);
    document.getElementById('closeProfileModal').addEventListener('click', closeProfileModalFn);
    document.getElementById('closeProfileEditModal').addEventListener('click', closeProfileEditModalFn);
    document.getElementById('closeAdminModal').addEventListener('click', closeAdminModalFn);
    document.getElementById('closeLeaderboardModal').addEventListener('click', closeLeaderboardFn);
    document.getElementById('closeCoinShopModal').addEventListener('click', closeCoinShopFn);
    document.getElementById('closeUnlockChoiceModal').addEventListener('click', closeUnlockChoiceFn);
    document.getElementById('closeModal').addEventListener('click', closeModalFn);
    document.getElementById('closeEditScriptModal').addEventListener('click', () => { editScriptModal.classList.remove('open'); document.body.style.overflow = ''; });
    document.getElementById('closeAdminEditScriptModal').addEventListener('click', () => { adminEditScriptModal.classList.remove('open'); document.body.style.overflow = ''; });

    function acceptCookies() {
        document.getElementById('cookieConsent').style.display = 'none';
        localStorage.setItem('cookieConsent', 'true');
    }
    window.acceptCookies = acceptCookies;
    document.addEventListener('DOMContentLoaded', function() {
        if (!localStorage.getItem('cookieConsent')) document.getElementById('cookieConsent').style.display = 'block';
    });

    function setTheme(theme) {
        document.body.className = theme;
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
        localStorage.setItem('scriptHubTheme', theme);
    }
    document.querySelectorAll('.theme-btn').forEach(btn => btn.addEventListener('click', () => setTheme(btn.dataset.theme)));
    setTheme(localStorage.getItem('scriptHubTheme') || 'dark');

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

    (function() {
        const chatBtn = document.getElementById('chatToggleBtn');
        const chatFrame = document.getElementById('chatFrame');
        let isOpen = false;
        chatBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            isOpen = !isOpen;
            chatFrame.classList.toggle('open', isOpen);
            chatBtn.innerHTML = isOpen ? '✕' : '💬';
        });
    })();

    const scrollBtn = document.getElementById('scrollTopBtn');
    window.addEventListener('scroll', () => scrollBtn.classList.toggle('visible', window.scrollY > 300));
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(e => console.log(e));

    window.openProfileModal = openProfileModal;
    window.openCoinShop = openCoinShop;
    window.openCollection = openCollection;
    window.switchShopTab = switchShopTab;
    window.purchaseScript = purchaseScript;
    window.purchaseCosmetic = purchaseCosmetic;
    window.toggleCosmetic = toggleCosmetic;
    window.useScript = useScript;
    window.openLeaderboard = openLeaderboard;
    window.openAdminModal = openAdminModal;
    window.rateScript = rateScript;
    window.addComment = addComment;
    window.claimAllRewards = claimAllRewards;
    window.completeDailyTask = completeDailyTask;

    async function init() {
        favorites = JSON.parse(localStorage.getItem('scriptHubFavs')) || [];
        const savedNotifs = localStorage.getItem('scriptHubNotifs');
        if (savedNotifs) notifications = JSON.parse(savedNotifs);
        updateNotificationUI();

        // Ana listeyi önce göster; ağır/ikincil işlemler ilk ekranı bloke etmesin.
        render();
        await Promise.all([loadCommunityScripts(), loadCommunityGames()]);
        render();

        // Premium seed'i kullanıcı arayüzünü bekletmeden arka planda çalıştır.
        setTimeout(() => seedPremiumScripts().catch(console.error), 1200);

        auth.onAuthStateChanged(async user => {
            updateAuthUI(user);
            if (user) {
                await loadUserData(user);
                renderDailyTasks();
                render();
            }
        });

        if (!localStorage.getItem('scriptHubWelcomed')) {
            addNotification('👋 ScriptHub\'a hoş geldin! 🪙 Coin kazan, ödüllerin topla!', 'welcome');
            localStorage.setItem('scriptHubWelcomed', 'true');
        }
    }

    init();

})();



/* ================== ScriptHub Stability Enhancements ================== */
(function(){
  const style=document.createElement('style');
  style.textContent=`
    img[data-sh-img]{content-visibility:auto;contain-intrinsic-size:320px 180px}
    .image-upload-progress{height:4px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-top:8px}
    .image-upload-progress>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--accent),var(--accent-light));transition:width .2s}
    .profile-banner{min-height:92px;border-radius:16px;margin:-.25rem -.25rem 1rem;background:linear-gradient(135deg,rgba(124,58,237,.35),rgba(59,130,246,.18));position:relative;overflow:hidden}
    .profile-banner:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 80% 20%,rgba(255,255,255,.12),transparent 35%)}
    .shortcut-hint{font-size:.58rem;color:var(--text-muted);opacity:.8;margin-left:.35rem}
  `;
  document.head.appendChild(style);

  // Keep every existing image URL intact. Only add browser-side loading hints.
  function optimizeImages(){
    document.querySelectorAll('img:not([data-sh-img])').forEach(img=>{
      img.dataset.shImg='1';
      if(!img.hasAttribute('loading')) img.loading='lazy';
      if(!img.hasAttribute('decoding')) img.decoding='async';
      img.addEventListener('error',()=>{img.dataset.shBroken='1'}, {once:true});
    });
  }
  const mo=new MutationObserver(()=>requestAnimationFrame(optimizeImages));
  mo.observe(document.documentElement,{childList:true,subtree:true});
  optimizeImages();

  // Keyboard shortcuts: Ctrl/Cmd+K search, / focus search, Esc close overlays,
  // Alt+P profile, Alt+A admin, Alt+S add script.
  document.addEventListener('keydown',function(e){
    const tag=(e.target&&e.target.tagName||'').toLowerCase();
    const typing=['input','textarea','select'].includes(tag) || e.target?.isContentEditable;
    if(e.key==='Escape'){
      const open=document.querySelector('.modal-overlay.open');
      if(open){
        const close=open.querySelector('.modal-close');
        if(close) close.click();
        else {open.classList.remove('open');document.body.style.overflow='';}
      }
      return;
    }
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
      e.preventDefault();
      const s=document.getElementById('searchInput');
      if(s){s.focus();s.select();}
      return;
    }
    if(!typing && e.key==='/'){
      e.preventDefault();
      const s=document.getElementById('searchInput');
      if(s){s.focus();s.select();}
      return;
    }
    if(e.altKey && e.key.toLowerCase()==='p' && currentUser){e.preventDefault();openProfileModal();return;}
    if(e.altKey && e.key.toLowerCase()==='a' && currentUser && isAdmin(currentUser)){e.preventDefault();openAdminModal();return;}
    if(e.altKey && e.key.toLowerCase()==='s' && currentUser){e.preventDefault();document.getElementById('addScriptBtn')?.click();return;}
  });

  // Safer coin bookkeeping: retain the existing balance and add a lightweight ledger.
  // It does not rewrite or remove any existing coin data.
  const originalAddCoins=window.addCoins || addCoins;
  if(typeof originalAddCoins==='function'){
    window.addCoins=async function(amount,reason){
      const before=userCoins;
      const result=await originalAddCoins(amount,reason);
      if(currentUser && amount>0 && userCoins>=before){
        db.collection('users').doc(currentUser.uid).collection('coinLedger').add({
          type:'earn',amount:Number(amount),reason:String(reason||''),createdAt:firebase.firestore.FieldValue.serverTimestamp()
        }).catch(()=>{});
      }
      return result;
    };
  }
  const originalSpendCoins=window.spendCoins || spendCoins;
  if(typeof originalSpendCoins==='function'){
    window.spendCoins=async function(amount,item){
      const before=userCoins;
      const ok=await originalSpendCoins(amount,item);
      if(ok && currentUser && userCoins<before){
        db.collection('users').doc(currentUser.uid).collection('coinLedger').add({
          type:'spend',amount:Number(amount),item:String(item||''),createdAt:firebase.firestore.FieldValue.serverTimestamp()
        }).catch(()=>{});
      }
      return ok;
    };
  }

  // Profile polish without changing the existing visual language.
  const oldRenderProfile=window.renderProfile || renderProfile;
  if(typeof oldRenderProfile==='function'){
    window.renderProfile=function(){
      oldRenderProfile();
      const content=document.getElementById('profileContent');
      if(!content || !currentUser) return;
      const head=content.querySelector('.profile-header');
      if(head && !content.querySelector('.profile-banner')){
        const banner=document.createElement('div');
        banner.className='profile-banner';
        head.parentNode.insertBefore(banner,head);
      }
    };
  }

  // Preserve all existing image URLs; optimize only newly selected uploads.
  async function compressImageForUpload(file,maxSide=1600,quality=.84){
    if(!file || !file.type.startsWith('image/')) return file;
    if(file.size<900*1024 && file.type!=='image/gif') return file;
    if(file.type==='image/gif' || file.type==='image/svg+xml') return file;
    return await new Promise(resolve=>{
      const img=new Image();
      const url=URL.createObjectURL(file);
      img.onload=()=>{
        try{
          const scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
          const canvas=document.createElement('canvas');
          canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
          canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
          const ctx=canvas.getContext('2d',{alpha:true});
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          canvas.toBlob(blob=>{
            URL.revokeObjectURL(url);
            if(blob && blob.size<file.size){
              resolve(new File([blob],(file.name||'image')+'.webp',{type:'image/webp',lastModified:Date.now()}));
            }else resolve(file);
          },'image/webp',quality);
        }catch(_){URL.revokeObjectURL(url);resolve(file);}
      };
      img.onerror=()=>{URL.revokeObjectURL(url);resolve(file)};
      img.src=url;
    });
  }

  const originalUpload=window.uploadCommunityImage || uploadCommunityImage;
  if(typeof originalUpload==='function'){
    window.uploadCommunityImage=async function(file,kind){
      const optimized=await compressImageForUpload(file);
      return originalUpload(optimized,kind);
    };
  }

  // Admin coin controls + ledger, kept inside the existing admin panel.
  window.adminGrantCoins=async function(uid,delta){
    if(!currentUser || !isAdmin(currentUser) || !uid) return;
    delta=parseInt(delta,10);
    if(!Number.isFinite(delta)||delta===0) return;
    const ref=db.collection('users').doc(uid);
    await ref.set({
      coins:firebase.firestore.FieldValue.increment(delta),
      totalCoinsEarned:delta>0?firebase.firestore.FieldValue.increment(delta):firebase.firestore.FieldValue.increment(0)
    },{merge:true});
    await ref.collection('coinLedger').add({type:delta>0?'admin_grant':'admin_deduct',amount:Math.abs(delta),delta,by:currentUser.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    showToast((delta>0?'🪙 +':'🪙 ')+delta+' coin uygulandı.');
    if(uid===currentUser.uid){userCoins=Math.max(0,userCoins+delta);updateCoinDisplay();}
    renderAdminPanel();
  };
    window.ScriptHub = {
        get currentUser(){ return currentUser; },
        get inventory(){ return inventory; },
        set inventory(v){ inventory=v; },
        get userCoins(){ return userCoins; },
        get db(){ return db; },
        get storage(){ return storage; },
        get IMG(){ return IMG; },
        isAdmin,
        escapeHtml,
        showToast,
        spendCoins,
        renderProfile,
        renderShop,
        loadCommunityGames,
        get communityGames(){ return communityGames; },
        render
    };

})();



/* ===== separated inline block ===== */



(function(){
  'use strict';
  const DEFAULT_IMG = "data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Crect width=\"100\" height=\"100\" fill=\"%231a1a3a\"/%3E%3Ctext x=\"50\" y=\"58\" font-size=\"42\" text-anchor=\"middle\" fill=\"%23a78bfa\"%3E⚡%3C/text%3E%3C/svg%3E";

  function repairImages(root=document){
    root.querySelectorAll && root.querySelectorAll('img').forEach(img=>{
      if(img.dataset.shRepairBound) return;
      img.dataset.shRepairBound='1';
      img.loading=img.loading||'lazy';
      img.decoding=img.decoding||'async';
      img.addEventListener('error',function(){
        if(this.dataset.shFallback) return;
        this.dataset.shFallback='1';
        this.src=DEFAULT_IMG;
      },{once:true});
    });
  }
  repairImages();
  new MutationObserver(()=>repairImages()).observe(document.documentElement,{childList:true,subtree:true});

  // Close menus/modals reliably on Escape and allow background scrolling again.
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape') return;
    const open=[...document.querySelectorAll('.modal-overlay.open')].pop();
    if(open){
      const close=open.querySelector('.modal-close');
      if(close) close.click();
      else open.classList.remove('open');
      if(!document.querySelector('.modal-overlay.open')) document.body.style.overflow='';
    }
  },{capture:true});

  // Prevent accidental form resubmits with Enter in single-line fields.
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter') return;
    const el=e.target;
    if(el && el.matches('input[type="text"],input[type="url"],input[type="number"]') && el.closest('.modal-card')){
      const form=el.closest('form');
      if(form && !el.closest('.comment-input')) e.stopPropagation();
    }
  });

  // Make external links safer without touching existing URLs.
  document.querySelectorAll('a[target="_blank"]').forEach(a=>{
    const rel=(a.getAttribute('rel')||'').split(/\s+/).filter(Boolean);
    if(!rel.includes('noopener')) rel.push('noopener');
    if(!rel.includes('noreferrer')) rel.push('noreferrer');
    a.setAttribute('rel',rel.join(' '));
  });

  // Offline/online status gives the user a useful signal without changing the design.
  function networkStatus(){
    let el=document.getElementById('shNetworkStatus');
    if(!el){
      el=document.createElement('div'); el.id='shNetworkStatus';
      el.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:10000000;padding:.45rem .8rem;border-radius:999px;font-size:.7rem;display:none;border:1px solid var(--border-color);background:var(--bg-modal);color:var(--text-secondary);backdrop-filter:blur(16px)';
      document.body.appendChild(el);
    }
    el.textContent=navigator.onLine?'':'📡 İnternet bağlantısı yok — kayıtlı içerikler kullanılabilir.';
    el.style.display=navigator.onLine?'none':'block';
  }
  window.addEventListener('online',networkStatus);
  window.addEventListener('offline',networkStatus);
  networkStatus();
})();



/* ===== separated inline block ===== */


(function(){
  'use strict';
  const SH=window.ScriptHub;
  if(!SH) return;

  const DEFAULT_COSMETICS=[
    {id:'frame_gold',name:'Royal Gold',price:150,type:'frame',value:'gold',icon:'👑',rarity:'Rare',desc:'Altın ışıklı premium avatar çerçevesi.',preview:'gold'},
    {id:'frame_fire',name:'Inferno',price:650,type:'frame',value:'fire',icon:'🔥',rarity:'Legendary',desc:'Ateş ve kor temalı çerçeve.',preview:'fire'},
    {id:'frame_ice',name:'Frostbite',price:600,type:'frame',value:'ice',icon:'❄️',rarity:'Legendary',desc:'Buz kristali ve soğuk neon çerçeve.',preview:'ice'},
    {id:'name_rainbow',name:'Prism Name',price:500,type:'nameColor',value:'rainbow',icon:'🌈',rarity:'Epic',desc:'Renkleri akan gökkuşağı isim efekti.',preview:'rainbow'},
    {id:'bg_galaxy',name:'Galaxy Rift',price:600,type:'background',value:'galaxy',icon:'🌌',rarity:'Epic',desc:'Derin uzay ve nebula temalı profil arka planı.',preview:'galaxy'}
  ];
  const bgMap={
    galaxy:'radial-gradient(circle at 20% 30%,#7c3aed55,transparent 30%),radial-gradient(circle at 80% 70%,#2563eb55,transparent 30%),linear-gradient(135deg,#08051b,#17104a,#020617)',
    aurora:'radial-gradient(circle at 30% 60%,#22c55e55,transparent 28%),radial-gradient(circle at 70% 30%,#06b6d455,transparent 30%),linear-gradient(135deg,#03151b,#10133a,#160b31)',
    cyber:'linear-gradient(135deg,#080014,#26104d 45%,#071b2b)'
  };
  DEFAULT_COSMETICS.push({id:'script_frame_neon',name:'Neon Script',price:300,type:'scriptFrame',value:'neon',icon:'⚡',rarity:'Epic',desc:'Script kartlarına neon çerçeve.'},{id:'script_frame_gold',name:'Royal Script',price:350,type:'scriptFrame',value:'gold',icon:'👑',rarity:'Legendary',desc:'Script kartlarına altın çerçeve.'});
  let catalog=[...DEFAULT_COSMETICS];

  const owned=id=>Array.isArray(SH.inventory)&&SH.inventory.some(x=>x.id===id);
  const item=id=>catalog.find(x=>x.id===id);
  const active=type=>(SH.inventory||[]).find(x=>x.type===type&&x.active);

  function mediaHTML(x){
    if(!x.mediaUrl)return '';
    if(String(x.mediaType||'').startsWith('video/'))
      return '<video class="cosmetic-media" src="'+SH.escapeHtml(x.mediaUrl)+'" autoplay muted loop playsinline></video>';
    return '<img class="cosmetic-media" src="'+SH.escapeHtml(x.mediaUrl)+'" alt="" onerror="this.remove()">';
  }

  function card(x){
    const have=owned(x.id), on=active(x.type)?.id===x.id;
    const bg=x.type==='background'?(x.mediaUrl?'background-image:url(&quot;'+SH.escapeHtml(x.mediaUrl)+'&quot;)':'background:'+((bgMap[x.value])||'')):'';
    return '<div class="cosmetic-card"><div class="cosmetic-preview preview-'+SH.escapeHtml(x.preview||x.value||'default')+'" style="'+bg+'">'+mediaHTML(x)+'<img class="cosmetic-avatar" src="'+(SH.currentUser?.photoURL||SH.IMG.users)+'"><div class="cosmetic-name">'+SH.escapeHtml(SH.currentUser?.displayName||'ScriptHub')+'</div></div><div class="cosmetic-card-title"><strong>'+(x.icon||'✨')+' '+SH.escapeHtml(x.name)+'</strong><span class="rarity">'+SH.escapeHtml(x.rarity||'Common')+'</span></div><div class="cosmetic-desc">'+SH.escapeHtml(x.desc||'Özel profil kozmetiği')+'</div><div class="cosmetic-meta"><span class="cosmetic-price">'+(have?'Sahipsin':'🪙 '+Number(x.price||0))+'</span>'+(have?'<button class="buy-btn '+(on?'owned':'')+'" onclick="toggleCosmetic(\''+x.id+'\')">'+(on?'✅ Aktif':'🎨 Kuşan')+'</button>':'<button class="buy-btn" onclick="purchaseCosmetic(\''+x.id+'\','+Number(x.price||0)+')">🛒 Al</button>')+'</div></div>';
  }

  async function loadCatalog(){
    try{
      const snap=await SH.db.collection('cosmetics').where('enabled','==',true).get();
      const dynamic=[]; snap.forEach(d=>dynamic.push({id:d.id,...d.data()}));
      catalog=[...DEFAULT_COSMETICS,...dynamic.filter(d=>!DEFAULT_COSMETICS.some(x=>x.id===d.id))];
    }catch(e){ catalog=[...DEFAULT_COSMETICS]; }
    return catalog;
  }

  window.purchaseCosmetic=async function(id){
    const x=item(id);
    if(!SH.currentUser){SH.showToast('❌ Giriş yapın!');return;}
    if(!x||owned(id)){SH.showToast('❌ Kozmetik zaten sende veya bulunamadı.');return;}
    const price=Math.max(1,Number(x.price||0));
    if(await SH.spendCoins(price,x.name)){
      SH.inventory=[...(SH.inventory||[]),{...x,active:false}];
      await SH.db.collection('users').doc(SH.currentUser.uid).update({inventory:SH.inventory});
      SH.showToast('✨ '+x.name+' envanterine eklendi!');
      render();
    }
    renderCosmeticShop();
  };

  window.toggleCosmetic=async function(id){
    if(!SH.currentUser)return;
    const target=(SH.inventory||[]).find(x=>x.id===id);
    if(!target)return;
    SH.inventory=(SH.inventory||[]).map(x=>x.type===target.type?{...x,active:x.id===id?!target.active:false}:x);
    await SH.db.collection('users').doc(SH.currentUser.uid).update({inventory:SH.inventory});
    SH.showToast((target.active?'↩️ ':'✨ ')+target.name+(target.active?' çıkarıldı!':' kuşanıldı!'));
    renderCosmeticShop();
    SH.renderProfile();
  };

  async function renderCosmeticShop(){
    const c=document.getElementById('shopContent'); if(!c)return;
    const all=await loadCatalog();
    c.innerHTML='<div class="cosmetic-studio-head"><div><strong>✨ Profil Stüdyosu</strong><div>Profilini çerçeve, isim efekti ve arka planla kişiselleştir.</div></div><span>🪙 '+SH.userCoins+'</span></div><div class="cosmetic-grid">'+all.map(card).join('')+'</div>';
  }
  window.renderCosmeticShop=renderCosmeticShop;

  const oldSwitch=window.switchShopTab;
  window.switchShopTab=function(tab){
    if(tab==='cosmetics'){
      document.querySelectorAll('.shop-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.shopTab===tab));
      renderCosmeticShop();
      return;
    }
    if(typeof oldSwitch==='function')oldSwitch(tab);
  };

  function decorateProfile(){
    const content=document.getElementById('profileContent');
    if(!content||!SH.currentUser)return;
    content.querySelector('.profile-cosmetic-card')?.remove();
    const frame=active('frame'),name=active('nameColor'),bg=active('background');
    const badges=(SH.inventory||[]).filter(x=>x.type==='badge'&&x.active);
    if(!frame&&!name&&!bg&&!badges.length)return;
    const cardEl=document.createElement('div'); cardEl.className='profile-cosmetic-card';
    if(bg)cardEl.style.background=bg.mediaUrl?'url("'+bg.mediaUrl.replace(/"/g,'&quot;')+'") center/cover':(bgMap[bg.value]||bg.value);
    const border=frame?.value==='gold'?'#fbbf24':frame?.value==='fire'?'#fb7185':frame?.value==='ice'?'#67e8f9':'#a78bfa';
    cardEl.innerHTML='<div class="profile-cosmetic-shade"></div><div class="profile-cosmetic-content"><img class="profile-cosmetic-avatar" style="border-color:'+border+'" src="'+(SH.currentUser.photoURL||SH.IMG.users)+'"><div><div class="profile-cosmetic-name">'+SH.escapeHtml(SH.currentUser.displayName||'Kullanıcı')+'</div><div class="profile-cosmetic-badges">'+badges.map(x=>'<span class="profile-cosmetic-badge">'+(x.icon||'✨')+' '+SH.escapeHtml(x.name)+'</span>').join('')+'</div></div></div>';
    const n=cardEl.querySelector('.profile-cosmetic-name');
    if(name?.value==='rainbow'){n.style.background='linear-gradient(90deg,#f87171,#fbbf24,#4ade80,#60a5fa,#c084fc)';n.style.webkitBackgroundClip='text';n.style.color='transparent';}
    else if(name?.value)n.style.color=name.value;
    content.insertBefore(cardEl,content.firstChild);
  }
  window.decorateScriptHubProfile=decorateProfile;

  function injectAdmin(){
    if(!SH.currentUser||!SH.isAdmin(SH.currentUser))return;
    const panel=document.getElementById('adminContent'); if(!panel||panel.querySelector('#cosmeticAdminBox'))return;
    const box=document.createElement('div'); box.id='cosmeticAdminBox'; box.className='cosmetic-admin-box';
    box.innerHTML='<div class="cosmetic-admin-title"><div><strong>✨ Kozmetik Yönetimi</strong><small>Canva\'dan hazırladığın PNG / GIF / MP4 / WebM dosyalarını buradan ekleyebilirsin.</small></div><span>👑 ADMIN</span></div><div class="cosmetic-admin-actions"><button class="admin-tab" id="addCosmeticBtn">➕ Bilgiyle Ekle</button><button class="admin-tab" id="uploadCosmeticBtn">🖼️ Görsel / GIF / Video Yükle</button></div><input id="cosmeticMediaFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm" hidden><div id="cosmeticAdminList" class="cosmetic-admin-list"></div>';
    panel.appendChild(box);
    box.querySelector('#uploadCosmeticBtn').onclick=()=>box.querySelector('#cosmeticMediaFile').click();
    box.querySelector('#cosmeticMediaFile').onchange=async e=>{
      const file=e.target.files?.[0]; if(!file)return;
      if(file.size>8*1024*1024){SH.showToast('❌ Dosya 8 MB altında olmalı.');e.target.value='';return;}
      const ok=/^image\/(png|jpeg|webp|gif)$/.test(file.type)||/^video\/(mp4|webm)$/.test(file.type);
      if(!ok){SH.showToast('❌ PNG/JPG/WebP/GIF/MP4/WebM kullan.');e.target.value='';return;}
      const name=prompt('Kozmetik adı:',file.name.replace(/\.[^.]+$/,'').slice(0,40)); if(!name)return;
      const type=prompt('Tip: frame / nameColor / background / badge','background'); if(!['frame','nameColor','background','badge'].includes(type))return;
      const price=Math.max(1,parseInt(prompt('Coin fiyatı:','500'),10)||500);
      const rarity=prompt('Nadirlik: Common / Rare / Epic / Legendary','Epic')||'Epic';
      const desc=prompt('Açıklama:','Canva ile hazırlanan özel kozmetik')||'Özel kozmetik';
      const id='media_'+Date.now();
      try{
        SH.showToast('⏳ Yükleniyor...');
        const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]/g,'-');
        const ref=SH.storage.ref('cosmetic-media/'+SH.currentUser.uid+'/'+id+'-'+safe);
        const snap=await ref.put(file,{contentType:file.type});
        const mediaUrl=await snap.ref.getDownloadURL();
        await SH.db.collection('cosmetics').doc(id).set({id,name,price,type,icon:'✨',rarity,desc,enabled:true,mediaUrl,mediaType:file.type,createdBy:SH.currentUser.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        SH.showToast('✅ Kozmetik mağazaya eklendi!');
        e.target.value=''; renderCosmeticAdminList(); renderCosmeticShop();
      }catch(err){console.error(err);SH.showToast('❌ Kozmetik yüklenemedi.');}
    };
    box.querySelector('#addCosmeticBtn').onclick=async()=>{
      const name=prompt('Kozmetik adı:'); if(!name)return;
      const price=Math.max(1,parseInt(prompt('Coin fiyatı:','500'),10)||500);
      const type=prompt('Tip: frame / nameColor / background / badge','background'); if(!['frame','nameColor','background','badge'].includes(type))return;
      const value=prompt('Değer (ör. galaxy veya #a78bfa):','galaxy')||'galaxy';
      const id='custom_'+Date.now();
      await SH.db.collection('cosmetics').doc(id).set({id,name,price,type,value,icon:'✨',rarity:'Epic',desc:'Özel kozmetik',enabled:true,createdBy:SH.currentUser.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
      SH.showToast('✅ Kozmetik eklendi!'); renderCosmeticAdminList();
    };
    async function renderCosmeticAdminList(){
      const list=box.querySelector('#cosmeticAdminList');
      try{
        const snap=await SH.db.collection('cosmetics').orderBy('name').limit(100).get();
        list.innerHTML=[...snap.docs].map(d=>{const x=d.data();return '<div class="cosmetic-admin-row"><span>'+(x.icon||'✨')+' '+SH.escapeHtml(x.name)+' · 🪙 '+Number(x.price||0)+(x.mediaUrl?' · 🖼️':'')+'</span><button class="delete-btn" onclick="adminToggleCosmetic(\''+d.id+'\')">'+(x.enabled===false?'Aç':'Kapat')+'</button></div>';}).join('')||'<span>Henüz eklenmiş özel kozmetik yok.</span>';
      }catch(err){list.innerHTML='<span>Kozmetik listesi yüklenemedi.</span>';}
    }
    renderCosmeticAdminList();
  }
  window.adminToggleCosmetic=async function(id){
    if(!SH.currentUser||!SH.isAdmin(SH.currentUser))return;
    const ref=SH.db.collection('cosmetics').doc(id), snap=await ref.get();
    await ref.update({enabled:snap.data()?.enabled===false});
    SH.showToast('✅ Kozmetik durumu güncellendi.');
    injectAdmin();
  };

  const obs=new MutationObserver(()=>{
    if(document.getElementById('adminContent'))injectAdmin();
    if(document.getElementById('profileModal')?.classList.contains('open'))decorateProfile();
  });
  obs.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('load',()=>setTimeout(()=>{injectAdmin();decorateProfile();},500));
})();


/* ===== separated inline block ===== */



(function(){
  function runShortcutAction(){
    const p=new URLSearchParams(location.search), action=p.get('action');
    if(!action)return;
    const go=()=>{
      if(action==='add-script') document.getElementById('addScriptBtn')?.click();
      else if(action==='profile') window.openProfileModal?.();
      else if(action==='shop') window.openCoinShop?.();
      if(action) history.replaceState({},'',location.pathname+location.hash);
    };
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(go,700),{once:true});
    else setTimeout(go,700);
  }
  runShortcutAction();

  // Profile avatar upload: uses the existing profile-media Storage namespace.
  const profileObs=new MutationObserver(()=>{
    const form=document.getElementById('profileEditForm');
    if(!form||form.querySelector('#profileAvatarFile'))return;
    const wrap=document.createElement('div');
    wrap.className='form-group';
    wrap.innerHTML='<label>📤 Avatar Dosyası</label><input type="file" id="profileAvatarFile" accept="image/*"><div id="profileUploadStatus" style="font-size:.6rem;color:var(--text-muted);margin-top:.3rem">JPG/PNG/WebP · maksimum 8 MB</div>';
    const url=document.getElementById('editAvatarUrl')?.parentElement;
    (url||form).after(wrap);
    const file=form.querySelector('#profileAvatarFile');
    file.addEventListener('change',async()=>{
      const f=file.files?.[0]; if(!f||!currentUser)return;
      if(!f.type.startsWith('image/')||f.size>8*1024*1024){showToast('❌ Görsel 8 MB altında olmalı.');return;}
      const st=document.getElementById('profileUploadStatus'); st.textContent='⏳ Yükleniyor...';
      try{
        const ref=storage.ref('profile-media/'+currentUser.uid+'/avatar-'+Date.now());
        const snap=await ref.put(f,{contentType:f.type});
        const url=await snap.ref.getDownloadURL();
        document.getElementById('editAvatarUrl').value=url;
        document.getElementById('editAvatar').src=url;
        st.textContent='✅ Avatar yüklendi. Kaydetmeyi unutma.';
      }catch(e){st.textContent='❌ Yükleme başarısız.';showToast('❌ Avatar yüklenemedi.');}
    });
  });
  profileObs.observe(document.body,{childList:true,subtree:true});
})();