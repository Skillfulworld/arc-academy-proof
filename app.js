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

// --- 2. ROUTING SYSTEM (Multi-Page Logic) ---
function navigate(pageId) {
    window.location.hash = pageId;
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'landing';
    
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show active section
    const activeSection = document.getElementById(hash + '-screen');
    if (activeSection) {
        activeSection.classList.add('active');
        
        // Auto-render dashboard if navigating there
        if (hash === 'dashboard') renderDashboard();
    }
});

// --- 3. WALLET & SIGNATURE AUTH ---
async function handleWalletAction() {
    if (!state.address) {
        await connectAndSign();
    } else {
        const dropdown = document.getElementById('profile-dropdown');
        dropdown.classList.toggle('active');
    }
}

async function connectAndSign() {
    if (!window.ethereum) return alert("Please install MetaMask!");

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddr = accounts[0];

        // The Binding Signature (Bind profile to wallet)
        const msg = `ARC_ACADEMY_AUTH: ${userAddr}\n\nSign this to unlock your Architect Profile and save your progress.`;
        await window.ethereum.request({
            method: 'personal_sign',
            params: [msg, userAddr]
        });

        state.address = userAddr;
        loadFromStorage();
        updateUI();
        navigate('dashboard');
    } catch (e) {
        console.error("Auth failed", e);
    }
}

function disconnect() {
    state.address = null;
    state.profile = { username: '', email: '', x: '', discord: '' };
    state.completedLevels = [];
    state.unlockedLevels = 1;
    updateUI();
    navigate('landing');
    location.reload(); // Hard reset
}

// --- 4. PROFILE PERSISTENCE ---
function saveProfile() {
    if (!state.address) return alert("Connect wallet first!");
    
    state.profile = {
        username: document.getElementById('p-username').value,
        email: document.getElementById('p-email').value,
        x: document.getElementById('p-x').value,
        discord: document.getElementById('p-discord').value
    };

    localStorage.setItem(`arc_user_${state.address}`, JSON.stringify(state));
    alert("Identity Synced!");
    document.getElementById('profile-dropdown').classList.remove('active');
}

function loadFromStorage() {
    const saved = localStorage.getItem(`arc_user_${state.address}`);
    if (saved) {
        const data = JSON.parse(saved);
        state.profile = data.profile || state.profile;
        state.completedLevels = data.completedLevels || [];
        state.unlockedLevels = data.unlockedLevels || 1;

        // Fill form fields
        document.getElementById('p-username').value = state.profile.username;
        document.getElementById('p-email').value = state.profile.email;
        document.getElementById('p-x').value = state.profile.x;
        document.getElementById('p-discord').value = state.profile.discord;
    }
}

function updateUI() {
    const btnText = document.getElementById('btn-text');
    if (state.address) {
        btnText.innerText = state.address.substring(0, 6) + "..." + state.address.substring(38);
    } else {
        btnText.innerText = "CONNECT WALLET";
    }
}

// --- 5. QUIZ DATA & ENGINE ---
const DB = {
    level1: {
        title: "Arc House & Architects",
        subtitle: "Community & Contribution",
        docLink: "https://community.arc.network/public/externals/introducing-arc-house-and-the-architects-program-2026-03-31",
        questions: [
            { question: "What is Arc House primarily designed for?", options: ["Token trading", "Mining rewards", "Community collaboration and builder engagement", "NFT marketplace"], correct_answer: "Community collaboration and builder engagement", ngmi: "Arc House is about the builders. Focus on the community." },
            { question: "How does someone become an Architect?", options: ["By buying tokens", "By contributing and earning points", "By application form only", "By staking assets"], correct_answer: "By contributing and earning points", ngmi: "Status is earned through contribution, not just capital." }
        ]
    }
    // Add other levels here...
};

function renderDashboard() {
    const grid = document.getElementById('levels-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(DB).forEach((key, index) => {
        const lvlNum = index + 1;
        const lvl = DB[key];
        const isLocked = lvlNum > state.unlockedLevels;
        const isComp = state.completedLevels.includes(key);

        const card = document.createElement('div');
        card.className = `level-card ${isLocked ? 'locked' : ''}`;
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span style="font-family:Orbitron; font-size:0.7rem; color:var(--arc-purple)">LEVEL 0${lvlNum}</span>
                ${isComp ? '<span style="color:#38a169">✓ VERIFIED</span>' : ''}
            </div>
            <h3>${lvl.title}</h3>
            <p style="font-size:0.8rem; opacity:0.6; margin-bottom:15px;">${lvl.subtitle}</p>
            <div style="display:flex; gap:10px;">
                <a href="${lvl.docLink}" target="_blank" class="connect-btn-nav" style="flex:1; text-align:center; text-decoration:none;" onclick="state.visitedDocs.add('${key}'); renderDashboard();">DOCS</a>
                <button class="launch-btn" style="flex:1; padding:10px; font-size:0.7rem;" onclick="startQuiz('${key}')" ${isLocked ? 'disabled' : ''}>START</button>
            </div>
        `;
        grid.appendChild(card);
    });

    const progress = (state.completedLevels.length / 5) * 100;
    document.getElementById('progress-fill').style.width = progress + "%";
    document.getElementById('overall-percent').innerText = Math.round(progress) + "%";
}

function startQuiz(key) {
    state.currentLevel = key;
    state.currentQIndex = 0;
    state.score = 0;
    navigate('quiz');
    loadQuestion();
}

function loadQuestion() {
    const q = DB[state.currentLevel].questions[state.currentQIndex];
    document.getElementById('quiz-level-name').innerText = DB[state.currentLevel].title;
    document.getElementById('q-text').innerText = q.question;
    const list = document.getElementById('options-list');
    list.innerHTML = '';

    // SHUFFLE LOGIC (Fisher-Yates)
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

    shuffledOptions.forEach(opt => {
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
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('success-box').style.display = 'none';
    document.getElementById('ngmi-box').style.display = 'none';
}

function handleNext() {
    state.currentQIndex++;
    if (state.currentQIndex < DB[state.currentLevel].questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    navigate('results');
    const total = DB[state.currentLevel].questions.length;
    const pct = (state.score / total) * 100;
    document.getElementById('final-score-num').innerText = Math.round(pct);
    
    const mainBtn = document.getElementById('result-main-btn');
    if (pct === 100) {
        document.getElementById('result-verdict').innerText = "VERIFIED_ARCHITECT";
        if (!state.completedLevels.includes(state.currentLevel)) {
            state.completedLevels.push(state.currentLevel);
            state.unlockedLevels = Math.min(5, state.completedLevels.length + 1);
            saveProfile(); // Save progress to LocalStorage
        }
        mainBtn.onclick = () => navigate('dashboard');
    } else {
        document.getElementById('result-verdict').innerText = "STATUS: NGMI";
        mainBtn.innerText = "RETRY MODULE";
        mainBtn.onclick = () => startQuiz(state.currentLevel);
    }
}

// --- 6. INITIALIZATION ---
window.addEventListener('load', () => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) navigate('landing');
    else window.dispatchEvent(new HashChangeEvent('hashchange'));
});

// Dropdown outside-click closer
window.onclick = function(event) {
    if (!event.target.matches('.connect-btn-nav') && !event.target.matches('#btn-text')) {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown && dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
        }
    }
}
