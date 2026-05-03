// --- 1. GLOBAL STATE UPDATED ---
let state = {
    address: null, 
    isEmailUser: false,
    profile: { username: '', email: '', x: '', discord: '' },
    unlockedLevels: 1,
    completedLevels: [],
    currentLevel: null,
    currentQIndex: 0,
    score: 0,
    visitedDocs: new Set(),
    // New Web3 Features
    streak: 0,
    lastCheckIn: null,
    hasMintedBadge: false 
};

// --- 2. NOTIFICATION SYSTEM ---
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- 3. HYBRID LOGIN & OTP SIMULATION ---
window.handleEmailLogin = function() {
    const email = document.getElementById('email-input').value;
    if (!email || !email.includes('@')) return alert("Enter a valid architect email.");
    
    // Change Modal UI to OTP Mode
    const modalContent = document.getElementById('login-content');
    modalContent.innerHTML = `
        <h2 style="font-family: 'Orbitron'; color: var(--arc-purple);">VERIFY_IDENTITY</h2>
        <p style="font-size: 0.8rem; margin-bottom: 20px; opacity: 0.7;">Enter the 6-digit code sent to ${email}</p>
        <input type="text" id="otp-input" placeholder="000000" maxlength="6" 
               style="width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--arc-purple); color: white; border-radius: 4px; text-align: center; font-size: 1.5rem; letter-spacing: 8px; margin-bottom: 20px;">
        <button class="launch-btn" onclick="verifyOTP('${email}')" style="width:100%;">VALIDATE_SEQUENCE</button>
        <button class="back-link" onclick="location.reload()" style="margin-top:15px;">CANCEL</button>
    `;
};

window.verifyOTP = function(email) {
    const otp = document.getElementById('otp-input').value;
    if (otp.length !== 6) return alert("Invalid Sequence.");
    
    state.address = email.toLowerCase();
    state.isEmailUser = true;
    finalizeLogin();
    showToast("ACCOUNT_SYNC_COMPLETE");
};

// --- 4. DAILY CHECK-IN & TESTNET TRANSACTION ---
window.toggleCheckinModal = function(show) {
    const modal = document.getElementById('checkin-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
    if (show) renderCheckinGrid();
};

function renderCheckinGrid() {
    const grid = document.getElementById('checkin-grid');
    grid.innerHTML = '';
    const today = new Date().toDateString();
    
    for (let i = 1; i <= 7; i++) {
        const isDone = i <= state.streak;
        const isCurrent = (i === state.streak + 1) && (state.lastCheckIn !== today);
        
        grid.innerHTML += `
            <div class="day-box ${isDone ? 'completed' : ''} ${isCurrent ? 'current' : ''}" 
                 style="padding: 10px; border: 1px solid ${isDone ? 'var(--arc-purple)' : 'rgba(255,255,255,0.1)'}; text-align: center; border-radius: 4px;">
                <div style="font-size: 0.6rem; opacity: 0.6;">DAY ${i}</div>
                <div style="font-family: Orbitron; font-size: 0.8rem; margin-top: 5px;">${i * 10}</div>
                <div style="font-size: 0.5rem; color: var(--arc-purple);">PTS</div>
            </div>`;
    }
}

window.processCheckIn = async function() {
    const today = new Date().toDateString();
    if (state.lastCheckIn === today) return showToast("SEQUENCE_ALREADY_SYNCED_TODAY");

    const btn = document.getElementById('checkin-btn');
    const originalText = btn.innerText;

    try {
        btn.innerText = "SIGNING_ON_ARC_TESTNET...";
        btn.disabled = true;

        if (window.ethereum && !state.isEmailUser) {
            const txParams = {
                to: '0x0000000000000000000000000000000000000000',
                from: state.address,
                value: '0x0', 
                gas: '0x5208' // Approx 21k gas
            };
            await window.ethereum.request({ method: 'eth_sendTransaction', params: [txParams] });
        } else {
            // Simulated cloud-wallet signature for email users
            await new Promise(res => setTimeout(res, 1500));
        }

        state.streak = (state.streak >= 7) ? 1 : state.streak + 1;
        state.lastCheckIn = today;
        
        document.getElementById('checkin-dot').classList.remove('active');
        showToast(`SYNC_SUCCESS: DAY ${state.streak} STREAK`);
        toggleCheckinModal(false);
        saveProfile();
    } catch (e) {
        showToast("ERR: TRANSACTION_REJECTED");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

// --- 5. UPDATED RESULTS & BADGE MINTING ---
function showResults() {
    navigate('results');
    const total = DB[state.currentLevel].questions.length;
    const pct = (state.score / total) * 100;
    document.getElementById('final-score-num').innerText = Math.round(pct);
    const mainBtn = document.getElementById('result-main-btn');
    
    if (pct === 100) {
        document.getElementById('result-verdict').innerText = "VERIFIED_ARCHITECT";
        mainBtn.innerText = "MINT COMPLETION BADGE";
        mainBtn.onclick = () => mintLevelBadge();
    } else {
        document.getElementById('result-verdict').innerText = "STATUS: NGMI";
        mainBtn.innerText = "RETRY MODULE";
        mainBtn.onclick = () => startQuiz(state.currentLevel);
    }
}

async function mintLevelBadge() {
    const mainBtn = document.getElementById('result-main-btn');
    mainBtn.innerText = "MINTING_NFT...";
    mainBtn.disabled = true;

    // Simulate Minting Tx
    await new Promise(res => setTimeout(res, 2000));

    if (!state.completedLevels.includes(state.currentLevel)) {
        state.completedLevels.push(state.currentLevel);
        state.unlockedLevels = Math.min(5, state.completedLevels.length + 1);
        state.hasMintedBadge = true; // Tracks that the latest level is fully "on-chain"
        saveProfile(); 
    }

    showToast("BADGE_MINTED_SUCCESSFULLY");
    mainBtn.disabled = false;
    navigate('dashboard');
}

// --- 6. STORAGE & PERSISTENCE ---
function saveProfile() {
    if (state.address) {
        localStorage.setItem(`arc_user_${state.address}`, JSON.stringify({
            completedLevels: state.completedLevels,
            unlockedLevels: state.unlockedLevels,
            isEmailUser: state.isEmailUser,
            profile: state.profile,
            streak: state.streak,
            lastCheckIn: state.lastCheckIn
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
        state.streak = data.streak || 0;
        state.lastCheckIn = data.lastCheckIn || null;
        
        // Notification dot check
        const today = new Date().toDateString();
        const dot = document.getElementById('checkin-dot');
        if (state.lastCheckIn === today) dot.classList.remove('active');
    }
}

// Rest of your existing functions (navigate, updateUI, disconnect, etc.) remain the same
