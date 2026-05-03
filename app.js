// Function to change "Pages"
function navigate(pageId) {
    window.location.hash = pageId;
}

// Listener that detects when the URL hash changes (or back button is pressed)
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'landing';
    
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show the targeted section
    const activeSection = document.getElementById(hash + '-screen');
    if (activeSection) {
        activeSection.classList.add('active');
    }
});

// Initialize the app on the correct page
window.dispatchEvent(new HashChangeEvent('hashchange'));
const DB = {
    level1: {
        title: "Arc House & Architects",
        subtitle: "Community & Contribution",
        docLink: "https://community.arc.network/public/externals/introducing-arc-house-and-the-architects-program-2026-03-31",
        questions: [
            { question: "What is Arc House primarily designed for?", options: ["Token trading", "Mining rewards", "Community collaboration and builder engagement", "NFT marketplace"], correct_answer: "Community collaboration and builder engagement", ngmi: "Arc House is about the builders, not just the tickers. Focus on the community." },
            { question: "How does someone become an Architect in the program?", options: ["By submitting an application form", "By buying tokens", "By contributing and earning points through activity", "By staking assets"], correct_answer: "By contributing and earning points through activity", ngmi: "You can't buy status here. You earn it through sweat equity and contribution." },
            { question: "What is the main purpose of the Architects Program?", options: ["To distribute airdrops only", "To grow and support the ecosystem through contributors", "To control validators", "To reduce transaction fees"], correct_answer: "To grow and support the ecosystem through contributors", ngmi: "It's about sustainable growth, not just a one-time drop." },
            { question: "What do participants earn through their contributions?", options: ["Only tokens", "Only NFTs", "Points, reputation, and opportunities within the ecosystem", "Mining rewards"], correct_answer: "Points, reputation, and opportunities within the ecosystem", ngmi: "In the agentic economy, reputation is the ultimate currency." },
            { question: "What kind of activities can increase your Architect level?", options: ["Only trading", "Posting content, attending events, and helping the community", "Just holding tokens", "Running nodes only"], correct_answer: "Posting content, attending events, and helping the community", ngmi: "Passive holding isn't enough. Get active or get left behind." }
        ]
    },
    level2: {
        title: "USDC on Arc",
        subtitle: "Capital Efficiency for Banks",
        docLink: "https://community.arc.network/public/externals/usdc-on-arc-a-capital-efficient-path-for-banks-2026-03-26",
        questions: [
            { question: "What is the main benefit of using USDC on Arc for banks?", options: ["Higher volatility", "Capital efficiency and faster settlement", "Increased transaction delays", "Manual reconciliation"], correct_answer: "Capital efficiency and faster settlement", ngmi: "Banks hate idle money. Speed is the game." },
            { question: "How does Arc improve capital efficiency for financial institutions?", options: ["By increasing fees", "By locking funds longer", "By enabling near-instant settlement and reducing idle capital", "By limiting transactions"], correct_answer: "By enabling near-instant settlement and reducing idle capital", ngmi: "Instant settlement means your money works 24/7." },
            { question: "What role does USDC play in this system?", options: ["Governance token", "Mining reward", "Stable digital dollar for transactions and settlements", "NFT currency"], correct_answer: "Stable digital dollar for transactions and settlements", ngmi: "USDC is the fuel for stable institutional flow." },
            { question: "Why is instant settlement important for banks?", options: ["It increases paperwork", "It reduces liquidity needs and operational risk", "It slows down transactions", "It removes compliance"], correct_answer: "It reduces liquidity needs and operational risk", ngmi: "Less time in transit means less risk of something breaking." },
            { question: "What makes Arc suitable for institutional adoption?", options: ["Meme coin ecosystem", "Unpredictable fees", "Stablecoin-native design with reliable infrastructure", "Anonymous transactions only"], correct_answer: "Stablecoin-native design with reliable infrastructure", ngmi: "Institutions don't want memes; they want native stability." }
        ]
    },
    level3: {
        title: "Agentic Economic Flow",
        subtitle: "ERC-8183 Mastery",
        docLink: "https://community.arc.network/public/externals/running-an-agentic-economic-flow-on-arc-with-erc-8183-2026-04-07",
        questions: [
            { question: "What is the main purpose of ERC-8183?", options: ["To create NFTs for transactions", "To standardize job + payment workflows onchain", "To reduce gas fees", "To enable token staking"], correct_answer: "To standardize job + payment workflows onchain", ngmi: "Standardization is what allows agents to 'talk' to each other's wallets." },
            { question: "Which of the following are the three main roles in the system?", options: ["Buyer, Seller, Miner", "User, Validator, Node", "Client, Provider, Evaluator", "Creator, Holder, Trader"], correct_answer: "Client, Provider, Evaluator", ngmi: "The Holy Trinity of Agentic Flow: Client, Provider, and the Evaluator who confirms it." },
            { question: "What happens to funds when a job is created?", options: ["Sent directly to provider", "Burned temporarily", "Locked in escrow until completion", "Split among validators"], correct_answer: "Locked in escrow until completion", ngmi: "Escrow ensures nobody gets rugged. Trustless execution 101." },
            { question: "What determines whether payment is released or refunded?", options: ["Gas fees", "Time alone", "Evaluator decision", "Network congestion"], correct_answer: "Evaluator decision", ngmi: "The Evaluator is the judge. No proof, no pay." },
            { question: "What makes this system suitable for AI agents as well?", options: ["It uses NFTs", "It supports automated verification and execution", "It removes blockchain usage", "It requires manual approval only"], correct_answer: "It supports automated verification and execution", ngmi: "Agents don't wait for clicks. They need automated verification." }
        ]
    },
    level4: {
        title: "Quantum Prep (Q-Day)",
        subtitle: "Cryptography & Resilience",
        docLink: "https://community.arc.network/public/externals/preparing-blockchains-for-q-day-2026-04-02",
        questions: [
            { question: "What does 'Q-Day' refer to?", options: ["The day Ethereum upgrades", "The moment quantum computers break current cryptography", "A new blockchain launch", "A global crypto regulation event"], correct_answer: "The moment quantum computers break current cryptography", ngmi: "Q-Day is the 'Boss Battle' for blockchain security." },
            { question: "Why are current blockchains vulnerable to Q-Day?", options: ["High gas fees", "Weak smart contracts", "Use of cryptographic algorithms that quantum computers can break", "Lack of decentralization"], correct_answer: "Use of cryptographic algorithms that quantum computers can break", ngmi: "Modern math won't save you from quantum processing. We need new tech." },
            { question: "Which type of cryptography is considered safer against quantum attacks?", options: ["Symmetric cryptography", "Hash functions only", "Post-quantum cryptography", "RSA encryption"], correct_answer: "Post-quantum cryptography", ngmi: "PQC is the only way forward. Everything else is toast." },
            { question: "What is a key challenge in upgrading blockchains for quantum resistance?", options: ["Lack of users", "Too many tokens", "Migrating existing wallets and keys securely", "Low transaction speed"], correct_answer: "Migrating existing wallets and keys securely", ngmi: "It's like heart surgery for the network. Migration is hard." },
            { question: "What is Arc's approach to Q-Day readiness?", options: ["Ignore quantum risks", "Replace all tokens", "Design systems that can adapt to new cryptographic standards", "Stop using encryption"], correct_answer: "Design systems that can adapt to new cryptographic standards", ngmi: "Adaptability is survival. Arc is built to evolve." }
        ]
    },
    level5: {
        title: "Circle AI Skills",
        subtitle: "The AI-Driven Economy",
        docLink: "https://community.arc.network/public/blogs/circle-ai-skills",
        questions: [
            { question: "What is the main focus of Circle AI Skills?", options: ["Teaching blockchain mining", "Developing AI-related skills for the future economy", "Creating NFTs", "Trading strategies"], correct_answer: "Developing AI-related skills for the future economy", ngmi: "The future isn't just code; it's agentic AI skills." },
            { question: "Why are AI skills important in this ecosystem?", options: ["For gaming only", "To support agent-based economic systems and automation", "To reduce blockchain usage", "To replace stablecoins"], correct_answer: "To support agent-based economic systems and automation", ngmi: "If you don't know AI, you can't build for the Agentic Economy." },
            { question: "What type of economy is being emphasized?", options: ["Manual labor economy", "Token speculation economy", "Agentic and AI-driven digital economy", "Traditional banking only"], correct_answer: "Agentic and AI-driven digital economy", ngmi: "We are moving past human-only labor to agent-driven scale." },
            { question: "How can users benefit from learning AI skills?", options: ["Only through airdrops", "By building, contributing, and accessing new opportunities", "By avoiding blockchain", "By mining tokens"], correct_answer: "By building, contributing, and accessing new opportunities", ngmi: "Skill up or stay behind. Builders get the opportunities." },
            { question: "What is the long-term vision of combining AI and blockchain?", options: ["Replace the internet", "Create isolated systems", "Enable autonomous, scalable economic interactions", "Eliminate digital payments"], correct_answer: "Enable autonomous, scalable economic interactions", ngmi: "Blockchain provides the trust; AI provides the scale. It's the ultimate combo." }
        ]
    }
};

let state = {
    walletConnected: false,
    unlockedLevels: 1,
    completedLevels: [],
    currentLevel: null,
    currentQIndex: 0,
    score: 0,
    visitedDocs: new Set()
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

async function connectWallet() {
    console.log("Connect Wallet Triggered");
    const btn = document.getElementById('btn-text');
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            state.walletConnected = true;
            const short = accounts[0].substring(0,6) + "..." + accounts[0].substring(38);
            if(btn) btn.innerText = short;
        } catch (e) { console.error("Wallet connection failed", e); }
    } else { alert("MetaMask not found!"); }
}

function renderDashboard() {
    const grid = document.getElementById('levels-grid');
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
                <span style="font-family:Orbitron; font-size:0.7rem; color:var(--arc-accent)">LEVEL 0${lvlNum}</span>
                ${isComp ? '<span class="status">✓ VERIFIED</span>' : ''}
            </div>
            <h3 style="margin-bottom:5px;">${lvl.title}</h3>
            <p style="font-size:0.8rem; opacity:0.7; margin-bottom:15px;">${lvl.subtitle}</p>
            <div style="display:flex; gap:10px;">
                <a href="${lvl.docLink}" target="_blank" class="connect-btn-nav" style="flex:1; text-align:center; text-decoration:none;" onclick="state.visitedDocs.add('${key}'); renderDashboard();">DOCS</a>
                <button class="launch-btn" style="flex:1; padding:10px; font-size:0.7rem;" onclick="startQuiz('${key}')" ${isLocked || !state.visitedDocs.has(key) ? 'disabled' : ''}>
                    ${isLocked ? 'LOCKED' : (isComp ? 'RETRY' : 'START')}
                </button>
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
    showScreen('quiz-screen');
    loadQuestion();
}

function loadQuestion() {
    const q = DB[state.currentLevel].questions[state.currentQIndex];
    document.getElementById('quiz-level-name').innerText = DB[state.currentLevel].title;
    document.getElementById('q-text').innerText = q.question;
    const list = document.getElementById('options-list');
    list.innerHTML = '';
    q.options.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'option-btn';
        b.innerText = opt;
        b.onclick = () => {
            const btns = document.querySelectorAll('.option-btn');
            btns.forEach(btn => btn.disabled = true);
            if(opt === q.correct_answer) {
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
    if(state.currentQIndex < DB[state.currentLevel].questions.length) loadQuestion();
    else showResults();
}

function showResults() {
    showScreen('results-screen');
    const total = DB[state.currentLevel].questions.length;
    const pct = (state.score / total) * 100;
    document.getElementById('final-score-num').innerText = Math.round(pct);
    const mainBtn = document.getElementById('result-main-btn');
    if(pct === 100) {
        document.getElementById('result-verdict').innerText = "VERIFIED_ARCHITECT";
        document.getElementById('result-msg').innerText = "Module complete. Your contribution footprint has been expanded.";
        mainBtn.innerText = "UNLOCK NEXT LEVEL";
        mainBtn.onclick = () => {
            if(!state.completedLevels.includes(state.currentLevel)) {
                state.completedLevels.push(state.currentLevel);
                state.unlockedLevels = Math.min(5, state.completedLevels.length + 1);
            }
            renderDashboard(); showScreen('dashboard-screen');
        };
    } else {
        document.getElementById('result-verdict').innerText = "STATUS: NGMI";
        document.getElementById('result-msg').innerText = "Accuracy is required. Review the intel and try again.";
        mainBtn.innerText = "RETRY MODULE";
        mainBtn.onclick = () => startQuiz(state.currentLevel);
    }
}
