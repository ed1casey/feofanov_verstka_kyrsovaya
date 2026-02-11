const STORAGE_KEYS = {
    CURRENT_PLAYER: 'currentPlayer',
    LEADERBOARD: 'leaderboard',
    GAME_STATS: 'gameStats',
    THEME: 'gameTheme'
};
function saveCurrentPlayer(playerData) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(playerData));
}
function getCurrentPlayer() {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYER);
    return data ? JSON.parse(data) : null;
}
function createPlayer(name) {
    const isTeacherMode = name.toLowerCase() === 'teacher';
    const player = {
        name: isTeacherMode ? 'Преподаватель' : name,
        isTeacher: isTeacherMode,
        score: 0,
        currentLevel: 1,
        levelsCompleted: 0,
        startTime: new Date().toISOString(),
        levelScores: [0, 0, 0], 
        levelTimes: [0, 0, 0]   
    };
    saveCurrentPlayer(player);
    return player;
}
function updatePlayerScore(additionalScore) {
    const player = getCurrentPlayer();
    if (player) {
        player.score += additionalScore;
        saveCurrentPlayer(player);
    }
    return player;
}
function updatePlayerLevel(levelNumber, levelScore, levelTime) {
    const player = getCurrentPlayer();
    if (player) {
        player.levelScores[levelNumber - 1] = levelScore;
        player.levelTimes[levelNumber - 1] = levelTime;
        if (levelScore > 0) {
            player.levelsCompleted = Math.max(player.levelsCompleted, levelNumber);
        }
        if (levelNumber < 3) {
            player.currentLevel = levelNumber + 1;
        }
        saveCurrentPlayer(player);
    }
    return player;
}
function getLeaderboard() {
    const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    return data ? JSON.parse(data) : [];
}
function saveLeaderboard(leaderboard) {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
}
function addToLeaderboard(playerResult) {
    const leaderboard = getLeaderboard();
    const entry = {
        name: playerResult.name,
        score: playerResult.score,
        levelsCompleted: playerResult.levelsCompleted,
        date: new Date().toISOString(),
        levelScores: playerResult.levelScores || [0, 0, 0]
    };
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    const trimmedLeaderboard = leaderboard.slice(0, 50);
    saveLeaderboard(trimmedLeaderboard);
    const position = trimmedLeaderboard.findIndex(
        e => e.name === entry.name && e.score === entry.score && e.date === entry.date
    );
    return position + 1;
}
function getPlayerRank(playerName, playerScore) {
    const leaderboard = getLeaderboard();
    const index = leaderboard.findIndex(
        e => e.name === playerName && e.score === playerScore
    );
    return index >= 0 ? index + 1 : leaderboard.length + 1;
}
function filterLeaderboard(filter = 'all') {
    const leaderboard = getLeaderboard();
    const now = new Date();
    switch (filter) {
        case 'today':
            return leaderboard.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate.toDateString() === now.toDateString();
            });
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return leaderboard.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= weekAgo;
            });
        default:
            return leaderboard;
    }
}
function clearLeaderboard() {
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
}
function getGameStats() {
    const leaderboard = getLeaderboard();
    if (leaderboard.length === 0) {
        return {
            totalPlayers: 0,
            totalGames: 0,
            avgScore: 0,
            maxScore: 0
        };
    }
    const uniquePlayers = new Set(leaderboard.map(e => e.name));
    const totalScore = leaderboard.reduce((sum, e) => sum + e.score, 0);
    const avgScore = Math.round(totalScore / leaderboard.length);
    const maxScore = Math.max(...leaderboard.map(e => e.score));
    return {
        totalPlayers: uniquePlayers.size,
        totalGames: leaderboard.length,
        avgScore: avgScore,
        maxScore: maxScore
    };
}
function saveGameProgress(progress) {
    const player = getCurrentPlayer();
    if (player) {
        player.gameProgress = progress;
        saveCurrentPlayer(player);
    }
}
function getGameProgress() {
    const player = getCurrentPlayer();
    return player?.gameProgress || null;
}
function clearGameProgress() {
    const player = getCurrentPlayer();
    if (player) {
        delete player.gameProgress;
        saveCurrentPlayer(player);
    }
}
function finalizeGame() {
    const player = getCurrentPlayer();
    if (!player || player.isTeacher) {
        return null;
    }
    const totalScore = player.levelScores.reduce((sum, score) => sum + score, 0);
    player.score = totalScore;
    saveCurrentPlayer(player);
    const rank = addToLeaderboard(player);
    clearGameProgress();
    return {
        player: player,
        rank: rank
    };
}
function resetCurrentPlayer() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAYER);
}