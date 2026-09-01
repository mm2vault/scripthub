// ==========================================
// FIREBASE YAPILANDIRMA
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyB8xU0CUXkzl1AbOBusUxr3J77TU5d6Mlg",
    authDomain: "scripthub-b7b7b.firebaseapp.com",
    projectId: "scripthub-b7b7b",
    storageBucket: "scripthub-b7b7b.firebasestorage.app",
    messagingSenderId: "962415554423",
    appId: "1:962415554423:web:9035ce9e4035d6ab6c3b72",
    measurementId: "G-ZNQK09DBRQ"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Global değişkenler
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Admin UID
const ADMIN_UID = 'WAtZhXqj2KUEib0RaRXMTOAgYpc2';

console.log('🔥 Firebase başarıyla başlatıldı!');
