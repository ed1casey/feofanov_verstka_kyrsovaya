document.addEventListener('DOMContentLoaded', () => {
    const params = getUrlParams();
    const isFinished = params.finished === 'true';
    if (isFinished) {
        showPlayerResult();
    }
    loadLeaderboard();
    loadStats();
    setupEventHandlers();
});
function showPlayerResult() {
    const player = getCurrentPlayer();
    if (!player || player.isTeacher) return;
    const resultSection = $('#player-result');
    resultSection.classList.remove('hidden');
    $('#result-name').textContent = player.name;
    $('#result-score').textContent = player.score || 0;
    $('#result-levels').textContent = `${player.levelsCompleted || 0}/3`;
    const rank = getPlayerRank(player.name, player.score);
    $('#result-rank').textContent = `#${rank}`;
    resultSection.classList.add('slide-up');
}
function loadLeaderboard(filter = 'all') {
    const tbody = $('#leaderboard-body');
    const emptyState = $('#empty-leaderboard');
    const tableWrapper = $('.leaderboard-table-wrapper');
    const leaderboard = filterLeaderboard(filter);
    if (leaderboard.length === 0) {
        tableWrapper.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    tableWrapper.classList.remove('hidden');
    emptyState.classList.add('hidden');
    tbody.innerHTML = '';
    const currentPlayer = getCurrentPlayer();
    leaderboard.forEach((entry, index) => {
        const rank = index + 1;
        const row = document.createElement('tr');
        if (rank <= 3) {
            row.classList.add(`rank-${rank}`);
        }
        if (currentPlayer && entry.name === currentPlayer.name && entry.score === currentPlayer.score) {
            row.classList.add('current-player');
        }
        let rankDisplay = rank;
        if (rank === 1) rankDisplay = '<span class="rank-medal">1</span>';
        else if (rank === 2) rankDisplay = '<span class="rank-medal">2</span>';
        else if (rank === 3) rankDisplay = '<span class="rank-medal">3</span>';
        row.innerHTML = `
            <td class="col-rank">${rankDisplay}</td>
            <td class="col-name">${escapeHtml(entry.name)}</td>
            <td class="col-score">${entry.score}</td>
            <td class="col-levels">${entry.levelsCompleted || 0}/3</td>
            <td class="col-date">${formatDate(entry.date)}</td>
        `;
        tbody.appendChild(row);
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 50);
    });
}
function loadStats() {
    const stats = getGameStats();
    $('#total-players').textContent = stats.totalPlayers;
    $('#total-games').textContent = stats.totalGames;
    $('#avg-score').textContent = stats.avgScore;
    $('#max-score').textContent = stats.maxScore;
    animateCounter('total-players', stats.totalPlayers);
    animateCounter('total-games', stats.totalGames);
    animateCounter('avg-score', stats.avgScore);
    animateCounter('max-score', stats.maxScore);
}
function animateCounter(elementId, targetValue) {
    const element = $(`#${elementId}`);
    let current = 0;
    const increment = Math.ceil(targetValue / 30);
    const duration = 1000; 
    const stepTime = duration / (targetValue / increment);
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            current = targetValue;
            clearInterval(timer);
        }
        element.textContent = current;
    }, stepTime);
}
function setupEventHandlers() {
    const filterBtns = $$('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadLeaderboard(btn.dataset.filter);
        });
    });
    $('#play-again-btn').addEventListener('click', () => {
        resetCurrentPlayer();
        navigateTo('index.html');
    });
    $('#back-btn').addEventListener('click', () => {
        navigateTo('index.html');
    });
    $('#clear-data-btn').addEventListener('click', () => {
        $('#confirm-modal').classList.remove('hidden');
    });
    $('#confirm-clear').addEventListener('click', () => {
        clearLeaderboard();
        $('#confirm-modal').classList.add('hidden');
        loadLeaderboard();
        loadStats();
        showNotification('Рейтинг очищен');
    });
    $('#cancel-clear').addEventListener('click', () => {
        $('#confirm-modal').classList.add('hidden');
    });
    $('#confirm-modal').addEventListener('click', (e) => {
        if (e.target.id === 'confirm-modal') {
            $('#confirm-modal').classList.add('hidden');
        }
    });
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function showNotification(message) {
    const notification = createElement('div', {
        className: 'notification',
        text: message,
        styles: {
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--success)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            zIndex: '1000',
            animation: 'slideUp 0.3s ease'
        },
        parent: document.body
    });
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}