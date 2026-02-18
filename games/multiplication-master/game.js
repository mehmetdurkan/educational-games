// ─── Audio ───
const getAudioCtx = (() => {
    let ctx = null;
    return () => {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        return ctx;
    };
})();

function playTone(freqs, duration, type = "sine", volume = 0.25) {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    const now = ctx.currentTime;
    freqs.forEach(([freq, time]) => osc.frequency.setValueAtTime(freq, now + time));
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    osc.start(now);
    osc.stop(now + duration);
}

const playSuccess = () => playTone([[523, 0], [659, 0.15], [784, 0.3], [1047, 0.45]], 0.8);
const playBadge = () => playTone([[523, 0], [659, 0.15], [784, 0.3], [1047, 0.45], [1319, 0.6]], 1, "square");
const playFail = () => playTone([[600, 0], [400, 0.2], [600, 0.4], [400, 0.6]], 0.9);

// ─── Constants ───
const DTABLES = {
    mixed: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    easy: [2, 5, 10],
    medium: [3, 4, 6, 8],
    hard: [7, 9]
};

const ACH = {
    tables: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({
        id: `table_${n}`,
        icon: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"][n - 1],
        name: `Master of ${n}s`,
        table: n,
        target: 5
    })),
    streaks: [
        { id: "streak_5", icon: "🔥", name: "On Fire", target: 5 },
        { id: "streak_10", icon: "🔥🔥", name: "Unstoppable", target: 10 },
        { id: "streak_15", icon: "🔥🔥🔥", name: "Legendary Streak", target: 15 },
    ],
    totals: [
        { id: "total_10", icon: "⭐", name: "Quick Learner", target: 10 },
        { id: "total_25", icon: "⭐⭐", name: "Math Star", target: 25 },
        { id: "total_50", icon: "⭐⭐⭐", name: "Math Wizard", target: 50 },
        { id: "total_100", icon: "🌟", name: "Math Champion", target: 100 },
    ],
};

const STATUS_COLORS = {
    "new": { background: "#E0E0E0", border: "2px solid #BDBDBD", color: "#555" },
    "learning": { background: "#FFF9C4", border: "2px solid #FBC02D", color: "#555" },
    "needs-practice": { background: "#FFCDD2", border: "2px solid #E53935", color: "#C62828" },
    "mastered": { background: "#C8E6C9", border: "2px solid #43A047", color: "#2E7D32" },
};

// ─── State ───
let gameState = {
    difficulty: "mixed",
    customTables: [],
    history: {},
    recentQuestions: [],
    currentQuestion: null,
    locked: false,
    totalCorrect: 0,
    currentStreak: 0,
    maxStreak: 0,
    tableProgress: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    earnedBadges: new Set(),
    badgeQueue: []
};

// ─── Initialize History ───
function initHistory() {
    const h = {};
    for (let i = 1; i <= 9; i++) {
        for (let j = 1; j <= 9; j++) {
            h[`${i}x${j}`] = {
                correct: 0,
                incorrect: 0,
                dontKnow: 0,
                consecutiveCorrect: 0,
                totalAsked: 0,
                status: "new"
            };
        }
    }
    return h;
}

function calcStatus(p) {
    if (p.consecutiveCorrect >= 3 && p.correct >= 5) return "mastered";
    if (p.dontKnow > 0 || p.incorrect > p.correct) return "needs-practice";
    if (p.totalAsked > 0) return "learning";
    return "new";
}

// ─── Question Generation ───
function makeQuestion(diff, custom, hist, recent) {
    const tables = diff === "custom"
        ? (custom.length ? custom : DTABLES.mixed)
        : (DTABLES[diff] || DTABLES.mixed);

    const all = [];
    for (let i of tables) {
        for (let j of tables) {
            all.push({ num1: i, num2: j, key: `${i}x${j}` });
        }
    }

    let pool = all.filter(p => !recent.includes(p.key));
    if (!pool.length) pool = all;

    const by = (s, a) => a.filter(p => hist[p.key].status === s);
    const np = by("needs-practice", pool);
    const lp = by("learning", pool);
    const newp = by("new", pool);
    const mp = by("mastered", pool);

    const r = Math.random() * 100;
    let c;
    if (np.length && r < 60) c = np;
    else if (newp.length && r < 75) c = newp;
    else if (lp.length && r < 95) c = lp;
    else if (mp.length) c = mp;
    else c = pool.length ? pool : all;

    const p = c[Math.floor(Math.random() * c.length)];
    return { ...p, answer: p.num1 * p.num2 };
}

// ─── UI Updates ───
function updateStats() {
    const mastered = Object.values(gameState.history).filter(p => p.status === "mastered").length;
    document.getElementById("totalCorrect").textContent = gameState.totalCorrect;
    document.getElementById("masteredCount").textContent = `${mastered}/81`;
}

function updateStreakDisplay() {
    const s = gameState.currentStreak;
    const display = document.getElementById("streakDisplay");

    let text, fire;
    if (s === 0) {
        text = "Start your streak! 🌟";
        fire = false;
    } else if (s < 3) {
        text = `${s} in a row! Keep going! ⭐`;
        fire = false;
    } else if (s < 5) {
        text = `${s} in a row! On fire! 🔥`;
        fire = true;
    } else if (s < 10) {
        text = `${s} in a row! AMAZING! 🔥🔥`;
        fire = true;
    } else if (s < 15) {
        text = `${s} in a row! UNSTOPPABLE! 🔥🔥🔥`;
        fire = true;
    } else {
        text = `${s} in a row! LEGENDARY! 🔥🔥🔥🔥`;
        fire = true;
    }

    display.textContent = text;
    display.style.background = fire
        ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
        : "linear-gradient(135deg, #FFD700, #FFC107)";
    display.style.color = fire ? "white" : "#4E342E";
    display.style.animation = fire ? "sP 1.1s ease-in-out infinite" : "none";
    display.style.boxShadow = fire
        ? "0 4px 12px rgba(255, 100, 50, 0.3)"
        : "0 2px 8px rgba(255, 200, 0, 0.3)";
}

function renderBadges() {
    const renderBadge = (badge, cur, tgt) => {
        const earned = gameState.earnedBadges.has(badge.id);
        const pct = Math.min(100, (cur / tgt) * 100);

        const div = document.createElement("div");
        div.style.cssText = `
            display: flex; align-items: center; gap: 10px; padding: 10px 12px;
            border-radius: 10px; border: ${earned ? "2px solid #FFD700" : "2px solid #e0e0e0"};
            background: ${earned ? "linear-gradient(135deg, #FFFDE7, #FFE082)" : "white"};
            opacity: ${earned ? 1 : 0.65}; margin-bottom: 4px;
        `;

        const icon = document.createElement("span");
        icon.style.cssText = "font-size: 26px; min-width: 34px; text-align: center;";
        icon.textContent = badge.icon;

        const content = document.createElement("div");
        content.style.cssText = "flex: 1;";

        const name = document.createElement("div");
        name.style.cssText = "font-weight: bold; font-size: 13px;";
        name.textContent = badge.name;

        content.appendChild(name);

        if (earned) {
            const earnedText = document.createElement("div");
            earnedText.style.cssText = "font-size: 12px; color: #388E3C;";
            earnedText.textContent = "✓ Earned!";
            content.appendChild(earnedText);
        } else {
            const progress = document.createElement("div");
            progress.style.cssText = "font-size: 12px; color: #777;";
            progress.textContent = `${Math.min(cur, tgt)}/${tgt}`;
            content.appendChild(progress);

            const barBg = document.createElement("div");
            barBg.style.cssText = "background: #eeeeee; height: 5px; border-radius: 3px; margin-top: 3px; overflow: hidden;";

            const barFill = document.createElement("div");
            barFill.style.cssText = `width: ${pct}%; height: 100%; background: linear-gradient(90deg, #4CAF50, #AED581); transition: width 0.4s;`;

            barBg.appendChild(barFill);
            content.appendChild(barBg);
        }

        div.appendChild(icon);
        div.appendChild(content);
        return div;
    };

    // Tables
    const tablesContainer = document.getElementById("tablesBadges");
    tablesContainer.innerHTML = "";
    ACH.tables.forEach(b => {
        tablesContainer.appendChild(renderBadge(b, gameState.tableProgress[b.table], b.target));
    });

    // Streaks
    const streaksContainer = document.getElementById("streaksBadges");
    streaksContainer.innerHTML = "";
    ACH.streaks.forEach(b => {
        streaksContainer.appendChild(renderBadge(b, gameState.maxStreak, b.target));
    });

    // Totals
    const totalsContainer = document.getElementById("totalsBadges");
    totalsContainer.innerHTML = "";
    ACH.totals.forEach(b => {
        totalsContainer.appendChild(renderBadge(b, gameState.totalCorrect, b.target));
    });
}

function renderProgressGrid() {
    const grid = document.getElementById("progressGrid");
    grid.innerHTML = "";

    // Corner
    const corner = document.createElement("div");
    corner.style.cssText = "background: #E8F5E9; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; padding: 4px; color: #2E7D32;";
    corner.textContent = "×";
    grid.appendChild(corner);

    // Column headers
    for (let i = 1; i <= 9; i++) {
        const header = document.createElement("div");
        header.style.cssText = "background: #E8F5E9; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; padding: 4px; color: #2E7D32;";
        header.textContent = i;
        grid.appendChild(header);
    }

    // Rows
    for (let row = 1; row <= 9; row++) {
        // Row header
        const rowHeader = document.createElement("div");
        rowHeader.style.cssText = "background: #E8F5E9; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; padding: 4px; color: #2E7D32;";
        rowHeader.textContent = row;
        grid.appendChild(rowHeader);

        // Cells
        for (let col = 1; col <= 9; col++) {
            const key = `${row}x${col}`;
            const p = gameState.history[key];
            const ss = STATUS_COLORS[p.status] || STATUS_COLORS["new"];

            const cell = document.createElement("div");
            cell.className = "progress-cell";
            cell.style.cssText = `
                background: ${ss.background}; border: ${ss.border}; color: ${ss.color};
                border-radius: 4px; display: flex; align-items: center; justify-content: center;
                font-weight: bold; font-size: 10px; aspect-ratio: 1; cursor: default;
                transition: transform 0.15s;
            `;
            cell.textContent = row * col;
            cell.title = `${row}×${col}=${row * col}  ✓${p.correct} ✗${p.incorrect}${p.dontKnow ? ` ?${p.dontKnow}` : ""}`;

            grid.appendChild(cell);
        }
    }
}

// ─── Confetti ───
function showConfetti() {
    const container = document.getElementById("confetti");
    container.style.display = "block";
    container.innerHTML = "";

    for (let i = 0; i < 30; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.backgroundColor = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#F7DC6F", "#BB8FCE"][i % 6];
        piece.style.animationDelay = `${Math.random() * 0.4}s`;
        piece.style.animationDuration = `${0.9 + Math.random() * 0.6}s`;
        container.appendChild(piece);
    }

    setTimeout(() => {
        container.style.display = "none";
    }, 1600);
}

// ─── Badge Popup ───
function showBadgePopup(badge) {
    playBadge();
    const popup = document.getElementById("badgePopup");
    popup.style.display = "flex";
    popup.className = "badge-popup";
    popup.innerHTML = `
        <div class="badge-content">
            <div style="font-size: 64px; margin-bottom: 8px;">${badge.icon}</div>
            <div style="font-size: 22px; font-weight: bold; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                Achievement Unlocked!
            </div>
            <div style="font-size: 18px; color: #fff8e1; margin-top: 6px;">${badge.name}</div>
        </div>
    `;

    setTimeout(() => {
        popup.style.display = "none";
        processNextBadge();
    }, 2400);
}

function processNextBadge() {
    if (gameState.badgeQueue.length > 0) {
        const badge = gameState.badgeQueue.shift();
        showBadgePopup(badge);
    }
}

// ─── Check Achievements ───
function checkAchievements(nc, nms, ntp) {
    const newBadges = [];

    ACH.tables.forEach(b => {
        if (!gameState.earnedBadges.has(b.id) && ntp[b.table] >= b.target) {
            gameState.earnedBadges.add(b.id);
            newBadges.push(b);
        }
    });

    ACH.streaks.forEach(b => {
        if (!gameState.earnedBadges.has(b.id) && nms >= b.target) {
            gameState.earnedBadges.add(b.id);
            newBadges.push(b);
        }
    });

    ACH.totals.forEach(b => {
        if (!gameState.earnedBadges.has(b.id) && nc >= b.target) {
            gameState.earnedBadges.add(b.id);
            newBadges.push(b);
        }
    });

    if (newBadges.length > 0) {
        gameState.badgeQueue.push(...newBadges);
        if (gameState.badgeQueue.length === newBadges.length) {
            processNextBadge();
        }
    }
}

// ─── Feedback ───
function showFeedback(text, type) {
    const fb = document.getElementById("feedback");
    fb.textContent = text;
    fb.style.display = "block";
    fb.style.animation = "fadeIn 0.3s ease-out";

    if (type === "correct") {
        fb.style.background = "#E8F5E9";
        fb.style.color = "#2E7D32";
    } else if (type === "incorrect") {
        fb.style.background = "#FFEBEE";
        fb.style.color = "#C62828";
    } else if (type === "dontknow") {
        fb.style.background = "#FFF3E0";
        fb.style.color = "#E65100";
    } else {
        fb.style.background = "#FFF9C4";
        fb.style.color = "#F57C00";
    }
}

function hideFeedback() {
    document.getElementById("feedback").style.display = "none";
}

// ─── Next Question ───
function nextQuestion() {
    const q = makeQuestion(
        gameState.difficulty,
        gameState.customTables,
        gameState.history,
        gameState.recentQuestions
    );

    gameState.currentQuestion = q;
    gameState.locked = false;

    // Update history
    gameState.history[q.key].totalAsked++;

    // Update recent questions
    gameState.recentQuestions.push(q.key);
    if (gameState.recentQuestions.length > 5) {
        gameState.recentQuestions.shift();
    }

    // Update UI
    document.getElementById("question").textContent = `${q.num1} × ${q.num2} = ?`;
    document.getElementById("answerInput").value = "";
    document.getElementById("answerInput").disabled = false;
    document.getElementById("submitBtn").disabled = false;
    document.getElementById("dontKnowBtn").disabled = false;
    hideFeedback();

    setTimeout(() => document.getElementById("answerInput").focus(), 60);
}

// ─── Submit Answer ───
function submitAnswer() {
    if (gameState.locked || !gameState.currentQuestion) return;

    const input = document.getElementById("answerInput");
    const val = parseInt(input.value, 10);

    if (isNaN(val)) {
        showFeedback("Please enter a number!", "warn");
        return;
    }

    gameState.locked = true;
    input.disabled = true;
    document.getElementById("submitBtn").disabled = true;
    document.getElementById("dontKnowBtn").disabled = true;

    const q = gameState.currentQuestion;

    if (val === q.answer) {
        playSuccess();
        showConfetti();

        const nc = gameState.totalCorrect + 1;
        const ns = gameState.currentStreak + 1;
        const nms = Math.max(gameState.maxStreak, ns);
        const ntp = { ...gameState.tableProgress };
        ntp[q.num1]++;
        ntp[q.num2]++;

        gameState.totalCorrect = nc;
        gameState.currentStreak = ns;
        gameState.maxStreak = nms;
        gameState.tableProgress = ntp;

        const rec = gameState.history[q.key];
        rec.correct++;
        rec.consecutiveCorrect++;
        rec.status = calcStatus(rec);

        checkAchievements(nc, nms, ntp);

        const text = ns >= 5 ? "🎉 Correct! You're on fire! 🔥" : "🎉 Correct!";
        showFeedback(text, "correct");

        updateStats();
        updateStreakDisplay();
        renderBadges();
        renderProgressGrid();

        setTimeout(nextQuestion, 800);
    } else {
        playFail();
        gameState.currentStreak = 0;

        const rec = gameState.history[q.key];
        rec.incorrect++;
        rec.consecutiveCorrect = 0;
        rec.status = calcStatus(rec);

        showFeedback(`Not quite! The answer is ${q.answer}. Try the next one!`, "incorrect");

        updateStats();
        updateStreakDisplay();
        renderBadges();
        renderProgressGrid();

        setTimeout(nextQuestion, 1200);
    }
}

// ─── Don't Know ───
function dontKnow() {
    if (gameState.locked || !gameState.currentQuestion) return;

    gameState.locked = true;
    document.getElementById("answerInput").disabled = true;
    document.getElementById("submitBtn").disabled = true;
    document.getElementById("dontKnowBtn").disabled = true;

    playFail();
    gameState.currentStreak = 0;

    const q = gameState.currentQuestion;
    const rec = gameState.history[q.key];
    rec.dontKnow++;
    rec.consecutiveCorrect = 0;
    rec.status = calcStatus(rec);

    let ex = `${q.num1} × ${q.num2} = ${q.answer}\nThink of it as: ${q.num1} groups of ${q.num2}`;
    if (q.num1 <= 5 && q.num2 <= 5) {
        ex += "\n";
        for (let i = 0; i < q.num1; i++) {
            ex += "⚫".repeat(q.num2) + "  ";
        }
    }

    showFeedback(ex, "dontknow");

    updateStats();
    updateStreakDisplay();
    renderBadges();
    renderProgressGrid();

    setTimeout(nextQuestion, 2500);
}

// ─── Custom Tables ───
function setupCustomTables() {
    const grid = document.getElementById("customTablesGrid");
    grid.innerHTML = "";

    for (let n = 1; n <= 9; n++) {
        const label = document.createElement("label");
        label.style.cssText = `
            display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 8px;
            border: 2px solid ${gameState.customTables.includes(n) ? "#4CAF50" : "#ccc"};
            background: ${gameState.customTables.includes(n) ? "#E8F5E9" : "white"};
            cursor: pointer; font-weight: bold;
        `;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = gameState.customTables.includes(n);
        checkbox.onchange = (e) => {
            if (e.target.checked) {
                gameState.customTables.push(n);
            } else {
                gameState.customTables = gameState.customTables.filter(t => t !== n);
            }
            setupCustomTables();
        };

        const text = document.createTextNode(` ${n}`);
        label.appendChild(checkbox);
        label.appendChild(text);
        grid.appendChild(label);
    }
}

// ─── Initialize ───
function init() {
    gameState.history = initHistory();

    // Difficulty selector
    document.getElementById("difficulty").addEventListener("change", (e) => {
        gameState.difficulty = e.target.value;
        const customDiv = document.getElementById("customTables");
        customDiv.style.display = e.target.value === "custom" ? "block" : "none";
        nextQuestion();
    });

    // Setup custom tables
    setupCustomTables();

    // Answer input
    document.getElementById("answerInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") submitAnswer();
    });

    // Buttons
    document.getElementById("submitBtn").addEventListener("click", submitAnswer);
    document.getElementById("dontKnowBtn").addEventListener("click", dontKnow);

    // Initial render
    updateStats();
    updateStreakDisplay();
    renderBadges();
    renderProgressGrid();
    nextQuestion();
}

// Start the game
init();
