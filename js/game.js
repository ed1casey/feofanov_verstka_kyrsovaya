const Game = {
    state: {
        player: null,
        currentLevel: 1,
        totalScore: 0,
        levelScores: [0, 0, 0],
        levelTimes: [0, 0, 0],
        timeRemaining: 0,
        timerInterval: null,
        isPaused: false,
        isGameOver: false,
        startTime: null,
        isTeacherMode: false
    },
    init() {
        this.state.player = getCurrentPlayer();
        if (!this.state.player) {
            navigateTo('index.html');
            return;
        }
        this.state.isTeacherMode = this.state.player.isTeacher;
        this.setupUI();
        this.setupEventHandlers();
        if (this.state.isTeacherMode) {
            this.showTeacherPanel();
        }
        this.startLevel(this.state.player.currentLevel || 1);
    },
    setupUI() {
        $('#player-name-display').textContent = this.state.player.name;
        initTheme();
    },
    setupEventHandlers() {
        $('#pause-btn').addEventListener('click', () => this.togglePause());
        $('#exit-btn').addEventListener('click', () => this.confirmExit());
        $('#resume-btn').addEventListener('click', () => this.togglePause());
        $('#quit-btn').addEventListener('click', () => this.quitToMenu());
        $('#next-level-btn').addEventListener('click', () => this.nextLevel());
        $('#retry-btn').addEventListener('click', () => this.retryLevel());
        $('#restart-btn').addEventListener('click', () => this.restartGame());
        $('#menu-btn').addEventListener('click', () => this.quitToMenu());
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'p') {
                this.togglePause();
            }
            if (e.key === 'Escape') {
                if (this.state.isPaused) {
                    this.togglePause();
                } else {
                    this.confirmExit();
                }
            }
        });
        window.addEventListener('beforeunload', (e) => {
            if (!this.state.isGameOver && !this.state.isTeacherMode) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    },
    showTeacherPanel() {
        const panel = $('#teacher-panel');
        panel.classList.remove('hidden');
        const teacherBtns = panel.querySelectorAll('.teacher-btn[data-level]');
        teacherBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const level = parseInt(btn.dataset.level);
                this.startLevel(level);
            });
        });
    },
    cleanupAllLevels() {
        Level1.cleanup();
        Level2.cleanup();
        Level3.cleanup();
    },
    startLevel(levelNumber) {
        this.cleanupAllLevels();
        this.state.currentLevel = levelNumber;
        this.state.isPaused = false;
        this.state.isGameOver = false;
        $('#current-level').textContent = levelNumber;
        const settings = DIFFICULTY_SETTINGS[`level${levelNumber}`];
        this.state.timeRemaining = settings.timeLimit;
        if (this.state.isTeacherMode && settings.timeLimit > 0) {
            this.state.timeRemaining = 600;
        }
        this.state.startTime = Date.now();
        this.updateTimerDisplay();
        this.startTimer();
        switch (levelNumber) {
            case 1:
                Level1.init();
                break;
            case 2:
                Level2.init();
                break;
            case 3:
                Level3.init();
                break;
        }
    },
    startTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
        }
        if (this.state.timeRemaining === 0) {
            $('#timer-display').textContent = '∞';
            $('#timer-progress').style.width = '100%';
            $('.timer-container').classList.remove('timer-warning');
            return;
        }
        const initialTime = this.state.timeRemaining;
        this.state.timerInterval = setInterval(() => {
            if (this.state.isPaused) return;
            this.state.timeRemaining--;
            this.updateTimerDisplay();
            const progress = (this.state.timeRemaining / initialTime) * 100;
            $('#timer-progress').style.width = `${progress}%`;
            if (this.state.timeRemaining <= 10) {
                $('.timer-container').classList.add('timer-warning');
            } else {
                $('.timer-container').classList.remove('timer-warning');
            }
            if (this.state.timeRemaining <= 0) {
                this.onTimeUp();
            }
        }, 1000);
    },
    updateTimerDisplay() {
        $('#timer-display').textContent = formatTime(this.state.timeRemaining);
    },
    updateScore(score) {
        this.state.levelScores[this.state.currentLevel - 1] = score;
        const totalScore = this.state.levelScores.reduce((a, b) => a + b, 0);
        this.state.totalScore = totalScore;
        $('#score-display').textContent = totalScore;
    },
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        const modal = $('#pause-modal');

        const currentLevel = this.getCurrentLevelObject();

        if (this.state.isPaused) {
            modal.classList.remove('hidden');
            if (currentLevel && typeof currentLevel.pause === 'function') {
                currentLevel.pause();
            }
        } else {
            modal.classList.add('hidden');
            if (currentLevel && typeof currentLevel.resume === 'function') {
                currentLevel.resume();
            }
        }
    },
    confirmExit() {
        if (this.state.isTeacherMode) {
            this.forceEndCurrentLevel();
            return;
        }
        const confirmModal = confirm('Вы уверены, что хотите завершить уровень?');
        if (confirmModal) {
            this.forceEndCurrentLevel();
        }
    },
    getCurrentLevelObject() {
        switch (this.state.currentLevel) {
            case 1: return Level1;
            case 2: return Level2;
            case 3: return Level3;
            default: return null;
        }
    },
    quitToMenu() {
        clearInterval(this.state.timerInterval);
        if (!this.state.isTeacherMode) {
            this.saveProgress();
        }
        navigateTo('index.html');
    },
    forceEndCurrentLevel() {
        clearInterval(this.state.timerInterval);
        switch (this.state.currentLevel) {
            case 1:
                Level1.forceEnd();
                break;
            case 2:
                Level2.forceEnd();
                break;
            case 3:
                Level3.forceEnd();
                break;
        }
    },
    onTimeUp() {
        clearInterval(this.state.timerInterval);
        this.state.isGameOver = true;
        this.forceEndCurrentLevel();
        if (!this.state.isTeacherMode) {
            const modal = $('#game-over-modal');
            $('#final-score').textContent = this.state.totalScore;
            modal.classList.remove('hidden');
        }
    },
    onLevelComplete(result) {
        clearInterval(this.state.timerInterval);
        const levelTime = Math.floor((Date.now() - this.state.startTime) / 1000);
        this.state.levelTimes[result.level - 1] = levelTime;
        this.state.levelScores[result.level - 1] = result.score;
        this.state.totalScore = this.state.levelScores.reduce((a, b) => a + b, 0);
        this.showLevelComplete(result, levelTime);
    },
    showLevelComplete(result, levelTime) {
        const modal = $('#level-complete-modal');
        const title = $('#level-result-title');
        const nextBtn = $('#next-level-btn');
        const retryBtn = $('#retry-btn');
        const correctRow = $('#level-correct').parentElement;

        const isSuccess = result.level === 3
            ? (result.success !== false && !result.forced)
            : (result.score > 0 && !result.forced);

        if (isSuccess) {
            title.textContent = `Уровень ${result.level} пройден!`;
            title.style.color = 'var(--success)';
            createConfetti();
        } else {
            title.textContent = `Уровень ${result.level} не пройден`;
            title.style.color = 'var(--error)';
        }

        $('#level-score').textContent = result.score;
        $('#level-correct').textContent = result.correct || 0;
        $('#level-time').textContent = formatTime(levelTime);

        if (result.level === 3) {
            correctRow.style.display = 'none';
        } else {
            correctRow.style.display = 'block';
        }

        if (result.level < 3 && isSuccess) {
            nextBtn.style.display = 'inline-flex';
            nextBtn.textContent = 'Следующий уровень';
            retryBtn.textContent = 'Попробовать снова';
        } else if (result.level === 3) {
            nextBtn.style.display = 'inline-flex';
            nextBtn.textContent = 'Завершить игру';
            retryBtn.textContent = 'Попробовать снова';
        } else {
            nextBtn.style.display = 'none';
            retryBtn.textContent = 'Попробовать снова';
        }

        retryBtn.style.display = 'inline-flex';

        modal.classList.remove('hidden');
        if (!this.state.isTeacherMode) {
            updatePlayerLevel(result.level, result.score, levelTime);
        }
    },
    nextLevel() {
        $('#level-complete-modal').classList.add('hidden');
        if (this.state.currentLevel < 3) {
            this.startLevel(this.state.currentLevel + 1);
        } else {
            this.finishGame();
        }
    },
    retryLevel() {
        $('#level-complete-modal').classList.add('hidden');
        this.startLevel(this.state.currentLevel);
    },
    restartGame() {
        $('#game-over-modal').classList.add('hidden');
        this.state.levelScores = [0, 0, 0];
        this.state.levelTimes = [0, 0, 0];
        this.state.totalScore = 0;
        this.state.isGameOver = false;
        if (!this.state.isTeacherMode) {
            const player = getCurrentPlayer();
            player.currentLevel = 1;
            player.score = 0;
            player.levelScores = [0, 0, 0];
            player.levelTimes = [0, 0, 0];
            saveCurrentPlayer(player);
        }
        this.startLevel(1);
    },
    finishGame() {
        this.state.isGameOver = true;
        if (!this.state.isTeacherMode) {
            finalizeGame();
        }
        navigateTo('rating.html?finished=true');
    },
    saveProgress() {
        const player = getCurrentPlayer();
        if (player) {
            player.currentLevel = this.state.currentLevel;
            player.score = this.state.totalScore;
            player.levelScores = this.state.levelScores;
            player.levelTimes = this.state.levelTimes;
            saveCurrentPlayer(player);
        }
    }
};
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});