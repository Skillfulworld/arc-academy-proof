// --- 1. GLOBAL STATE ---
let state = {
    address: null,
    profile: { username: '', email: '', x: '', discord: '' },
    unlockedLevels: 1,
    completedLevels: [],
    currentLevel: null,
    currentQIndex: 0,
    score: 0,
    visitedDocs: new Set() 
};

// --- 2. ROUTING SYSTEM ---
function navigate(pageId) {
    window.location.hash = pageId;
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'landing';
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(hash + '-screen');
    if (target) {
        target.classList.add('active');
        if (hash === 'dashboard') renderDashboard();
    }
});

// --- 3. HARDENED WALLET LOGIC (PC FIX) ---
// Attaching to window ensures the HTML button always "sees" the function on PC
window.handleWalletAction = async function() {
    console.log("Button Triggered"); // View this in F12 Console
    if (state.address) {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) dropdown.classList.toggle('active');
    } else {
        await connectAndSign();
    }
};

async function connectAndSign() {
    if (!window.ethereum) return alert("MetaMask not found. Please install the extension.");

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddr = accounts[0];

        const msg = `ARC_ACADEMY_AUTH: ${userAddr.toLowerCase()}\n\nVerify identity to access Architect Node.`;
        await window.ethereum.request({ method: 'personal_sign', params: [msg, userAddr] });

        state.address = userAddr;
        loadFromStorage();
        updateUI();
        navigate('dashboard');
    } catch (e) {
        console.error(e);
        alert("Connection failed. Check MetaMask for pending requests.");
    }
}

// --- 4. QUIZ ENGINE & LOCK LOGIC ---
const DB = {
    level1: {
        title: "Arc House & Architects",
        subtitle: "Community & Contribution",
        docLink: "https://community.arc.network/public/externals/introducing-arc-house-and-the-architects-program-2026-03-31",
        questions: [
            { 
                question: "What is Arc House primarily designed for?", 
                options: ["Token trading", "Mining rewards", "Community collaboration and builder engagement", "NFT marketplace"], 
                correct_answer: "Community collaboration and builder engagement", 
                ngmi: "Focus on the builder community." 
            },
            { 
                question: "How does someone become an Architect?", 
                options: ["By buying tokens", "By contributing and earning points", "By application form only", "By staking assets"], 
                correct_answer: "By contributing and earning points", 
                ngmi: "Status is earned through effort, not capital." 
            }
        ]
    }
};

function renderDashboard() {
    const grid = document.getElementById('levels-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(DB).forEach((key, index) => {
        const lvlNum = index + 1;
        const isLocked = lvlNum > state.unlockedLevels;
        const isComp = state.completedLevels.includes(key);
        const hasReadDocs = state.visitedDocs.has(key);

        const card = document.createElement('div');
        card.className = `level-card ${isLocked ? 'locked' : ''}`;
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span style="font-family:Orbitron; font-size:0.7rem; color:var(--arc-purple)">LEVEL 0${lvlNum}</span>
                ${isComp ? '<span style="color:#38a169">✓ VERIFIED</span>' : ''}
            </div>
            <h3>${DB[key].title}</h3>
            <div style="display:flex; gap:10px; margin-top:15px;">
                <a href="${DB[key].docLink}" target="_blank" class="connect-btn-nav" 
                   style="flex:1; text-align:center; text-decoration:none;" 
                   onclick="unlockQuiz('${key}')">DOCS</a>
                
                <button class="launch-btn" style="flex:1; padding:10px; font-size:0.7rem;" 
                        onclick="startQuiz('${key}')" 
                        ${isLocked || !hasReadDocs ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
                    ${hasReadDocs ? 'START' : 'LOCKED'}
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function unlockQuiz(key) {
    state.visitedDocs.add(key);
    setTimeout(renderDashboard, 500);
}

function loadQuestion() {
    const q = DB[state.currentLevel].questions[state.currentQIndex];
    document.getElementById('quiz-level-name').innerText = DB[state.currentLevel].title;
    document.getElementById('q-text').innerText = q.question;
    
    const list = document.getElementById('options-list');
    list.innerHTML = '';

    // --- FISHER-YATES SHUFFLE (Better Randomizing) ---
    let shuffled = [...q.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    shuffled.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'option-btn';
        b.innerText = opt;
        b.onclick = () => {
            document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
            if (opt === q.correct_answer) {
                state.score++;
                b.style.borderColor = "#38a169";
                document.getElementById('success-box').style.display = 'block';
            } else {
                b.style.borderColor = "#e53e3e";
                document.getElementById('ngmi-text').innerText = q.ngmi;
                document.getElementById('ngmi-box').style.display = 'block';
            }
            document.getElementById('next-btn').style.display = 'block';
        };
        list.appendChild(b);
    });
}

// --- 5. INITIALIZATION & STORAGE ---
function saveProfile() {
    if (!state.address) return;
    localStorage.setItem(`arc_user_${state.address}`, JSON.stringify(state));
    alert("Progress Saved.");
}

function loadFromStorage() {
    const saved = localStorage.getItem(`arc_user_${state.address}`);
    if (saved) {
        const data = JSON.parse(saved);
        state.profile = data.profile || state.profile;
        state.completedLevels = data.completedLevels || [];
        state.unlockedLevels = data.unlockedLevels || 1;
    }
}

function updateUI() {
    const btnText = document.getElementById('btn-text');
    if (state.address && btnText) {
        btnText.innerText = state.address.substring(0,6) + "..." + state.address.substring(38);
    }
}

window.addEventListener('load', () => {
    if (!window.location.hash) navigate('landing');
    else window.dispatchEvent(new HashChangeEvent('hashchange'));
});

// Helper functions
function startQuiz(key) { state.currentLevel = key; state.currentQIndex = 0; state.score = 0; navigate('quiz'); loadQuestion(); }
function handleNext() { state.currentQIndex++; if (state.currentQIndex < DB[state.currentLevel].questions.length) loadQuestion(); else showResults(); }
function disconnect() { localStorage.clear(); location.reload(); }

function showResults() {
    navigate('results');
    const total = DB[state.currentLevel].questions.length;
    const pct = (state.score / total) * 100;
    document.getElementById('final-score-num').innerText = Math.round(pct);
    
    const mainBtn = document.getElementById('
