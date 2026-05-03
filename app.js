// --- 1. GLOBAL STATE ---
let state = {
    address: null, 
    isEmailUser: false,
    profile: { username: '', email: '', x: '', discord: '' },
    unlockedLevels: 1,
    completedLevels: [],
    currentLevel: null,
    currentQIndex: 0,
    score: 0,
    visitedDocs: new Set() 
};

// --- NEW: NOTIFICATION SYSTEM ---
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerText = message;
    document.body.appendChild(toast);

    // Remove toast after animation
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- 2. ROUTING & DROPDOWN FIX ---
window.navigate = function(pageId) {
    window.location.hash = pageId;
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

// --- 3. HYBRID LOGIN LOGIC ---
window.toggleLoginModal = function(show) {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
};

window.handleWalletAction = function() {
    if (state.address) {
        document.getElementById('profile-dropdown').classList.toggle('active');
    } else {
        window.toggleLoginModal(true);
    }
};

window.handleEmailLogin = function() {
    const email = document.getElementById('email-input').value;
    if (!email || !email.includes('@')) {
        alert("Enter a valid architect email.");
        return;
    }
    state.address = email.toLowerCase();
    state.isEmailUser = true;
    finalizeLogin();
};

async function connectAndSign() {
    if (!window.ethereum) return alert("MetaMask not found.");
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        state.address = accounts[0];
        state.isEmailUser = false;
        finalizeLogin();
    } catch (e) { console.error(e); }
}

function finalizeLogin() {
    loadFromStorage();
    updateUI();
    window.toggleLoginModal(false);
    navigate('dashboard');
}

// --- 4. PROFILE LOGIC ---
// NEW: Handles the "SAVE CHANGES" button click
window.saveProfileChanges = function() {
    // Collect data from inputs
    state.profile.username = document.getElementById('display-name')?.value || '';
    state.profile.email = document.getElementById('email-contact')?.value || '';
    state.profile.x = document.getElementById('x-handle')?.value || '';
    state.profile.discord = document.getElementById('discord-handle')?.value || '';

    saveProfile();
    showToast("CHANGES_SAVED_SUCCESSFULLY");
};

// --- 5. QUIZ ENGINE & LEVELS ---
const DB = {
    level1: {
        title: "Arc House & Architects",
        docLink: "https://community.arc.network/public/externals/introducing-arc-house-and-the-architects-program-2026-03-31",
        questions: [{ 
            question: "What is Arc House primarily designed for?", 
            options: ["Token trading", "Community collaboration", "Mining rewards", "NFT marketplace"], 
            correct_answer: "Community collaboration", 
            ngmi: "Focus on the builder community." 
        }]
    },
    level2: {
        title: "The Agentic Economy",
        docLink: "https://community.arc.network/docs/agentic-economy",
        questions: [{ 
            question: "Who are the primary actors in an Agentic Economy?", 
            options: ["Manual traders", "Autonomous AI Agents", "Central Banks", "Retail Bots"], 
            correct_answer: "Autonomous AI Agents", 
            ngmi: "Agents act on behalf of users." 
        }]
    },
    level3: {
        title: "Arc Protocol Architecture",
        docLink: "https://community.arc.network/docs/architecture",
        questions: [{ 
            question: "What layer does Arc operate on?", 
            options: ["Layer 1", "Layer 2", "Interoperability Layer", "Application Layer"], 
            correct_answer: "Interoperability Layer", 
            ngmi: "Arc connects fragmented liquidity." 
        }]
    },
    level4: {
        title: "Governance & DAOs",
        docLink: "https://community.arc.network/docs/governance",
        questions: [{ 
            question: "How is proposal power determined?", 
            options: ["Architect Rank", "Follower count", "Random selection", "Pay-to-play"], 
            correct_answer: "Architect Rank", 
            ngmi: "Contribution determines influence." 
        }]
    },
    level5: {
        title: "Advanced Integration",
        docLink: "https://community.arc.network/docs/integration",
        questions: [{ 
            question: "What is the primary SDK for Arc?", 
            options: ["ArcEngine", "NexusSDK", "AgentCore", "NodeJS"], 
            correct_answer: "ArcEngine", 
            ngmi: "Architects use the ArcEngine." 
        }]
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
        const hasAccount = !!state.address;

        const card = document.createElement('div');
        card.className = `level-card ${isLocked ? 'locked' : ''}`;
        
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
                    ${isLocked ? 'LOCKED' : (hasReadDocs ? 'START' : 'READ DOCS')}
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
    let shuffled = [...q.options].sort(() => Math.random() - 0.5);

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

// --- 6. STORAGE & UI ---
function saveProfile() {
    if (state.address) {
        localStorage.setItem(`arc_user_${state.address}`, JSON.stringify({
            completedLevels: state.completedLevels,
            unlockedLevels: state.unlockedLevels,
            isEmailUser: state.isEmailUser,
            profile: state.profile
        }));
    }
}

function loadFromStorage() {
    const saved = localStorage.getItem(`arc_user_${state.address}`);
    if (saved) {
        const data = JSON.parse(saved);
        state.completedLevels = data.completedLevels || [];
        state.unlockedLevels = data.unlockedLevels || 1;
        state.isEmailUser = data.isEmailUser || false;
        state.profile = data.profile || { username: '', email: '', x: '', discord: '' };
        
        // Fill input fields if they exist on the page
        if(document.getElementById('display-name')) document.getElementById('display-name').value = state.profile.username;
        if(document.getElementById('email-contact')) document.getElementById('email-contact').value = state.profile.email;
    }
}

function updateUI() {
    const btnText = document.getElementById('btn-text');
    if (state.address && btnText) {
        btnText.innerText = state.isEmailUser 
            ? state.address.split('@')[0].toUpperCase() 
            : state.address.substring(0,6) + "..." + state.address.substring(38);
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
