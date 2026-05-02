const state = {
    walletConnected: false,
    unlockedLevels: 1,
    completedLevels: [],
    currentLevel: null,
    visitedDocs: new Set(),
    score: 0
};

// Real EIP-1193 Wallet Connection
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            state.walletConnected = true;
            console.log("Connected:", accounts[0]);
            showScreen('dashboard-screen');
            renderDashboard();
        } catch (error) {
            alert("Connection refused.");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ... Rest of your render and quiz logic goes here
