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
    streak: 0,
    lastCheckIn: null,
    hasMintedBadge: false 
};

// --- 2. NAVIGATION & UI ENGINE (Fixes the Launch Button) ---
window.navigate = function(screenId) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const target = document.getElementById(`${screenId}-screen`);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }

    // Refresh UI specifically for dashboard
    if (screenId === 'dashboard') renderLevels();
};

// --- 3. WALLET & DROPDOWN LOGIC ---
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

// Close dropdown if user clicks elsewhere
window.onclick = function(event) {
    if (!event.target.matches('.connect-btn-nav') && !event.target.matches('#btn-text')) {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
};

// --- 4. HYBRID LOGIN & OTP ---
window.handleEmailLogin = function() {
    const email = document.getElementById('email-input').value;
    if (!email || !email.includes('@')) return alert("Enter a valid architect email.");
    
    const modalContent = document.querySelector('#login-modal .card');
    modalContent.innerHTML = `
        <h2 style="font-family: 'Orbitron'; color: var(--arc-purple);">VERIFY_IDENTITY</h2>
        <p style="font-size: 0.8rem; margin-bottom: 20px; opacity: 0.7;">Enter the 6-digit code sent to ${email}</p>
        <input type="text" id="otp-input" placeholder="000000" maxlength="6" 
               style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--arc-purple); color: white; border-radius: 4px; text-align: center; font-size: 1.5rem; letter-spacing: 8px; margin-bottom: 20px;">
        <button class="launch-btn" onclick="verifyOTP('${email}')" style="width:100%; background:var(--arc-purple); color:white;">VALIDATE_SEQUENCE</button>
        <button class="back-link" onclick="location.reload()" style="margin-top:15px; background:none; border:none; color:gray; cursor:pointer; width:100%;">CANCEL</button>
    `;
};

window.verifyOTP = function(email) {
    const otp = document.getElementById('otp-input').value;
    if (otp.length !== 6) return alert("Invalid Sequence.");
    
    state.address = email.toLowerCase();
    state.isEmailUser = true;
    finalizeLogin();
};

function finalizeLogin() {
    const btnText = document.getElementById('btn-text');
    btnText.innerText = state.address.substring(0, 6).toUpperCase() + "...";
    toggleLoginModal(false);
    loadFromStorage();
    showToast("ACCOUNT_SYNC_COMPLETE");
}

// --- 5. DAILY CHECK-IN ---
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
        
        grid.innerHTML += `
            <div class="day-box ${isDone ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
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
        btn.innerText = "SIGNING...";
        btn.disabled = true;
        await new Promise(res => setTimeout(res, 1200)); // Simulated Network Latency

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

// --- 6. DASHBOARD & STORAGE ---
function renderLevels() {
    const grid = document.getElementById('levels-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // Simple mock levels
    for (let i = 1; i <= 5; i++) {
        const isLocked = i > state.unlockedLevels;
        grid.innerHTML += `
            <div class="card" style="opacity: ${isLocked ? '0.5' : '1'}; border: 1px solid ${isLocked ? 'gray' : 'var(--arc-purple)'}; padding: 20px; text-align: center;">
                <h3 style="font-family: 'Orbitron'; font-size: 0.8rem;">MODULE_0${i}</h3>
                <p style="font-size: 0.7rem; margin: 10px 0;">Agentic Economics Basics</p>
                <button class="launch-btn" ${isLocked ? 'disabled' : ''} style="font-size: 0.7rem; padding: 5px 10px;">
                    ${isLocked ? 'LOCKED' : 'ENTER'}
                </button>
            </div>
        `;
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = "position:fixed; bottom:20px; right:20px; background:var(--arc-purple); color:white; padding:10px 20px; border-radius:4px; font-family:'Orbitron'; font-size:0.8rem; z-index:9999;";
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function saveProfile() {
    if (state.address) {
        localStorage.setItem(`arc_user_${state.address}`, JSON.stringify(state));
    }
}

function loadFromStorage() {
    const saved = localStorage.getItem(`arc_user_${state.address}`);
    if (saved) {
        Object.assign(state, JSON.parse(saved));
        const today = new Date().toDateString();
        const dot = document.getElementById('checkin-dot');
        if (state.lastCheckIn === today) dot.classList.remove('active');
    }
}

window.disconnect = function() {
    state.address = null;
    location.reload();
};
