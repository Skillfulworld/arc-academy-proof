// --- 1. GLOBAL STATE ---
let state = {
    address: null, 
    isEmailUser: false,
    unlockedLevels: 1,
    completedLevels: [],
    currentLevel: null,
    currentQIndex: 0,
    score: 0,
    visitedDocs: new Set(),
    streak: 0,
    lastCheckIn: null
};

// --- 2. THE DATABASE ---
const DB = {
    'Quiz 1': {
        name: "Arc House & Architects Program",
        link: "https://community.arc.network/public/externals/introducing-arc-house-and-the-architects-program-2026-03-31",
        questions: [
            { q: "What is Arc House primarily designed for?", options: ["Token trading", "Mining rewards", "Community collaboration and builder engagement", "NFT marketplace"], correct: "Community collaboration and builder engagement" },
            { q: "How does someone become an Architect in the program?", options: ["By submitting an application form", "By buying tokens", "By contributing and earning points through activity", "By staking assets"], correct: "By contributing and earning points through activity" },
            { q: "What is the main purpose of the Architects Program?", options: ["To distribute airdrops only", "To grow and support the ecosystem through contributors", "To control validators", "To reduce transaction fees"], correct: "To grow and support the ecosystem through contributors" },
            { q: "What do participants earn through their contributions?", options: ["Only tokens", "Only NFTs", "Points, reputation, and opportunities within the ecosystem", "Mining rewards"], correct: "Points, reputation, and opportunities within the ecosystem" },
            { q: "What kind of activities can increase your Architect level?", options: ["Only trading", "Posting content, attending events, and helping the community", "Just holding tokens", "Running nodes only"], correct: "Posting content, attending events, and helping the community" }
        ]
    },
    'Quiz 2': {
        name: "USDC on Arc – Capital Efficiency",
        link: "https://community.arc.network/public/externals/usdc-on-arc-a-capital-efficient-path-for-banks-2026-03-26",
        questions: [
            { q: "What is the main benefit of using USDC on Arc for banks?", options: ["Higher volatility", "Capital efficiency and faster settlement", "Increased transaction delays", "Manual reconciliation"], correct: "Capital efficiency and faster settlement" },
            { q: "How does Arc improve capital efficiency for financial institutions?", options: ["By increasing fees", "By locking funds longer", "By enabling near-instant settlement and reducing idle capital", "By limiting transactions"], correct: "By enabling near-instant settlement and reducing idle capital" },
            { q: "What role does USDC play in this system?", options: ["Governance token", "Mining reward", "Stable digital dollar for transactions and settlements", "NFT currency"], correct: "Stable digital dollar for transactions and settlements" },
            { q: "Why is instant settlement important for banks?", options: ["It increases paperwork", "It reduces liquidity needs and operational risk", "It slows down transactions", "It removes compliance"], correct: "It reduces liquidity needs and operational risk" },
            { q: "What makes Arc suitable for institutional adoption?", options: ["Meme coin ecosystem", "Unpredictable fees", "Stablecoin-native design with reliable infrastructure", "Anonymous transactions only"], correct: "Stablecoin-native design with reliable infrastructure" }
        ]
    },
    'Quiz 3': {
        name: "Agentic Economic Flow (ERC-8183)",
        link: "https://community.arc.network/public/externals/running-an-agentic-economic-flow-on-arc-with-erc-8183-2026-04-07",
        questions: [
            { q: "What is the main purpose of ERC-8183?", options: ["To create NFTs for transactions", "To standardize job + payment workflows onchain", "To reduce gas fees", "To enable token staking"], correct: "To standardize job + payment workflows onchain" },
            { q: "Which roles are the three main roles in the system?", options: ["Buyer, Seller, Miner", "User, Validator, Node", "Client, Provider, Evaluator", "Creator, Holder, Trader"], correct: "Client, Provider, Evaluator" },
            { q: "What happens to funds when a job is created?", options: ["Sent directly to provider", "Burned temporarily", "Locked in escrow until completion", "Split among validators"], correct: "Locked in escrow until completion" },
            { q: "What determines whether payment is released or refunded?", options: ["Gas fees", "Time alone", "Evaluator decision", "Network congestion"], correct: "Evaluator decision" },
            { q: "What makes this system suitable for AI agents as well?", options: ["It uses NFTs", "It supports automated verification and execution", "It removes blockchain usage", "It requires manual approval only"], correct: "It supports automated verification and execution" }
        ]
    },
    'Quiz 4': {
        name: "Preparing Blockchains for Q-Day",
        link: "https://community.arc.network/public/externals/preparing-blockchains-for-q-day-2026-04-02",
        questions: [
            { q: "What does “Q-Day” refer to?", options: ["The day Ethereum upgrades", "The moment quantum computers break current cryptography", "A new blockchain launch", "A global crypto regulation event"], correct: "The moment quantum computers break current cryptography" },
            { q: "Why are current blockchains vulnerable to Q-Day?", options: ["High gas fees", "Weak smart contracts", "Use of cryptographic algorithms that quantum computers can break", "Lack of decentralization"], correct: "Use of cryptographic algorithms that quantum computers can break" },
            { q: "Which type of cryptography is considered safer against quantum attacks?", options: ["Symmetric cryptography", "Hash functions only", "Post-quantum cryptography", "RSA encryption"], correct: "Post-quantum cryptography" },
            { q: "What is a key challenge in upgrading blockchains for quantum resistance?", options: ["Lack of users", "Too many tokens", "Migrating existing wallets and keys securely", "Low transaction speed"], correct: "Migrating existing wallets and keys securely" },
            { q: "What is Arc’s approach to Q-Day readiness?", options: ["Ignore quantum risks", "Replace all tokens", "Design systems that can adapt to new cryptographic standards", "Stop using encryption"], correct: "Design systems that can adapt to new cryptographic standards" }
        ]
    },
    'Quiz 5': {
        name: "Circle AI Skills",
        link: "https://community.arc.network/public/blogs/circle-ai-skills",
        questions: [
            { q: "What is the main focus of Circle AI Skills?", options: ["Teaching blockchain mining", "Developing AI-related skills for the future economy", "Creating NFTs", "Trading strategies"], correct: "Developing AI-related skills for the future economy" },
            { q: "Why are AI skills important in this ecosystem?", options: ["For gaming only", "To support agent-based economic systems and automation", "To reduce blockchain usage", "To replace stablecoins"], correct: "To support agent-based economic systems and automation" },
            { q: "What type of economy is being emphasized?", options: ["Manual labor economy", "Token speculation economy", "Agentic and AI-driven digital economy", "Traditional banking only"], correct: "Agentic and AI-driven digital economy" },
            { q: "How can users benefit from learning AI skills?", options: ["Only through airdrops", "By building, contributing, and accessing new opportunities", "By avoiding blockchain", "By mining tokens"], correct: "By building, contributing, and accessing new opportunities" },
            { q: "What is the long-term vision of combining AI and blockchain?", options: ["Replace the internet", "Create isolated systems", "Enable autonomous, scalable economic interactions", "Eliminate digital payments"], correct: "Enable autonomous, scalable economic interactions" }
        ]
    }
};

// --- 3. UTILS ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- 4. NAVIGATION ---
window.navigate = function(screenId) {
    document.querySelectorAll('.page-section').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none'; 
    });
    
    const targetId = screenId.includes('-screen') ? screenId : `${screenId}-screen`;
    const target = document.getElementById(targetId);
    
    if (target) {
        target.classList.add('active');
        target.style.display = 'flex'; 
        if (screenId === 'dashboard') renderLevels();
    }
};

window.openDoc = function(levelKey, url) {
    state.visitedDocs.add(levelKey);
    window.open(url, '_blank');
    renderLevels(); 
};

function renderLevels() {
    const grid = document.getElementById('levels-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const keys = Object.keys(DB);
    keys.forEach((key, index) => {
        const levelNum = index + 1;
        const isUnlocked = levelNum <= state.unlockedLevels;
        const hasRead = state.visitedDocs.has(key);
        const data = DB[key];

        const card = document.createElement('div');
        card.className = 'card';
        card.style.cssText = `opacity: ${isUnlocked ? '1' : '0.4'}; border: 1px solid ${isUnlocked ? 'var(--arc-purple)' : 'var(--border)'};`;
        
        card.innerHTML = `
            <h3 style="font-family: 'Orbitron'; font-size: 0.85rem;">MODULE_0${levelNum}</h3>
            <p style="font-size: 0.7rem; color: #888; margin-bottom: 15px;">${data.name}</p>
            <div style="display: flex; gap: 10px;">
                <button class="connect-btn-nav" onclick="openDoc('${key}', '${data.link}')" 
                        style="flex: 1; ${!isUnlocked ? 'display:none;' : ''}">
                    ${hasRead ? '✅ READ' : 'READ'}
                </button>
                <button class="launch-btn" ${(!isUnlocked || !hasRead) ? 'disabled' : ''} onclick="startQuiz('${key}')" 
                        style="flex: 1;">
                    START
                </button>
            </div>`;
        grid.appendChild(card);
    });
}

// --- 5. QUIZ ENGINE ---
window.startQuiz = function(levelKey) {
    state.currentLevel = levelKey;
    state.currentQIndex = 0;
    state.score = 0;
    navigate('quiz');
    showQuestion();
};

function showQuestion() {
    const quizData = DB[state.currentLevel];
    const qData = quizData.questions[state.currentQIndex];
    
    document.getElementById('quiz-level-name').innerText = state.currentLevel.toUpperCase();
    document.getElementById('q-text').innerText = qData.q;
    
    const shuffledOptions = shuffleArray([...qData.options]);
    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = '';
    
    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'launch-btn';
        btn.style.cssText = "width: 100%; margin-bottom: 10px; text-align: left; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); text-transform: none; font-weight: 400;";
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(opt, qData.correct);
        optionsList.appendChild(btn);
    });

    document.getElementById('success-box').style.display = 'none';
    document.getElementById('ngmi-box').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
}

window.handleAnswer = function(selectedOption, correctOption) {
    const isCorrect = selectedOption === correctOption;
    document.querySelectorAll('#options-list .launch-btn').forEach(b => b.disabled = true);
    
    if (isCorrect) {
        state.score++;
        document.getElementById('success-box').style.display = 'block';
    } else {
        document.getElementById('ngmi-box').style.display = 'block';
    }
    document.getElementById('next-btn').style.display = 'block';
};

window.handleNext = function() {
    state.currentQIndex++;
    if (state.currentQIndex < DB[state.currentLevel].questions.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
};

function finishQuiz() {
    const total = DB[state.currentLevel].questions.length;
    if (state.score === total) {
        const currentIndex = Object.keys(DB).indexOf(state.currentLevel) + 1;
        if (state.unlockedLevels === currentIndex) {
            state.unlockedLevels++;
        }
        showToast("MASTERY_ACHIEVED: LEVEL_UNLOCKED");
    } else {
        showToast(`SCORE: ${state.score}/${total}. TRY AGAIN.`);
    }
    navigate('dashboard');
}

// --- 6. CHECK-IN LOGIC ---
window.toggleCheckinModal = function(show) {
    const modal = document.getElementById('checkin-modal');
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
        if (show) renderCheckinGrid();
    }
};

function renderCheckinGrid() {
    const grid = document.getElementById('checkin-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // Simulate 7-day grid
    for (let i = 1; i <= 7; i++) {
        const box = document.createElement('div');
        box.className = 'day-box';
        // Logic: if current day is 1 and streak is 0, Day 1 is "current"
        if (i <= state.streak) box.classList.add('completed');
        if (i === state.streak + 1) box.classList.add('current');
        
        box.innerHTML = `<div style="font-size:0.6rem; opacity:0.6;">DAY</div><div>${i}</div>`;
        grid.appendChild(box);
    }
}

window.processCheckIn = function() {
    const dot = document.getElementById('checkin-dot');
    state.streak++;
    if (dot) dot.classList.remove('active');
    showToast(`PROTOCOL_SYNC_COMPLETE: STREAK ${state.streak}`);
    toggleCheckinModal(false);
};

// --- 7. AUTH & UI ---
window.handleWalletAction = function() {
    if (!state.address) document.getElementById('login-modal').style.display = 'flex';
    else document.getElementById('profile-dropdown').classList.toggle('show');
};

window.handleEmailLogin = function() {
    state.address = "ARCHITECT_0x1";
    document.getElementById('btn-text').innerText = "0x1...ARCH";
    document.getElementById('login-modal').style.display = 'none';
    navigate('dashboard');
};

function showToast(m) {
    const t = document.createElement('div');
    t.style.cssText = "position:fixed; bottom:20px; right:20px; background:var(--arc-purple); color:white; padding:12px; border-radius:4px; font-family:'Orbitron'; z-index:9999; font-size:0.7rem; border: 1px solid white;";
    t.innerText = m;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
