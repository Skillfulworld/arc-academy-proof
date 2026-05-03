// --- 1. GLOBAL STATE (With Link Tracking) ---
let state = {
    address: null, 
    isEmailUser: false,
    profile: { username: '', email: '', x: '', discord: '' },
    unlockedLevels: 1,
    completedLevels: [],
    currentLevel: null,
    currentQIndex: 0,
    score: 0,
    visitedDocs: new Set(), // THIS TRACKS IF THEY CLICKED THE LINK
    streak: 0,
    lastCheckIn: null
};

// --- 2. QUIZ DATABASE WITH MANDATORY LINKS ---
const DB = {
    'Basics': {
        link: "https://arc.network/whitepaper", // Level 1 Link
        questions: [
            { question: "What is the core of an Agentic Economy?", options: ["Manual Labor", "Autonomous Agents", "Central Banking"], correct: 1 }
        ]
    },
    'Economics': { 
        link: "https://arc.network/economics", // Level 2 Link
        questions: [{ question: "Define Tokenomics in AI?", options: ["GPU tax", "Incentive structures", "Cloud fees"], correct: 1 }] 
    },
    'Agents': { 
        link: "https://arc.network/agents", // Level 3 Link
        questions: [{ question: "What defines an Autonomous Agent?", options: ["Hardcoded scripts", "Self-directed goals", "User-input only"], correct: 1 }] 
    },
    'Protocols': { 
        link: "https://arc.network/protocols", // Level 4 Link
        questions: [{ question: "How do agents reach consensus?", options: ["Proof of Stake", "Proof of Inference", "Voting"], correct: 1 }] 
    },
    'Economy': { 
        link: "https://arc.network/economy-docs", // Level 5 Link
        questions: [{ question: "What is the end-state of the Agentic Economy?", options: ["Hyper-productivity", "Human-only markets", "Stagnation"], correct: 0 }] 
    }
};

// --- 3. TRACKING THE CLICK ---
window.openDoc = function(levelKey, url) {
    state.visitedDocs.add(levelKey);
    window.open(url, '_blank');
    renderLevels(); // Refresh UI to unlock the "ENTER" button
};

// --- 4. UPDATED DASHBOARD RENDER ---
function renderLevels() {
    const grid = document.getElementById('levels-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const levelNames = ['Basics', 'Economics', 'Agents', 'Protocols', 'Economy'];

    levelNames.forEach((name, index) => {
        const levelNum = index + 1;
        const isUnlocked = levelNum <= state.unlockedLevels;
        const hasReadDocs = state.visitedDocs.has(name);
        const docLink = DB[name].link;

        const card = document.createElement('div');
        card.className = 'card';
        card.style.cssText = `opacity: ${isUnlocked ? '1' : '0.5'}; border: 1px solid ${isUnlocked ? 'var(--arc-purple)' : '#333'}; padding: 25px; text-align: center; margin-bottom: 20px; background: rgba(0,0,0,0.3);`;
        
        card.innerHTML = `
            <h3 style="font-family: 'Orbitron'; font-size: 0.8rem; margin-bottom: 15px;">MODULE_0${levelNum}: ${name.toUpperCase()}</h3>
            
            <button class="launch-btn" 
                    onclick="openDoc('${name}', '${docLink}')"
                    style="background: none; border: 1px solid var(--arc-purple); color: var(--arc-purple); margin-bottom: 10px; width: 100%; font-size: 0.7rem; ${!isUnlocked ? 'display:none;' : ''}">
                ${hasReadDocs ? '✅ INTEL_ACCESSED' : '📂 ACCESS_INTEL_FIRST'}
            </button>

            <button class="launch-btn" 
                    ${(!isUnlocked || !hasReadDocs) ? 'disabled' : ''} 
                    onclick="startQuiz('${name}')" 
                    style="width: 100%; font-size: 0.7rem; opacity: ${(!isUnlocked || !hasReadDocs) ? '0.3' : '1'}; cursor: ${(!isUnlocked || !hasReadDocs) ? 'not-allowed' : 'pointer'};">
                ${isUnlocked ? (hasReadDocs ? 'ENTER_EXAM' : 'LOCKED_UNTIL_READ') : 'LEVEL_LOCKED'}
            </button>
        `;
        grid.appendChild(card);
    });
}

// --- 5. CORE NAVIGATION & QUIZ ENGINE ---
window.navigate = function(screenId) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`${screenId}-screen`);
    if (target) target.classList.add('active');
    if (screenId === 'dashboard') renderLevels();
};

window.startQuiz = function(levelKey) {
    state.currentLevel = levelKey;
    state.currentQIndex = 0;
    state.score = 0;
    navigate('quiz');
    showQuestion();
};

// ... keep existing showQuestion, handleAnswer, and auth functions from previous block ...
