// js/app.js

let currentChart = null;
let globalIssues = []; // Arama/Filtreleme için veriyi bellekte tutuyoruz

document.addEventListener('DOMContentLoaded', () => {
    const savedSecret = localStorage.getItem('adminSecret');
    if (savedSecret) {
        document.getElementById('login-modal').classList.add('hidden');
        loadProjects();
    }
    
    // YENİ: Arama çubuğu dinleyicisi
    document.getElementById('search-issue').addEventListener('input', (e) => {
        filterIssuesByText(e.target.value);
    });
});

async function loginAdmin(event) {
    event.preventDefault();
    localStorage.setItem('adminSecret', document.getElementById('admin-secret-input').value);
    document.getElementById('login-modal').classList.add('hidden');
    await loadProjects();
}

function logoutAdmin() {
    localStorage.removeItem('adminSecret');
    localStorage.removeItem('currentApiKey');
    window.location.reload();
}

async function loadProjects() {
    try {
        const projects = await api.getProjects();
        const list = document.getElementById('project-list');
        list.innerHTML = '';
        projects.forEach(p => {
            const a = document.createElement('a');
            a.href = "#";
            // KURSAL DOKUNUŞ: flex-1 ve justify-between ekleyerek çöp kutusunu sağa yasladık
            a.className = "flex items-center justify-between px-3 py-2 text-gray-400 hover:text-white hover:bg-darkborder/50 rounded-xl text-sm font-medium transition cursor-pointer group w-full";
            
            // Proje ID'sini elemente data attribute olarak gömüyoruz
            a.setAttribute('data-id', p.id);

            a.innerHTML = `
                <div class="flex items-center truncate">
                    <i class="fas fa-layer-group mr-3 text-gray-500 group-hover:text-blue-400 transition"></i> 
                    <span class="truncate">${p.name}</span>
                </div>
                <button onclick="deleteProjectEventHandler(event, ${p.id}, '${p.name}')" class="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition" title="Projeyi Sil">
                    <i class="far fa-trash-alt text-xs"></i>
                </button>
            `;
            
            a.onclick = (e) => {
                // Eğer çöp kutusuna tıklandıysa projeyi seçme, dur
                if (e.target.closest('button')) return;
                
                e.preventDefault();
                document.querySelectorAll('#project-list a').forEach(el => {
                    el.classList.remove('bg-darkborder/50', 'text-white');
                    el.classList.add('text-gray-400');
                    if (el.querySelector('i')) el.querySelector('i').classList.replace('text-blue-400', 'text-gray-500');
                });
                a.classList.add('bg-darkborder/50', 'text-white');
                a.classList.remove('text-gray-400');
                if (a.querySelector('i')) a.querySelector('i').classList.replace('text-gray-500', 'text-blue-400');
                selectProject(p.name, p.api_key || p.apiKey);
            };
            list.appendChild(a);
        });
    } catch (error) {
        showToast("Bağlantı hatası!", "error");
        logoutAdmin();
    }
}

// YENİ: İstemci Parse Etme (Browser/OS İkonları için)
function parseUserAgent(ua) {
    if(!ua) return { icon: 'fa-globe', text: 'Bilinmeyen' };
    const uaLow = ua.toLowerCase();
    if(uaLow.includes('chrome')) return { icon: 'fa-brands fa-chrome text-green-400', text: 'Chrome' };
    if(uaLow.includes('safari') && !uaLow.includes('chrome')) return { icon: 'fa-brands fa-safari text-blue-400', text: 'Safari' };
    if(uaLow.includes('firefox')) return { icon: 'fa-brands fa-firefox text-orange-400', text: 'Firefox' };
    if(uaLow.includes('edge')) return { icon: 'fa-brands fa-edge text-blue-500', text: 'Edge' };
    if(uaLow.includes('postman') || uaLow.includes('insomnia')) return { icon: 'fa-solid fa-satellite-dish text-purple-400', text: 'API İstemcisi' };
    if(uaLow.includes('node')) return { icon: 'fa-brands fa-node-js text-green-500', text: 'Node.js' };
    return { icon: 'fa-globe text-gray-400', text: 'Diğer' };
}

function timeAgo(date) {
    const d = new Date(date);
    const sec = Math.round((new Date() - d) / 1000);
    if(sec < 60) return "Az önce";
    if(sec < 3600) return `${Math.round(sec/60)} dk önce`;
    if(sec < 86400) return `${Math.round(sec/3600)} saat önce`;
    return `${Math.round(sec/86400)} gün önce`;
}

function renderSkeletons() {
    const container = document.getElementById('issues-list');
    container.innerHTML = '';
    for(let i=0; i<5; i++) {
        container.innerHTML += `<div class="p-4 animate-pulse border-b border-darkborder/30 flex justify-between"><div class="w-1/2 h-4 bg-darkborder rounded"></div><div class="w-16 h-4 bg-darkborder rounded"></div></div>`;
    }
}

async function selectProject(projectName, apiKey) {
    document.getElementById('active-project-name').innerText = `${projectName}`;
    localStorage.setItem('currentApiKey', apiKey);
    renderSkeletons();
    
    try {
        globalIssues = await api.getIssues() || [];
        renderDashboard(globalIssues);
        showToast('Veriler senkronize edildi.', 'success');
    } catch (error) {
        showToast('Veri çekilemedi.', 'error');
        document.getElementById('issues-list').innerHTML = '<div class="p-10 text-center text-red-500">Bağlantı hatası!</div>';
    }
}

// Ana Render (Arama/Filtreleme için ayrıldı)
function renderDashboard(issues) {
    const listContainer = document.getElementById('issues-list');
    listContainer.innerHTML = '';
    
    if(!issues || issues.length === 0) {
        listContainer.innerHTML = '<div class="p-10 text-center text-gray-500">Bu kritere uygun kayıt yok.</div>';
        updateStats(globalIssues); // İstatistikler her zaman genel veriyi göstersin
        return;
    }

    updateStats(globalIssues); // Üst kartlar filtreden etkilenmez
    renderChart(issues);

    issues.forEach(issue => {
        const row = document.createElement('div');
        row.className = "grid grid-cols-12 gap-4 p-4 items-center hover:bg-darkborder/30 transition cursor-pointer group";
        row.onclick = () => openIssueDetail(issue.id);
        
        const isResolved = issue.status === 'resolved';
        const badgeClass = isResolved ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20';
        row.innerHTML = `
            <div class="col-span-7 pl-2"><h4 class="text-sm font-semibold text-gray-200 group-hover:text-blue-400 truncate">${issue.title}</h4></div>
            <div class="col-span-2 text-center"><span class="text-sm text-gray-300 bg-darkborder/50 px-3 py-1 rounded-full">${issue.occurrence_count}</span></div>
            <div class="col-span-3 text-right pr-4 flex flex-col items-end">
                <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${badgeClass}">${isResolved ? 'Çözüldü' : 'Açık'}</span>
                <span class="text-[11px] text-gray-500 mt-1">${timeAgo(issue.last_seen)}</span>
            </div>
        `;
        listContainer.appendChild(row);
    });
}

// YENİ: Arama ve Filtreleme
function filterIssues(status) {
    // Buton stillerini ayarla
    ['open', 'resolved', 'all'].forEach(s => document.getElementById(`btn-filter-${s}`).classList.add('opacity-50'));
    document.getElementById(`btn-filter-${status}`).classList.remove('opacity-50');

    if(status === 'all') renderDashboard(globalIssues);
    else renderDashboard(globalIssues.filter(i => i.status === status));
}

function filterIssuesByText(text) {
    const lower = text.toLowerCase();
    const filtered = globalIssues.filter(i => i.title.toLowerCase().includes(lower));
    renderDashboard(filtered);
}

// YENİ: Sistem Sağlık Barı Güncellemesi
function updateStats(issues) {
    let total = 0, open = 0, resolved = 0;
    issues.forEach(i => { total += (i.occurrence_count || 1); if(i.status === 'resolved') resolved++; else open++; });
    
    document.getElementById('stat-total').innerText = issues.length;
    document.getElementById('stat-open').innerText = open;
    document.getElementById('stat-resolved').innerText = resolved;
    document.getElementById('stat-occurrences').innerText = total;

    // Health Bar Hesaplama
    const healthBar = document.getElementById('health-bar');
    const healthText = document.getElementById('health-text');
    if(issues.length === 0) {
        healthBar.style.width = '100%'; healthBar.className = "h-full bg-blue-500 transition-all duration-1000"; healthText.innerText = "100%";
    } else {
        const percent = Math.round((resolved / issues.length) * 100);
        healthBar.style.width = `${percent}%`;
        healthText.innerText = `${percent}%`;
        if(percent < 30) healthBar.className = "h-full bg-red-500 transition-all duration-1000";
        else if(percent < 70) healthBar.className = "h-full bg-yellow-500 transition-all duration-1000";
        else healthBar.className = "h-full bg-green-500 transition-all duration-1000";
    }
}

function renderChart(issues) {
    const c = document.getElementById("top-errors-chart");
    if (!issues || issues.length === 0) { c.innerHTML = "<div class='text-gray-600 text-sm'>Veri yok.</div>"; return; }
    const top = [...issues].sort((a, b) => b.occurrence_count - a.occurrence_count).slice(0, 5);
    const opts = {
        series: [{ data: top.map(i => i.occurrence_count) }],
        chart: { type: 'bar', height: 200, toolbar: { show: false }, fontFamily: 'Inter', background: 'transparent' },
        plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '50%' } },
        colors: ['#3b82f6'], dataLabels: { enabled: false },
        xaxis: { categories: top.map(i => i.title.substring(0, 20) + '...'), labels: { style: { colors: '#71717a' } }, axisBorder:{show:false}, axisTicks:{show:false} },
        yaxis: { labels: { style: { colors: '#a1a1aa' }, maxWidth: 150 } },
        grid: { borderColor: '#27272a', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
        theme: { mode: 'dark' }
    };
    c.innerHTML = '';
    if(currentChart) currentChart.destroy();
    currentChart = new ApexCharts(c, opts); currentChart.render();
}

// YENİ: Sekme Geçişi (Tabs)
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    // Buton stilleri
    ['ai', 'stack', 'env'].forEach(id => {
        const btn = document.getElementById(`tab-btn-${id}`);
        btn.classList.remove('border-brand', 'text-white');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    activeBtn.classList.remove('border-transparent', 'text-gray-500');
    activeBtn.classList.add('border-brand', 'text-white');
}

// YENİ: Panoya Kopyalama
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Kod panoya kopyalandı.', 'success');
    });
}

async function openIssueDetail(issueId) {
    document.getElementById('drawer-overlay').classList.remove('hidden');
    setTimeout(() => document.getElementById('drawer-overlay').classList.remove('opacity-0'), 10);
    document.getElementById('issue-drawer').classList.remove('translate-x-full');
    document.getElementById('issue-drawer').classList.add('translate-x-0');
    
    // Default sekmeyi aç
    switchTab('ai');
    
    document.getElementById('modal-title').innerText = "Yükleniyor...";
    document.getElementById('modal-ai-text').innerHTML = `<i class="fas fa-circle-notch fa-spin text-brand"></i>`;
    document.getElementById('modal-errors-list').innerHTML = "";
    document.getElementById('modal-env-list').innerHTML = "";

    try {
        const data = await api.getIssueDetail(issueId);
        
        document.getElementById('modal-title').innerText = data.issue.title;
        document.getElementById('modal-error-count').innerText = data.errors.length;
        document.getElementById('modal-date-info').innerText = `Son Görülme: ${new Date(data.issue.last_seen).toLocaleString()}`;
        
        const isRes = data.issue.status === 'resolved';
        document.getElementById('modal-status-badge').innerText = isRes ? "ÇÖZÜLDÜ" : "AÇIK";
        document.getElementById('resolve-btn').style.display = isRes ? 'none' : 'flex';
        document.getElementById('resolve-btn').onclick = () => resolveIssue(issueId);
        
        // Tab 1: AI
        if(data.issue.ai_explanation) {
            // YENİ KOD:
                document.getElementById('modal-ai-text').innerHTML = formatMarkdown(data.issue.ai_explanation);
        } 
        else {
            document.getElementById('modal-ai-text').innerText = "Bu hata için AI analizi oluşturulmamış.";
        }
        
        // Tab 2 & 3: Stack Trace ve Environment
        const stackList = document.getElementById('modal-errors-list');
        const envList = document.getElementById('modal-env-list');
        
        data.errors.forEach((err, idx) => {
            const dateStr = new Date(err.created_at).toLocaleString();
            const clientInfo = parseUserAgent(err.user_agent);
            const safeStack = err.stack_trace || 'Stack trace mevcut değil';
            
            // Stack Trace Sekmesi İçeriği (Kopyala butonu eklendi)
            stackList.innerHTML += `
                <div class="rounded-xl bg-[#09090b] border border-darkborder overflow-hidden">
                    <div class="px-4 py-2 bg-[#111115] border-b border-darkborder flex justify-between items-center">
                        <span class="text-xs text-gray-500 font-mono">Olay #${idx+1} • ${dateStr}</span>
                        <button onclick="copyToClipboard(\`${safeStack.replace(/`/g, '\\`')}\`)" class="text-gray-500 hover:text-white transition" title="Kodu Kopyala"><i class="far fa-copy"></i></button>
                    </div>
                    <div class="p-5 font-mono text-[11px] text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        ${safeStack}
                    </div>
                </div>
            `;

            // Env Sekmesi İçeriği (İkonlu Kutucuklar)
            envList.innerHTML += `
                <div class="bg-[#111115] border border-darkborder p-4 rounded-xl flex flex-col justify-center items-center text-center">
                    <div class="w-10 h-10 rounded-full bg-darkbg border border-darkborder flex items-center justify-center mb-3">
                        <i class="${clientInfo.icon} text-lg"></i>
                    </div>
                    <h4 class="text-xs font-bold text-gray-300 mb-1">${clientInfo.text}</h4>
                    <p class="text-[10px] text-gray-500 font-mono break-all line-clamp-2" title="${err.user_agent}">${err.user_agent || 'Unknown UA'}</p>
                    <div class="mt-2 text-[9px] text-gray-600">${dateStr}</div>
                </div>
            `;
        });
    } catch (err) {
        document.getElementById('modal-title').innerText = "Hata oluştu";
    }
}

function closeModal() {
    document.getElementById('issue-drawer').classList.replace('translate-x-0', 'translate-x-full');
    document.getElementById('drawer-overlay').classList.add('opacity-0');
    setTimeout(() => document.getElementById('drawer-overlay').classList.add('hidden'), 300);
}

async function resolveIssue(issueId) {
    try {
        await api.updateIssueStatus(issueId, 'resolved');
        closeModal();
        showToast('Hata başarıyla "Çözüldü" işaretlendi.', 'success');
        selectProject(document.getElementById('active-project-name').innerText, localStorage.getItem('currentApiKey')); 
    } catch (error) { showToast('Hata oluştu.', 'error'); }
}

function showToast(message, type = 'success') {
    const c = document.getElementById('toast-container');
    const div = document.createElement('div');
    const isS = type === 'success';
    div.className = `transform translate-y-10 opacity-0 transition-all duration-300 flex items-center p-4 rounded-xl border ${isS ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} bg-[#111115]/90 backdrop-blur-md min-w-[300px] pointer-events-auto`;
    div.innerHTML = `<i class="fas ${isS ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-red-500'} text-xl mr-3"></i><div class="flex-1"><p class="text-sm font-semibold text-white">${isS ? 'Başarılı' : 'Uyarı'}</p><p class="text-xs text-gray-400">${message}</p></div>`;
    c.appendChild(div);
    setTimeout(() => div.classList.replace('translate-y-10', 'translate-y-0') || div.classList.replace('opacity-0', 'opacity-100'), 10);
    setTimeout(() => div.classList.replace('translate-y-0', 'translate-y-10') || div.classList.replace('opacity-100', 'opacity-0') || setTimeout(() => div.remove(), 300), 3000);
}

// --- AYARLAR VE API KEY YÖNETİMİ ---
function openSettings() {
    const apiKey = localStorage.getItem('currentApiKey');
    if (!apiKey) {
        showToast('Lütfen önce soldan bir proje seçin.', 'error');
        return;
    }

    const overlay = document.getElementById('settings-overlay');
    const modal = document.getElementById('settings-modal');
    
    // API Key'i input'a yaz
    document.getElementById('settings-api-key').value = apiKey;
    
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    
    // Animasyon (Görünür yap)
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        modal.classList.remove('opacity-0', 'scale-95');
        modal.classList.add('opacity-100', 'scale-100');
    }, 10);
}

function closeSettings() {
    const overlay = document.getElementById('settings-overlay');
    const modal = document.getElementById('settings-modal');
    
    // Animasyon (Gizle)
    overlay.classList.add('opacity-0');
    modal.classList.remove('opacity-100', 'scale-100');
    modal.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        modal.classList.add('hidden');
    }, 300);
}

function copyApiKey() {
    const input = document.getElementById('settings-api-key');
    input.select();
    input.setSelectionRange(0, 99999); // Mobil cihazlar için
    navigator.clipboard.writeText(input.value).then(() => {
        showToast('API Key panoya kopyalandı!', 'success');
        closeSettings();
    });
}

// AI metnindeki yıldızları (**) ve tagleri (`) şık HTML tasarımlarına çevirir
function formatMarkdown(text) {
    if (!text) return "";
    return text
        .replace(/### (.*)/g, '<h3 class="text-lg font-bold text-white mt-5 mb-2">$1</h3>')
        .replace(/## (.*)/g, '<h2 class="text-xl font-bold text-white mt-5 mb-2">$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="text-gray-400">$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-darkborder text-blue-400 px-1.5 py-0.5 rounded font-mono text-[11px]">$1</code>')
        .replace(/\n/g, '<br>');
}

// ========================================================
// 🎭 MODAL YÖNETİMİ: ÇİRKİN PROMPT YERİNE ÖZEL DARK MODAL
// ========================================================

// 1. Modalı Açma
function openProjectModal() {
    const overlay = document.getElementById('project-modal-overlay');
    const modal = document.getElementById('project-modal');
    const input = document.getElementById('project-modal-input');
    
    input.value = ''; // İçini temizle
    overlay.classList.remove('hidden');
    
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        modal.classList.remove('opacity-0', 'scale-95');
        modal.classList.add('opacity-100', 'scale-100');
        input.focus(); // Doğrudan inputa odaklansın
    }, 10);
}

// 2. Modalı Kapatma
function closeProjectModal() {
    const overlay = document.getElementById('project-modal-overlay');
    const modal = document.getElementById('project-modal');
    
    overlay.classList.add('opacity-0');
    modal.classList.remove('opacity-100', 'scale-100');
    modal.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 300);
}

// ==========================================
// 🛠️ MODERN PROJE SİLME İŞLEMLERİ
// ==========================================
let projectToDelete = null; // Silinecek projeyi geçici olarak hafızada tutarız

function deleteProjectEventHandler(event, projectId, projectName) {
    event.preventDefault();
    event.stopPropagation();

    projectToDelete = { id: projectId, name: projectName }; // Hafızaya al
    
    // Çirkin 'confirm' yerine bizim özel modalı tasarlayıp açıyoruz
    document.getElementById('confirm-modal-desc').innerHTML = `<strong class="text-white">${projectName}</strong> projesini ve içerisindeki TÜM hata loglarını kalıcı olarak silmek istediğinize emin misiniz?`;
    
    const overlay = document.getElementById('confirm-modal-overlay');
    const modal = document.getElementById('confirm-modal');
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        modal.classList.remove('opacity-0', 'scale-95');
        modal.classList.add('opacity-100', 'scale-100');
    }, 10);
}

function closeConfirmModal() {
    const overlay = document.getElementById('confirm-modal-overlay');
    const modal = document.getElementById('confirm-modal');
    overlay.classList.add('opacity-0');
    modal.classList.remove('opacity-100', 'scale-100');
    modal.classList.add('opacity-0', 'scale-95');
    setTimeout(() => overlay.classList.add('hidden'), 300);
    projectToDelete = null;
}

// "Evet, Sil" butonuna basıldığında tetiklenir
async function executeDeleteProject() {
    if (!projectToDelete) return;
    const { id: projectId, name: projectName } = projectToDelete;
    
    closeConfirmModal(); // Modalı kapat

    try {
        const data = await api.deleteProject(projectId);
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Proje başarıyla silindi.', 'success');
            const activeProject = document.getElementById('active-project-name').innerText;
            if (activeProject === projectName) {
                document.getElementById('active-project-name').innerText = "Proje Seçilmedi";
                document.getElementById('issues-list').innerHTML = '';
                localStorage.removeItem('currentApiKey');
                if(typeof updateStats === 'function') updateStats([]); 
            }
            loadProjects(); 
        }
    } catch (error) {
        showToast('Sunucuyla bağlantı kurulamadı.', 'error');
    }
}

// ==========================================
// 🚀 MODERN PROJE EKLEME & API KEY GÖSTERİMİ
// ==========================================
async function submitNewProject(event) {
    event.preventDefault(); 
    
    const input = document.getElementById('project-modal-input');
    const projectName = input.value.trim();
    if (!projectName) return;

    try {
        const data = await api.createProject(projectName);

        if (data.error) {
            showToast(data.error, 'error');
        } else {
            closeProjectModal(); // Ekleme formunu kapat
            showToast('Proje başarıyla oluşturuldu.', 'success');
            
            // Çirkin 'alert' yerine bizim yeşil başarı modalını aç!
            const apiKeyToDisplay = data.apiKey || data.api_key || data.project?.api_key;
            document.getElementById('apikey-modal-title').innerText = `"${projectName}" Başarıyla Açıldı!`;
            document.getElementById('apikey-modal-input').value = apiKeyToDisplay;
            
            const overlay = document.getElementById('apikey-modal-overlay');
            const modal = document.getElementById('apikey-modal');
            overlay.classList.remove('hidden');
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
                modal.classList.remove('opacity-0', 'scale-95');
                modal.classList.add('opacity-100', 'scale-100');
            }, 10);
            
            loadProjects(); 
        }
    } catch (error) {
        showToast('Sunucuyla bağlantı kurulamadı.', 'error');
    }
}

function closeApiKeyModal() {
    const overlay = document.getElementById('apikey-modal-overlay');
    const modal = document.getElementById('apikey-modal');
    overlay.classList.add('opacity-0');
    modal.classList.remove('opacity-100', 'scale-100');
    modal.classList.add('opacity-0', 'scale-95');
    setTimeout(() => overlay.classList.add('hidden'), 300);
}

function copyNewApiKey() {
    const input = document.getElementById('apikey-modal-input');
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value).then(() => {
        showToast('API Key panoya kopyalandı!', 'success');
    });
}

// ==========================================
// 🔌 BUTONLARI VE FORMLARI CANLANDIRMA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Artı (+) Butonuna Tıklanınca Ekleme Modalını Aç
    const addProjectBtn = document.querySelector('.add-project-btn') || document.querySelector('.fa-plus')?.parentElement;
    if (addProjectBtn) {
        addProjectBtn.style.cursor = 'pointer';
        addProjectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // openProjectModal fonksiyonu bir önceki adımdan zaten dosyamızda duruyor
            if(typeof openProjectModal === 'function') openProjectModal(); 
        });
    }

    // 2. Modalın İçindeki Form "Oluştur"a Basılınca Çalışsın
    const projectForm = document.getElementById('project-modal-form');
    if (projectForm) {
        projectForm.addEventListener('submit', submitNewProject);
    }
});