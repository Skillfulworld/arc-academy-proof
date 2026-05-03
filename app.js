// --- 1. GLOBAL STATE & QUIZ DATABASE ---
const DB = {
    'Basics': {
        questions: [
            { question: "What is the core of an Agentic Economy?", options: ["Manual Labor", "Autonomous Agents", "Central Banking"], correct: 1 },
            { question: "Which layer handles agent coordination?", options: ["Settlement Layer", "Intelligence Layer", "Physical Layer"], correct: 1 }
        ]
    },
    'Economics': { questions: [{ question: "Define Tokenomics in AI?", options: ["GPU tax", "Incentive structures", "Cloud fees"], correct: 1 }] },
    'Agents': { questions: [{ question: "What defines an Autonomous Agent?", options: ["Hardcoded scripts", "Self-directed goals", "User-input only"], correct: 1 }] },
    'Protocols': { questions: [{ question: "How do agents reach consensus?", options: ["Proof of Stake", "Proof of Inference", "Voting"], correct: 1 }] },
    'Economy': { questions: [{ question: "What is the end-state of the Agentic Economy?", options: ["Hyper-productivity", "Human-only markets", "Stagnation"], correct: 0 }] }
};

let state = {
    address: null, 
    isEmailUser: false,
    profile: { username: '', email: '', x: '', discord: '' },
    unlockedLevels: 1,
    completedLevels: [],
    currentLevel: null,
    currentQIndex: 0,
    score: 0,
    streak: 0,
    lastCheckIn: null,
    hasMintedBadge: false 
};

// --- 2. NAVIGATION & UI ENGINE ---
window.navigate = function(screenId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const target = document.getElementById(`${screenId}-screen`);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }

    if (screenId === 'dashboard') renderLevels();
};

// --- 3. QUIZ ENGINE (The Missing Link) ---
window.startQuiz = function(level) {
    if (!DB[level]) return showToast("ERR: MODULE_DATA_NOT_FOUND");
    
    state.currentLevel = level;
    state.currentQIndex = 0;
    state.score = 0;
    
    navigate('quiz');
    showQuestion();
};

function showQuestion() {
    const quiz = DB[state.currentLevel];
    const q = quiz.questions[state.currentQIndex];
    
    document.getElementById('quiz-level-name').innerText = state.currentLevel.toUpperCase();
    document.getElementById('q-text').innerText = q.question;
    
    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = '';
    
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'launch-btn';
        btn.style.cssText = "width: 100%; margin-bottom: 10px; text-align: left; background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border);";
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(idx);
        optionsList.appendChild(btn);
    });

    document.getElementById('success-box').style.display = 'none';
    document.getElementById('ngmi-box').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
}

window.handleAnswer = function(choiceIdx) {
    const q = DB[state.currentLevel].questions[state.currentQIndex];
    const isCorrect = choiceIdx === q.correct;
    
    if (isCorrect) {
        state.score++;
        document.getElementById('success-box').style.display = 'block';
        document.getElementById('ngmi-box').style.display = 'none';
    } else {
        document.getElementById('ngmi-text').innerText = "INCORRECT_LOGIC_DETECTED";
        document.getElementById('ngmi-box').style.display = 'block';
        document.getElementById('success-box').style.display = 'none';
    }
    
    document.getElementById('next-btn').style.display = 'block';
};

window.handleNext = function() {
    state.currentQIndex++;
    const totalQ = DB[state.currentLevel].questions.length;
    
    if (state.currentQIndex < totalQ) {
        showQuestion();
    } else {
        showResults();
    }
};

function showResults() {
    const total = DB[state.currentLevel].questions.length;
    const pct = (state.score / total) * 100;
    
    if (pct === 100) {
        if (!state.completedLevels.includes(state.currentLevel)) {
            state.completedLevels.push(state.currentLevel);
            state.unlockedLevels = Math.min(5, state.completedLevels.length + 1);
            saveProfile();
        }
        showToast("MODULE_COMPLETE_SUCCESS");
    } else {
        showToast("SCORE_INSUFFICIENT_FOR_MASTERY");
    }
    navigate('dashboard');
}

// --- 4. WALLET & DROPDOWN ---
window.handleWalletAction = function() {
    if (!state.address) {
        toggleLoginModal(true);
    } else {
        const dropdown = document.getElementById('profile-dropdown');
        dropdown.classList.toggle('show');
    }
};

window.toggleLoginModal = function(show) {
    const modal = document.getElementById('login-modal');
    modal.style.display = show ? 'flex' : 'none';
};

window.onclick = function(event) {
    if (!event.target.matches('.connect-btn-nav') && !event.target.matches('#btn-text')) {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
};

// --- 5. HYBRID LOGIN & CHECK-IN ---
window.handleEmailLogin = function() {
    const email = document.getElementById('email-input').value;
    if (!email || !email.includes('@')) return alert("Enter a valid architect email.");
    
    const modalContent = document.querySelector('#login-modal .card');
    modalContent.innerHTML = `
        <h2 style="font-family: 'Orbitron'; color: var(--arc-purple);">VERIFY_IDENTITY</h2>
        <input type="text" id="otp-input" placeholder="000000" maxlength="6" 
               style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--arc-purple); color: white; border-radius: 4px; text-align: center; font-size: 1.5rem; letter-spacing: 8px; margin-bottom: 20px;">
        <button class="launch-btn" onclick="verifyOTP('${email}')" style="width:100%; background:var(--arc-purple); color:white;">VALIDATE_SEQUENCE</button>
    `;
};

window.verifyOTP = function(email) {
    state.address = email.toLowerCase();
    state.isEmailUser = true;
    const btnText = document.getElementById('btn-text');
    btnText.innerText = state.address.substring(0, 6).toUpperCase() + "...";
    toggleLoginModal(false);
    loadFromStorage();
    showToast("ACCOUNT_SYNC_COMPLETE");
};

window.toggleCheckinModal = function(show) {
    const modal = document.getElementById('checkin-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
    if (show) renderCheckinGrid();
};

function renderCheckinGrid() {
    const grid = document.getElementById('checkin-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const today = new Date().toDateString();
    for (let i = 1; i <= 7; i++) {
        const isDone = i <= state.streak;
        const isCurrent = (i === state.streak + 1) && (state.lastCheckIn !== today);
        grid.innerHTML += `<div class="day-box ${isDone ? 'completed' : ''} ${isCurrent ? 'current' : ''}">DAY ${i}</div>`;
    }
}

window.processCheckIn = async function() {
    state.streak = (state.streak >= 7) ? 1 : state.streak + 1;
    state.lastCheckIn = new Date().toDateString();
    document.getElementById('checkin-dot').classList.remove('active');
    showToast(`SYNC_SUCCESS: DAY ${state.streak} STREAK`);
    toggleCheckinModal(false);
    saveProfile();
};

// --- 6. DASHBOARD RENDER & STORAGE ---
function renderLevels() {
    const grid = document.getElementById('levels-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const levelNames = ['Basics', 'Economics', 'Agents', 'Protocols', 'Economy'];

    for (let i = 1; i <= 5; i++) {
        const isLocked = i > state.unlockedLevels;
        const levelKey = levelNames[i-1];
        grid.innerHTML += `
            <div class="card" style="opacity: ${isLocked ? '0.5' : '1'}; border: 1px solid ${isLocked ? 'gray' : 'var(--arc-purple)'}; padding: 20px; text-align: center; margin-bottom:15px;">
                <h3 style="font-family: 'Orbitron'; font-size: 0.8rem;">MODULE_0${i}</h3>
                <button class="launch-btn" ${isLocked ? 'disabled' : ''} onclick="startQuiz('${levelKey}')">
                    ${isLocked ? 'LOCKED' : 'ENTER'}
                </button>
            </div>`;
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = "position:fixed; bottom:20px; right:20px; background:var(--arc-purple); color:white; padding:10px 20px; border-radius:4px; font-family:'Orbitron'; font-size:0.8rem; z-index:9999;";
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function saveProfile() { if (state.address) localStorage.setItem(`arc_user_${state.address}`, JSON.stringify(state)); }
function loadFromStorage() {
    const saved = localStorage.getItem(`arc_user_${state.address}`);
    if (saved) Object.assign(state, JSON.parse(saved));
}
window.disconnect = function() { state.address = null; location.reload(); };
