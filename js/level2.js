const Level2 = {
    state: {
        currentRound: 0,
        totalRounds: DIFFICULTY_SETTINGS.level2.roundsCount,
        score: 0,
        correctCatches: 0,
        wrongCatches: 0,
        missed: 0,
        targetCategory: null,
        anomalies: [],
        activeAnomalies: [],
        spawnInterval: null,
        spawnComplete: false,
        currentSpawnSpeed: DIFFICULTY_SETTINGS.level2.spawnInterval,
        isActive: false,
        selectedAnomaly: null,
        isTransitioning: false
    },
    init() {
        this.resetState();
        this.render();
        this.setupKeyboardControls();
        this.startRound();
    },
    resetState() {
        this.state = {
            currentRound: 0,
            totalRounds: DIFFICULTY_SETTINGS.level2.roundsCount,
            score: 0,
            correctCatches: 0,
            wrongCatches: 0,
            missed: 0,
            targetCategory: null,
            anomalies: [],
            activeAnomalies: [],
            spawnInterval: null,
            spawnComplete: false,
            currentSpawnSpeed: DIFFICULTY_SETTINGS.level2.spawnInterval,
            isActive: true,
            selectedAnomaly: null,
            isTransitioning: false
        };
    },
    render() {
        const gameArea = $('#game-area');
        gameArea.innerHTML = '';
        const container = createElement('div', {
            className: 'level2-container',
            id: 'level2-container',
            parent: gameArea
        });
        createElement('div', {
            className: 'level2-hint',
            html: 'Пробел для ловли',
            parent: container
        });
    },
    setupKeyboardControls() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
        }
        this._keyHandler = (e) => {
            if (!this.state.isActive) return;
            if (e.code === 'Space') {
                e.preventDefault();
                this.catchSelectedAnomaly();
            }
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
                this.selectNextAnomaly(e.code === 'ArrowRight' ? 1 : -1);
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    },
    selectNextAnomaly(direction) {
        const anomalies = this.state.activeAnomalies;
        if (anomalies.length === 0) return;
        const currentIndex = this.state.selectedAnomaly
            ? anomalies.indexOf(this.state.selectedAnomaly)
            : -1;
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = anomalies.length - 1;
        if (newIndex >= anomalies.length) newIndex = 0;
        if (this.state.selectedAnomaly) {
            const oldElement = $(`[data-anomaly-id="${this.state.selectedAnomaly.id}"]`);
            if (oldElement) oldElement.classList.remove('selected');
        }
        this.state.selectedAnomaly = anomalies[newIndex];
        const newElement = $(`[data-anomaly-id="${this.state.selectedAnomaly.id}"]`);
        if (newElement) newElement.classList.add('selected');
    },
    catchSelectedAnomaly() {
        if (!this.state.selectedAnomaly) {
            if (this.state.activeAnomalies.length > 0) {
                this.state.selectedAnomaly = this.state.activeAnomalies[0];
            } else {
                return;
            }
        }
        const element = $(`[data-anomaly-id="${this.state.selectedAnomaly.id}"]`);
        if (element) {
            const rect = element.getBoundingClientRect();
            this.handleCatch(this.state.selectedAnomaly, element, rect.left, rect.top);
        }
    },
    startRound() {
        if (this.state.spawnInterval) {
            clearInterval(this.state.spawnInterval);
            this.state.spawnInterval = null;
        }
        const container = $('#level2-container');
        if (container) {
            const anomalies = container.querySelectorAll('.anomaly');
            anomalies.forEach(el => el.remove());
        }
        this.state.currentRound++;
        this.state.spawnComplete = false;
        this.state.isTransitioning = false;
        $('#round-current').textContent = this.state.currentRound;
        $('#round-total').textContent = this.state.totalRounds;
        this.state.activeAnomalies = [];
        this.state.selectedAnomaly = null;
        this.state.targetCategory = getRandomCategory();
        const question = generateQuestion(2, { categoryName: this.state.targetCategory.name });
        $('#question-text').textContent = question;
        this.generateAnomalies();
        this.state.currentSpawnSpeed *= DIFFICULTY_SETTINGS.level2.spawnSpeedup;
        this.startSpawning();
    },
    generateAnomalies() {
        const settings = DIFFICULTY_SETTINGS.level2;
        const targetAnomalies = getAnomaliesByCategory(this.state.targetCategory.id);
        const correct = getRandomItems(targetAnomalies, 4);
        const otherAnomalies = ANOMALIES.filter(a => a.category !== this.state.targetCategory.id);
        const wrong = getRandomItems(otherAnomalies, settings.anomaliesPerRound - 4);
        this.state.anomalies = shuffleArray([...correct, ...wrong]).map((a, i) => ({
            ...a,
            id: `anomaly_${Date.now()}_${i}`
        }));
    },
    startSpawning() {
        let anomalyIndex = 0;
        this.state.spawnInterval = setInterval(() => {
            if (!this.state.isActive) {
                clearInterval(this.state.spawnInterval);
                return;
            }
            if (anomalyIndex < this.state.anomalies.length) {
                this.spawnAnomaly(this.state.anomalies[anomalyIndex]);
                anomalyIndex++;
            } else {
                clearInterval(this.state.spawnInterval);
                this.state.spawnComplete = true;
                this.checkRoundComplete();
            }
        }, this.state.currentSpawnSpeed);
    },
    spawnAnomaly(anomaly) {
        const container = $('#level2-container');
        const containerRect = container.getBoundingClientRect();
        const startY = randomInt(50, containerRect.height - 100);
        const element = createElement('div', {
            className: 'anomaly',
            html: `<span>${anomaly.icon}</span> <span>${anomaly.name}</span>`,
            attributes: {
                'data-anomaly-id': anomaly.id
            },
            styles: {
                right: '-200px',
                top: `${startY}px`
            },
            parent: container
        });
        this.state.activeAnomalies.push(anomaly);
        element.addEventListener('mouseenter', () => {
            if (this.state.selectedAnomaly) {
                const oldElement = $(`[data-anomaly-id="${this.state.selectedAnomaly.id}"]`);
                if (oldElement) oldElement.classList.remove('selected');
            }
            this.state.selectedAnomaly = anomaly;
            element.classList.add('selected');
        });
        const duration = 5000 + randomInt(0, 2000);
        const amplitude = randomInt(20, 50);
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = elapsed / duration;
            if (progress >= 1 || !this.state.isActive) {
                this.handleMiss(anomaly, element);
                return;
            }
            const x = containerRect.width * (1 - progress) - 100;
            const y = startY + Math.sin(progress * Math.PI * 4) * amplitude;
            element.style.right = 'auto';
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            if (element.parentNode) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    },
    handleCatch(anomaly, element, x, y) {
        if (!element.parentNode) return;
        const isCorrect = anomaly.category === this.state.targetCategory.id;
        const settings = DIFFICULTY_SETTINGS.level2;
        if (isCorrect) {
            this.state.correctCatches++;
            this.state.score += settings.pointsCorrect;
            element.classList.add('caught');
            showScorePopup(x, y, settings.pointsCorrect, true);
        } else {
            this.state.wrongCatches++;
            this.state.score = Math.max(0, this.state.score + settings.pointsWrong);
            element.classList.add('wrong');
            shakeElement(element);
            showScorePopup(x, y, settings.pointsWrong, false);
        }
        Game.updateScore(this.state.score);
        this.state.activeAnomalies = this.state.activeAnomalies.filter(a => a.id !== anomaly.id);
        if (this.state.selectedAnomaly?.id === anomaly.id) {
            this.state.selectedAnomaly = null;
        }
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
            }
            this.checkRoundComplete();
        }, 300);
    },
    handleMiss(anomaly, element) {
        if (!element.parentNode) return;
        if (anomaly.category === this.state.targetCategory.id) {
            this.state.missed++;
            const penalty = DIFFICULTY_SETTINGS.level2.pointsMiss;
            this.state.score = Math.max(0, this.state.score + penalty);
            Game.updateScore(this.state.score);
        }
        this.state.activeAnomalies = this.state.activeAnomalies.filter(a => a.id !== anomaly.id);
        element.remove();
        this.checkRoundComplete();
    },
    checkRoundComplete() {
        if (this.state.spawnComplete && this.state.activeAnomalies.length === 0 && !this.state.isTransitioning) {
            this.state.isTransitioning = true;
            setTimeout(() => {
                if (this.state.currentRound < this.state.totalRounds) {
                    this.startRound();
                } else {
                    this.complete();
                }
            }, 500);
        }
    },
    complete() {
        this.state.isActive = false;
        clearInterval(this.state.spawnInterval);
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
        }
        Game.onLevelComplete({
            level: 2,
            score: this.state.score,
            correct: this.state.correctCatches,
            wrong: this.state.wrongCatches,
            missed: this.state.missed
        });
    },
    cleanup() {
        this.state.isActive = false;
        clearInterval(this.state.spawnInterval);
        this.state.spawnInterval = null;
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        this.state.activeAnomalies = [];
    },
    pause() {
        this.state.isPaused = true;
    },
    resume() {
        this.state.isPaused = false;
    },
    forceEnd() {
        if (!this.state.isActive) return;
        this.cleanup();
        Game.onLevelComplete({
            level: 2,
            score: this.state.score,
            correct: this.state.correctCatches,
            wrong: this.state.wrongCatches,
            missed: this.state.missed,
            forced: true
        });
    },
    getScore() {
        return this.state.score;
    }
};
const style = document.createElement('style');
style.textContent = `
    .anomaly.selected {
        border-color: var(--accent-primary) !important;
        box-shadow: 0 0 20px var(--accent-glow) !important;
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);