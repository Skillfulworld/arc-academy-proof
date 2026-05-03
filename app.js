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
window.navigate = function(pageId) {
    window.location.hash = pageId;
    
    // FIX NO 4: Close dropdown menu when navigating
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.classList.remove('active');
};

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'landing';
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(hash + '-screen');
    if (target) {
        target.classList.add('active');
        if (hash === 'dashboard') renderDashboard();
    }
});

// --- 3. WALLET LOGIC ---
window.handleWalletAction = async function() {
    if (state.address) {
        document.getElementById('profile-dropdown').classList.toggle('active');
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
        alert("Connection failed. Check MetaMask.");
    }
}

// --- 4. QUIZ ENGINE & DATABASE ---
// FIX NO 1: Added Level 2 and Level 3 back to the database
const DB = {
    level1: {
        title: "Arc House & Architects",
        docLink: "https://community.arc.network/public/externals/introducing-arc-house-and-the-architects-program-2026-03-31",
        questions: [
            { 
                question: "What is Arc House primarily designed for?", 
                options: ["Token trading", "Mining rewards", "Community collaboration and builder engagement", "NFT marketplace"], 
                correct_answer: "Community collaboration and builder engagement", 
                ngmi: "Focus on the builder community." 
            }
        ]
    },
    level2: {
        title: "Arc Protocol Basics",
        docLink: "https://community.arc.network/docs/protocol-basics",
        questions: [
            { 
                question: "What is the core focus of Arc Protocol?", 
                options: ["Lending", "Agentic Economy", "Gaming", "Cloud Storage"], 
                correct_answer: "Agentic Economy", 
                ngmi: "Re-read the vision for the Agentic Economy." 
            }
        ]
    },
    level3: {
        title: "Governance & Voting",
        docLink: "https://community.arc.network/docs/governance",
        questions: [
            { 
                question: "Who can participate in governance?", 
                options: ["Anyone with a wallet", "Only developers", "Verified Architects", "The core team only"], 
                correct_answer: "Verified Architects", 
                ngmi: "Governance is earned through verification." 
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
        const hasAccount = !!state.address; // Check if user is logged in

        const card = document.createElement('div');
        card.className = `level-card ${isLocked ? 'locked' : ''}`;
        
        // FIX NO 2: Start button disabled unless Logged In AND Docs Clicked
        const canStart = hasAccount && hasReadDocs && !isLocked;

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
                        ${!canStart ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
                    ${canStart ? 'START' : 'LOCKED'}
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

window.startQuiz = function(key) {
    state.currentLevel = key;
    state.currentQIndex = 0;
    state.score = 0;
    navigate('quiz');
    loadQuestion();
};

function loadQuestion() {
    const q = DB[state.currentLevel].questions[state.currentQIndex];
    document.getElementById('quiz-level-name').innerText = DB[state.currentLevel].title;
    document.getElementById('q-text').innerText = q.question;
    
    const list = document.getElementById('options-list');
    list.innerHTML = '';

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

window.handleNext = function() {
    state.currentQIndex++;
    if (state.currentQIndex < DB[state.currentLevel].questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
};

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
            saveProfile(); 
        }
        mainBtn.onclick = () => navigate('dashboard');
    } else {
        document.getElementById('result-verdict').innerText = "STATUS: NGMI";
        mainBtn.innerText = "RETRY MODULE";
        mainBtn.onclick = () => startQuiz(state.currentLevel);
    }
}

// --- 5. STORAGE & UI ---
function saveProfile() {
    if (state.address) {
        localStorage.setItem(`arc_user_${state.address}`, JSON.stringify(state));
    }
}

function loadFromStorage() {
    const saved = localStorage.getItem(`arc_user_${state.address}`);
    if (saved) {
        const data = JSON.parse(saved);
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

window.disconnect = function() {
    localStorage.clear();
    location.reload();
};

window.addEventListener('load', () => {
    if (!window.location.hash) navigate('landing');
    else window.dispatchEvent(new HashChangeEvent('hashchange'));
});
