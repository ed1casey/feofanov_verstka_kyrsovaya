const Level1 = {
    state: {
        currentRound: 0,
        totalRounds: DIFFICULTY_SETTINGS.level1.roundsCount,
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        combo: 0,
        maxCombo: 0,
        selectedEpochs: [],
        artifacts: [],
        sortedCount: 0,
        totalArtifacts: 0,
        isActive: false,
        isTransitioning: false
    },
    init() {
        this.resetState();
        this.render();
        this.startRound();
    },
    resetState() {
        this.state = {
            currentRound: 0,
            totalRounds: DIFFICULTY_SETTINGS.level1.roundsCount,
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            combo: 0,
            maxCombo: 0,
            selectedEpochs: [],
            artifacts: [],
            sortedCount: 0,
            totalArtifacts: 0,
            isActive: true,
            isTransitioning: false
        };
    },
    render() {
        const gameArea = $('#game-area');
        gameArea.innerHTML = '';
        const container = createElement('div', {
            className: 'level1-container',
            parent: gameArea
        });
        const dropZonesContainer = createElement('div', {
            className: 'drop-zones',
            parent: container
        });
        const artifactsContainer = createElement('div', {
            className: 'artifacts-container',
            id: 'artifacts-container',
            parent: container
        });
    },
    startRound() {
        this.state.currentRound++;
        this.state.sortedCount = 0;
        this.state.isTransitioning = false;
        $('#round-current').textContent = this.state.currentRound;
        $('#round-total').textContent = this.state.totalRounds;
        this.selectEpochs();
        const question = generateQuestion(1);
        $('#question-text').textContent = question;
        this.generateArtifacts();
        this.createDropZones();
        this.createArtifactElements();
    },
    selectEpochs() {
        const shuffled = shuffleArray([...EPOCHS]);
        this.state.selectedEpochs = shuffled.slice(0, 3);
    },
    generateArtifacts() {
        const settings = DIFFICULTY_SETTINGS.level1;
        const artifactsPerEpoch = Math.floor(settings.artifactsPerRound / 3);
        let allArtifacts = [];
        this.state.selectedEpochs.forEach(epoch => {
            const epochArtifacts = getArtifactsByEpoch(epoch.id);
            const selected = getRandomItems(epochArtifacts, artifactsPerEpoch);
            allArtifacts = allArtifacts.concat(selected);
        });
        this.state.artifacts = shuffleArray(allArtifacts);
        this.state.totalArtifacts = this.state.artifacts.length;
    },
    createDropZones() {
        const container = $('.drop-zones');
        container.innerHTML = '';
        const shuffledEpochs = shuffleArray([...this.state.selectedEpochs]);
        shuffledEpochs.forEach(epoch => {
            const zone = createElement('div', {
                className: 'drop-zone',
                html: `
                    <div class="drop-zone-title">
                        <span>${epoch.icon}</span>
                        <span>${epoch.name}</span>
                    </div>
                    <div class="drop-zone-years">${epoch.years}</div>
                    <div class="drop-zone-items" data-epoch="${epoch.id}"></div>
                `,
                parent: container
            });
            this.setupDropZone(zone, epoch.id);
        });
    },
    setupDropZone(zone, epochId) {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const artifactId = e.dataTransfer.getData('text/plain');
            const artifact = this.state.artifacts.find(a => a.name === artifactId);
            if (artifact) {
                this.handleDrop(artifact, epochId, zone, e);
            }
        });
    },
    createArtifactElements() {
        const container = $('#artifacts-container');
        container.innerHTML = '';
        this.state.artifacts.forEach((artifact, index) => {
            const element = createElement('div', {
                className: 'artifact',
                html: `
                    <span class="artifact-icon">${artifact.icon}</span>
                    <span class="artifact-name">${artifact.name}</span>
                `,
                attributes: {
                    draggable: 'true',
                    'data-artifact': artifact.name
                },
                parent: container
            });
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            setTimeout(() => {
                element.style.transition = 'all 0.3s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
            element.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', artifact.name);
                element.classList.add('dragging');
            });
            element.addEventListener('dragend', () => {
                element.classList.remove('dragging');
            });
            element.addEventListener('mouseenter', () => {
                element.title = artifact.hint;
            });
        });
    },
    handleDrop(artifact, zoneEpochId, zone, event) {
        const isCorrect = artifact.epoch === zoneEpochId;
        const artifactElement = $(`[data-artifact="${artifact.name}"]`);
        if (isCorrect) {
            this.state.correctAnswers++;
            this.state.combo++;
            this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
            const settings = DIFFICULTY_SETTINGS.level1;
            let points = settings.pointsCorrect;
            if (this.state.combo > 1) {
                points += settings.comboBonus * (this.state.combo - 1);
            }
            this.state.score += points;
            zone.classList.add('correct');
            setTimeout(() => zone.classList.remove('correct'), 500);
            showScorePopup(event.clientX, event.clientY, points, true);
            this.updateComboDisplay();
            if (artifactElement) {
                const zoneItems = zone.querySelector('.drop-zone-items');
                artifactElement.classList.add('feedback-correct');
                artifactElement.draggable = false;
                artifactElement.style.cursor = 'default';
                zoneItems.appendChild(artifactElement);
            }
            this.state.sortedCount++;
            this.state.artifacts = this.state.artifacts.filter(a => a.name !== artifact.name);
        } else {
            this.state.wrongAnswers++;
            this.state.combo = 0;
            const penalty = DIFFICULTY_SETTINGS.level1.pointsWrong;
            this.state.score = Math.max(0, this.state.score + penalty);
            zone.classList.add('incorrect');
            setTimeout(() => zone.classList.remove('incorrect'), 500);
            showScorePopup(event.clientX, event.clientY, penalty, false);
            this.updateComboDisplay();
            if (artifactElement) {
                artifactElement.classList.add('feedback-incorrect');
                setTimeout(() => artifactElement.classList.remove('feedback-incorrect'), 500);
            }
        }
        Game.updateScore(this.state.score);
        this.checkRoundComplete();
    },
    updateComboDisplay() {
        const comboContainer = $('#combo-container');
        const comboCount = $('#combo-count');
        if (this.state.combo > 1) {
            comboContainer.style.display = 'block';
            comboCount.textContent = this.state.combo;
        } else {
            comboContainer.style.display = 'none';
        }
    },
    checkRoundComplete() {
        if (this.state.sortedCount >= this.state.totalArtifacts && !this.state.isTransitioning) {
            this.state.isTransitioning = true;
            setTimeout(() => {
                if (this.state.currentRound < this.state.totalRounds) {
                    this.startRound();
                } else {
                    this.complete();
                }
            }, 1000);
        }
    },
    complete() {
        this.state.isActive = false;
        const comboBonus = this.state.maxCombo * 5;
        this.state.score += comboBonus;
        Game.onLevelComplete({
            level: 1,
            score: this.state.score,
            correct: this.state.correctAnswers,
            wrong: this.state.wrongAnswers,
            maxCombo: this.state.maxCombo
        });
    },
    cleanup() {
        this.state.isActive = false;
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
            level: 1,
            score: this.state.score,
            correct: this.state.correctAnswers,
            wrong: this.state.wrongAnswers,
            maxCombo: this.state.maxCombo,
            forced: true
        });
    },
    getScore() {
        return this.state.score;
    }
};
