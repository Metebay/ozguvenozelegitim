import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, doc, deleteDoc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, signInAnonymously, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// FIREBASE AYARLARI
const firebaseConfig = {
    apiKey: "AIzaSyBx7su21qKLnYZ89OOjPm84UC3u63c6iUs",
    authDomain: "potfolyo-e16e4.firebaseapp.com",
    projectId: "potfolyo-e16e4",
    storageBucket: "potfolyo-e16e4.firebasestorage.app",
    messagingSenderId: "778216462965",
    appId: "1:778216462965:web:69c9ad6ea0d22481b8b63c",
    measurementId: "G-WV7WXHF7P0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = 'ozguven-web';

// --- HİZMET VERİLERİ (STATİK VERİTABANI) ---
window.servicesData = [
    {
        id: 'fizik-tedavi',
        title: 'Fizik Tedavi ve Rehabilitasyon',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        description: 'Serebral Palsi, Spina Bifida, kas hastalıkları ve ortopedik rahatsızlıkları olan bireylerin fonksiyonel kapasitelerini artırmak için uygulanan kapsamlı bir programdır. Uzman fizyoterapistlerimiz eşliğinde, kişiye özel egzersiz programları, manuel terapi teknikleri ve elektroterapi uygulamaları ile hastalarımızın yaşam kalitesini yükseltmeyi hedefliyoruz.',
        features: ['Bireysel Egzersiz Programları', 'Elektroterapi Uygulamaları', 'Kinesiotaping Bantlama', 'Uzay Terapi Desteği']
    },
    {
        id: 'duyu-butunleme',
        title: 'Duyu Bütünleme Terapisi',
        image: 'https://images.unsplash.com/photo-1596464716127-f9a865e0cb31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        description: 'Çocuğun vücudunu ve çevresini etkili bir şekilde kullanmasını sağlayan nörolojik bir süreçtir. Duyusal işlemleme bozukluğu yaşayan çocuklarda; denge, koordinasyon, dikkat ve vücut farkındalığını geliştirmek amacıyla özel ekipmanlarla donatılmış salonlarımızda uygulanır.',
        features: ['Duyusal İşlemleme Değerlendirmesi', 'Vestibüler Sistem Çalışmaları', 'Propriyoseptif Gelişim', 'Taktil Uyaran Çalışmaları']
    },
    {
        id: 'uzay-terapi',
        title: 'Uzay Terapi (Spider Cage)',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        description: 'Özel bir kafes sistemi içinde, elastik bantlar ve kemerler kullanılarak yerçekimine karşı vücut direncini artıran modern bir fizik tedavi yöntemidir. Denge, koordinasyon ve kas kuvvetini geliştirmede oldukça etkilidir.',
        features: ['Denge ve Koordinasyon Gelişimi', 'Kas Kuvvetlendirme', 'Patolojik Reflekslerin Azaltılması', 'Bağımsız Yürüme Desteği']
    },
    {
        id: 'dil-konusma',
        title: 'Dil ve Konuşma Terapisi',
        image: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        description: 'Konuşma sesi bozuklukları, kekemelik, gecikmiş dil ve konuşma, afazi gibi iletişim problemlerinin değerlendirilmesi ve sağaltımı sürecidir. Uzman terapistlerimiz, bireyin iletişim becerilerini günlük hayatta en etkili şekilde kullanabilmesini hedefler.',
        features: ['Artikülasyon Terapisi', 'Kekemelik Terapisi', 'Gecikmiş Konuşma Müdahalesi', 'Alternatif İletişim Yöntemleri']
    },
    {
        id: 'ozel-ogrenme',
        title: 'Özel Öğrenme Güçlüğü',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        description: 'Disleksi (okuma), Disgrafi (yazma) ve Diskalkuli (matematik) gibi alanlarda yaşanan güçlüklerin giderilmesine yönelik akademik destek programıdır. Bireyselleştirilmiş eğitim planları ile çocuğun akademik başarısı ve özgüveni desteklenir.',
        features: ['Okuma-Yazma Desteği', 'Matematik Becerileri', 'Dikkat ve Hafıza Çalışmaları', 'Organizasyon Becerileri']
    },
    {
        id: 'psikolojik',
        title: 'Psikolojik Danışmanlık',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        description: 'Özel gereksinimli bireylerin ve ailelerinin yaşadığı duygusal ve davranışsal süreçlere destek olmak amacıyla sunulan hizmettir. Aile eğitimi, davranış problemleriyle baş etme ve sosyal uyum çalışmaları yürütülür.',
        features: ['Aile Danışmanlığı', 'Oyun Terapisi', 'Davranış Yönetimi', 'Sosyal Beceri Eğitimi']
    }
];

// Hizmet Detayına Gitme Fonksiyonu
window.goToServiceDetail = (id) => {
    const service = window.servicesData.find(s => s.id === id);
    if (service) {
        localStorage.setItem('currentService', JSON.stringify(service));
        window.location.href = 'egitim-detay.html';
    } else {
        alert("Hizmet detayına ulaşılamadı.");
    }
};

window.blogData = [];

// --- AUTH & ADMIN ---
window.handleAdminLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    const errorMsg = document.getElementById('login-error');
    const btn = e.target.querySelector('button');

    try {
        btn.innerText = "Giriş Yapılıyor...";
        btn.disabled = true;
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        console.error("Giriş Hatası:", error);
        errorMsg.classList.remove('hidden');
        errorMsg.innerText = "Hatalı E-posta veya Şifre!";
        setTimeout(() => errorMsg.classList.add('hidden'), 3000);
        btn.innerText = "Giriş Yap";
        btn.disabled = false;
    }
};

window.logoutAdmin = async () => {
    if(confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        await signOut(auth);
        window.location.reload();
    }
};

const initAuthListener = () => {
    const loginModal = document.getElementById('login-modal');
    const adminContent = document.getElementById('admin-content');

    if (loginModal && adminContent) {
        onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) {
                loginModal.style.display = 'none';
                adminContent.classList.remove('hidden-content');
                adminContent.classList.add('flex');
            } else {
                loginModal.style.display = 'flex';
                adminContent.classList.add('hidden-content');
                adminContent.classList.remove('flex');
            }
        });
    }
};

// --- HEADER & FOOTER RENDER ---
const renderLayout = () => {
    const headerEl = document.getElementById('main-header');
    if (headerEl) {
        headerEl.innerHTML = `
        <!-- Top Bar (Gradient Canlılık) -->
        <div class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 text-[11px] font-bold tracking-wide shadow-md relative z-20">
            <div class="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
                <div class="flex items-center gap-6">
                    <a href="tel:02125550000" class="flex items-center gap-2 hover:text-yellow-300 transition-colors duration-300 group">
                        <i data-lucide="phone" class="w-3.5 h-3.5 text-yellow-300 group-hover:scale-110 transition-transform"></i> 
                        <span>0 (212) 555 00 00</span>
                    </a>
                    <a href="mailto:bilgi@ozguvenegitim.com" class="flex items-center gap-2 hover:text-yellow-300 transition-colors duration-300 group">
                        <i data-lucide="mail" class="w-3.5 h-3.5 text-yellow-300 group-hover:scale-110 transition-transform"></i> 
                        <span>bilgi@ozguvenegitim.com</span>
                    </a>
                </div>
                <div class="flex items-center gap-6">
                    <span class="hidden md:flex items-center gap-1.5 text-orange-100"><i data-lucide="clock" class="w-3.5 h-3.5 text-yellow-300"></i> Pzt-Cmt: 09:00 - 18:00</span>
                    <div class="flex gap-4 border-l border-white/20 pl-6">
                        <a href="#" class="hover:text-yellow-300 hover:scale-110 transition-all duration-300"><i data-lucide="facebook" class="w-3.5 h-3.5"></i></a>
                        <a href="#" class="hover:text-yellow-300 hover:scale-110 transition-all duration-300"><i data-lucide="instagram" class="w-3.5 h-3.5"></i></a>
                        <a href="#" class="hover:text-yellow-300 hover:scale-110 transition-all duration-300"><i data-lucide="twitter" class="w-3.5 h-3.5"></i></a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Navbar (Beyaz & Ferah) -->
        <div class="bg-white/95 backdrop-blur-md shadow-lg shadow-gray-100 border-b border-gray-100 transition-all duration-300 relative z-50">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <a href="index.html" class="flex items-center gap-3 group">
                    <img src="özgüvenweb.jpg" alt="Özgüven Logo" class="h-14 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300">
                </a>

                <nav class="hidden lg:flex items-center gap-2">
                    <a href="index.html" class="relative group px-5 py-3 font-extrabold text-sm text-gray-700 hover:text-orange-600 transition-colors uppercase tracking-wide rounded-xl hover:bg-orange-50">Ana Sayfa</a>
                    <a href="kurumsal.html" class="relative group px-5 py-3 font-extrabold text-sm text-gray-700 hover:text-orange-600 transition-colors uppercase tracking-wide rounded-xl hover:bg-orange-50">Kurumsal</a>
                    <a href="blog.html" class="relative group px-5 py-3 font-extrabold text-sm text-gray-700 hover:text-orange-600 transition-colors uppercase tracking-wide rounded-xl hover:bg-orange-50">Blog</a>
                    <a href="iletisim.html" class="relative group px-5 py-3 font-extrabold text-sm text-gray-700 hover:text-orange-600 transition-colors uppercase tracking-wide rounded-xl hover:bg-orange-50">İletişim</a>
                </nav>

                <div class="flex items-center gap-4">
                    <a href="iletisim.html" class="hidden md:flex bg-gray-900 hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-xs transition-all hover:-translate-y-0.5 items-center gap-2 uppercase tracking-wider group">
                        <i data-lucide="calendar-check" class="w-4 h-4 text-yellow-400 group-hover:text-white transition-colors"></i> Randevu Al
                    </a>
                    <a href="admin.html" class="text-gray-400 hover:text-orange-600 transition-all p-2.5 rounded-full hover:bg-orange-50" title="Yönetici Paneli">
                        <i data-lucide="lock" class="w-5 h-5"></i>
                    </a>
                    <button class="lg:hidden text-gray-800 p-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
                        <i data-lucide="menu" class="w-8 h-8"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-2xl p-0 flex flex-col z-40 animate-in slide-in-from-top-2 duration-200">
            <a href="index.html" class="p-5 border-b border-gray-50 font-bold text-sm text-gray-800 hover:bg-orange-50 hover:text-orange-700 hover:pl-8 transition-all uppercase flex justify-between group">
                Ana Sayfa <i data-lucide="chevron-right" class="w-4 h-4 text-gray-300 group-hover:text-orange-500"></i>
            </a>
            <a href="kurumsal.html" class="p-5 border-b border-gray-50 font-bold text-sm text-gray-800 hover:bg-orange-50 hover:text-orange-700 hover:pl-8 transition-all uppercase flex justify-between group">
                Kurumsal <i data-lucide="chevron-right" class="w-4 h-4 text-gray-300 group-hover:text-orange-500"></i>
            </a>
            <a href="blog.html" class="p-5 border-b border-gray-50 font-bold text-sm text-gray-800 hover:bg-orange-50 hover:text-orange-700 hover:pl-8 transition-all uppercase flex justify-between group">
                Blog <i data-lucide="chevron-right" class="w-4 h-4 text-gray-300 group-hover:text-orange-500"></i>
            </a>
            <a href="iletisim.html" class="p-5 border-b border-gray-50 font-bold text-sm text-gray-800 hover:bg-orange-50 hover:text-orange-700 hover:pl-8 transition-all uppercase flex justify-between group">
                İletişim <i data-lucide="chevron-right" class="w-4 h-4 text-gray-300 group-hover:text-orange-500"></i>
            </a>
        </div>
        `;
    }

    const footerEl = document.getElementById('main-footer');
    if (footerEl) {
        footerEl.innerHTML = `
        <div class="bg-gray-900 text-gray-400 pt-20 pb-10 border-t-4 border-orange-600 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <i data-lucide="shield-check" class="w-64 h-64 text-white"></i>
            </div>

            <div class="container mx-auto px-4 relative z-10">
                <div class="grid md:grid-cols-4 gap-12 mb-16 border-b border-gray-800 pb-12">
                    <div class="md:col-span-1">
                        <div class="mb-6 bg-white p-3 rounded-xl w-fit inline-block">
                            <img src="özgüvenweb.jpg" alt="Özgüven Logo" class="h-12 w-auto object-contain">
                        </div>
                        <p class="text-sm leading-7 mb-8 text-gray-400">
                            Özel eğitimde güvenin adresi. Bilimsel metotlar, uzman kadro ve sevgi dolu bir yaklaşımla, her bireyin potansiyelini en üst düzeye çıkarıyoruz.
                        </p>
                        <div class="flex gap-3">
                            <a href="#" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all hover:-translate-y-1"><i data-lucide="facebook" class="w-4 h-4"></i></a>
                            <a href="#" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all hover:-translate-y-1"><i data-lucide="instagram" class="w-4 h-4"></i></a>
                            <a href="#" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all hover:-translate-y-1"><i data-lucide="twitter" class="w-4 h-4"></i></a>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-3">
                            <span class="w-2 h-2 bg-orange-600 rounded-full inline-block"></span> Hızlı Erişim
                        </h3>
                        <ul class="space-y-3 text-sm">
                            <li><a href="index.html" class="hover:text-orange-500 hover:pl-2 transition-all flex items-center gap-2 group"><i data-lucide="chevron-right" class="w-3 h-3 text-gray-600 group-hover:text-orange-500 transition-colors"></i> Ana Sayfa</a></li>
                            <li><a href="kurumsal.html" class="hover:text-orange-500 hover:pl-2 transition-all flex items-center gap-2 group"><i data-lucide="chevron-right" class="w-3 h-3 text-gray-600 group-hover:text-orange-500 transition-colors"></i> Hakkımızda</a></li>
                            <li><a href="blog.html" class="hover:text-orange-500 hover:pl-2 transition-all flex items-center gap-2 group"><i data-lucide="chevron-right" class="w-3 h-3 text-gray-600 group-hover:text-orange-500 transition-colors"></i> Blog</a></li>
                            <li><a href="iletisim.html" class="hover:text-orange-500 hover:pl-2 transition-all flex items-center gap-2 group"><i data-lucide="chevron-right" class="w-3 h-3 text-gray-600 group-hover:text-orange-500 transition-colors"></i> İletişim</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-3">
                            <span class="w-2 h-2 bg-orange-600 rounded-full inline-block"></span> Hizmetlerimiz
                        </h3>
                        <ul class="space-y-3 text-sm">
                            <li><a href="#" onclick="goToServiceDetail('fizik-tedavi')" class="hover:text-white transition cursor-pointer">Fizik Tedavi</a></li>
                            <li><a href="#" onclick="goToServiceDetail('duyu-butunleme')" class="hover:text-white transition cursor-pointer">Duyu Bütünleme</a></li>
                            <li><a href="#" onclick="goToServiceDetail('dil-konusma')" class="hover:text-white transition cursor-pointer">Dil ve Konuşma</a></li>
                            <li><a href="#" onclick="goToServiceDetail('uzay-terapi')" class="hover:text-white transition cursor-pointer">Uzay Terapi</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-3">
                            <span class="w-2 h-2 bg-orange-600 rounded-full inline-block"></span> Bize Ulaşın
                        </h3>
                        <div class="space-y-5 text-sm">
                            <div class="flex gap-4 group">
                                <div class="bg-gray-800 p-2.5 rounded-lg text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <i data-lucide="map-pin" class="w-4 h-4"></i>
                                </div>
                                <span class="text-gray-400 group-hover:text-white transition-colors leading-tight">Merkez Mah. Eğitim Cad.<br>No:1 Bağcılar / İstanbul</span>
                            </div>
                            <div class="flex gap-4 group">
                                <div class="bg-gray-800 p-2.5 rounded-lg text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <i data-lucide="phone" class="w-4 h-4"></i>
                                </div>
                                <a href="tel:02125550000" class="text-gray-400 group-hover:text-white transition-colors self-center font-medium">0 (212) 555 00 00</a>
                            </div>
                            <div class="flex gap-4 group">
                                <div class="bg-gray-800 p-2.5 rounded-lg text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <i data-lucide="mail" class="w-4 h-4"></i>
                                </div>
                                <a href="mailto:bilgi@ozguvenegitim.com" class="text-gray-400 group-hover:text-white transition-colors self-center">bilgi@ozguvenegitim.com</a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <div class="flex flex-col md:flex-row items-center gap-1 md:gap-4 text-center md:text-left">
                        <p>&copy; 2025 Özgüven Özel Eğitim.</p>
                        <span class="hidden md:block text-gray-700">•</span>
                        <a href="https://bayindirmedya.com" target="_blank" rel="nofollow" class="hover:text-white transition-colors font-semibold tracking-wide flex items-center gap-1">
                           Design by BAYINDIR MEDYA
                        </a>
                    </div>
                    <div class="flex gap-6">
                        <a href="gizlilik-politikasi.html" class="hover:text-white transition underline-offset-4 hover:underline">Gizlilik Politikası</a>
                        <a href="kullanim-sartlari.html" class="hover:text-white transition underline-offset-4 hover:underline">Kullanım Şartları</a>
                    </div>
                </div>
            </div>
        </div>`;
    }
    
    if(window.lucide) lucide.createIcons();
};

window.goToBlogDetail = (id) => {
    const selectedBlog = window.blogData.find(b => b.id === id);
    if (selectedBlog) {
        localStorage.setItem('currentBlog', JSON.stringify(selectedBlog));
        window.location.href = 'blog-detay.html';
    } else { alert("Blog yazısı bulunamadı."); }
};

window.addStaff = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Ekleniyor..."; btn.disabled = true;
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'staff'), {
            category: document.getElementById('staff-category').value,
            name: document.getElementById('staff-name').value,
            role: document.getElementById('staff-role').value,
            image: document.getElementById('staff-img').value,
            createdAt: serverTimestamp()
        });
        alert("Eklendi!"); e.target.reset();
    } catch(err) { alert("Hata: " + err.message); }
    btn.innerText = "Ekle"; btn.disabled = false;
};

window.addBlog = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Yayınlanıyor..."; btn.disabled = true;
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'blog'), {
            title: document.getElementById('blog-title').value,
            author: document.getElementById('blog-author').value,
            content: document.getElementById('blog-content').value,
            image: document.getElementById('blog-img').value,
            date: new Date().toLocaleDateString('tr-TR'),
            createdAt: serverTimestamp()
        });
        alert("Yayınlandı!"); e.target.reset();
    } catch(err) { alert("Hata: " + err.message); }
    btn.innerText = "Yayınla"; btn.disabled = false;
};

window.handleContact = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Gönderiliyor..."; btn.disabled = true;
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
            name: document.getElementById('contact-name').value,
            phone: document.getElementById('contact-phone').value,
            message: document.getElementById('contact-message').value,
            createdAt: serverTimestamp()
        });
        alert("Mesajınız iletildi."); e.target.reset();
    } catch(err) { alert("Hata: " + err.message); }
    btn.innerText = "Gönder"; btn.disabled = false;
};

window.deleteItem = async (collectionName, id) => {
    if(!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id));
    } catch(err) { alert("Hata: " + err.message); }
};

const initStaff = () => {
    const listDiv = document.getElementById('staff-public-list');
    const adminList = document.getElementById('admin-staff-list');
    if(!listDiv && !adminList) return;

    onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'staff'), orderBy('createdAt', 'desc')), (snap) => {
        const list = snap.docs.map(d => ({id: d.id, ...d.data()}));
        if(listDiv) {
            listDiv.innerHTML = '';
            const cats = {'kurucu':'Kurucular','mudur':'İdari','ogretmen':'Öğretmenler','fizyoterapist':'Fizyoterapistler','destek':'Destek'};
            for(const [k, t] of Object.entries(cats)) {
                const grp = list.filter(i => i.category === k);
                if(grp.length) {
                    listDiv.innerHTML += `
                    <div class="mb-16 animate-fade-in-up">
                        <h3 class="text-2xl font-bold text-gray-800 mb-8 border-l-4 border-orange-500 pl-4">${t}</h3>
                        <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                            ${grp.map(s => `
                                <div class="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100 hover:shadow-xl transition group">
                                    <div class="w-32 h-32 mx-auto bg-gray-50 rounded-full mb-6 overflow-hidden border-4 border-white shadow-md">
                                        <img src="${s.image || 'https://ui-avatars.com/api/?name='+s.name+'&background=random'}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                                    </div>
                                    <h4 class="font-bold text-lg text-gray-800">${s.name}</h4>
                                    <p class="text-orange-600 font-medium text-sm mt-1">${s.role}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
                }
            }
            document.getElementById('staff-loading').style.display = 'none';
        }
        if(adminList) {
            adminList.innerHTML = list.map(s => `
                <li class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div class="flex items-center gap-3">
                        <img src="${s.image || 'https://ui-avatars.com/api/?name='+s.name}" class="w-8 h-8 rounded-full">
                        <div>
                            <div class="font-bold text-sm text-gray-800">${s.name}</div>
                            <div class="text-xs text-gray-500">${s.role}</div>
                        </div>
                    </div>
                    <button onclick="deleteItem('staff', '${s.id}')" class="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </li>
            `).join('');
            lucide.createIcons();
        }
    });
};

const initBlog = () => {
    const blogGrid = document.getElementById('blog-grid');
    const adminBlogList = document.getElementById('admin-blog-list');
    if(!blogGrid && !adminBlogList) return;

    onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'blog'), orderBy('createdAt', 'desc')), (snap) => {
        const list = snap.docs.map(d => ({id: d.id, ...d.data()}));
        window.blogData = list;
        if(blogGrid) {
            document.getElementById('blog-loading').style.display = 'none';
            blogGrid.innerHTML = list.map(b => `
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition cursor-pointer flex flex-col h-full group" 
                     onclick="goToBlogDetail('${b.id}')">
                    <div class="h-56 bg-gray-200 overflow-hidden relative">
                        <img src="${b.image || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80'}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy">
                        <div class="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm">
                             ${b.date}
                        </div>
                    </div>
                    <div class="p-8 flex flex-col flex-grow">
                        <h3 class="font-bold text-xl text-gray-800 mb-3 line-clamp-2 group-hover:text-orange-600 transition">${b.title}</h3>
                        <p class="text-gray-500 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">${b.content}</p>
                        <div class="flex items-center justify-between text-xs border-t border-gray-50 pt-4 mt-auto">
                            <span class="text-gray-400 font-medium flex items-center gap-1"><i data-lucide="user" class="w-3 h-3"></i> ${b.author}</span>
                            <span class="text-orange-600 font-bold flex items-center gap-1">Oku <i data-lucide="arrow-right" class="w-3 h-3"></i></span>
                        </div>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        }
        if(adminBlogList) {
            adminBlogList.innerHTML = list.map(b => `
                <li class="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div class="truncate w-3/4 font-medium text-gray-700">${b.title}</div>
                    <button onclick="deleteItem('blog', '${b.id}')" class="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </li>
            `).join('');
            lucide.createIcons();
        }
    });
};

const initMessages = () => {
    const msgList = document.getElementById('admin-messages-list');
    if(!msgList) return;
    onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), orderBy('createdAt', 'desc')), (snap) => {
        const list = snap.docs.map(d => ({id: d.id, ...d.data()}));
        const emptyMsg = document.getElementById('messages-empty');
        if (list.length === 0) {
            if(emptyMsg) emptyMsg.classList.remove('hidden');
        } else {
            if(emptyMsg) emptyMsg.classList.add('hidden');
        }
        msgList.innerHTML = list.map(m => `
            <tr class="border-b border-gray-50 hover:bg-gray-50 transition">
                <td class="p-4 font-medium text-gray-800">${m.name}</td>
                <td class="p-4 text-gray-600">${m.phone}</td>
                <td class="p-4 text-sm text-gray-500 max-w-xs truncate" title="${m.message}">${m.message}</td>
                <td class="p-4 text-right">
                    <button onclick="deleteItem('messages', '${m.id}')" class="text-red-600 hover:bg-red-50 p-2 rounded transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    });
};

if (window.location.pathname.includes('admin.html')) {
    renderLayout(); initStaff(); initBlog(); initMessages(); initAuthListener();
} else {
    signInAnonymously(auth).then(() => { renderLayout(); initStaff(); initBlog(); initMessages(); }).catch(console.error);
}
