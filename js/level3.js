const Level3 = {
    CONFIG: {
        jumpPower: 18,
        gravity: 0.6,

        speeds: {
            1: 3,
            2: 5,
            3: 7
        },

        spawnRates: {
            1: 120,
            2: 100,
            3: 80
        },

        pointsPerObstacle: 10
    },

    state: {
        isActive: false,
        isPaused: false,
        isGameOver: false,
        isJumping: false,
        score: 0,
        timeLeft: 60,
        currentEpoch: null,
        speed: 3,
        jumpVelocity: 0,
        gravity: 0.6,
        jumpPower: 18,
        playerY: 0,
        obstacles: [],
        obstacleTimer: 0,
        speedStage: 1,
        lastSpeedUpdate: 0,
        showingMessage: false
    },

    OBSTACLES: {
        ancient: ['🏺', '🗿', '⚱️', '🏛️'],
        medieval: ['⚔️', '🛡️', '🏰', '👑'],
        modern: ['🚗', '✈️', '🏢', '📱']
    },

    SPEEDS: {
        1: 3,
        2: 5,
        3: 7
    },

    init() {
        this.resetState();
        this.selectRandomEpoch();
        this.render();
        const questionPanel = $('#question-panel');
        if (questionPanel) {
            questionPanel.style.display = 'none';
        }
        this.showStartMessage();
    },

    resetState() {
        this.state = {
            isActive: false,
            isPaused: false,
            isGameOver: false,
            isJumping: false,
            score: 0,
            timeLeft: 60,
            currentEpoch: null,
            speed: this.CONFIG.speeds[1],
            jumpVelocity: 0,
            gravity: this.CONFIG.gravity,
            jumpPower: this.CONFIG.jumpPower,
            playerY: 0,
            obstacles: [],
            obstacleTimer: 0,
            speedStage: 1,
            lastSpeedUpdate: 0,
            showingMessage: false
        };
    },

    selectRandomEpoch() {
        const epochs = ['ancient', 'medieval', 'modern'];
        const epochNames = {
            ancient: 'ДРЕВНИЙ МИР',
            medieval: 'СРЕДНЕВЕКОВЬЕ',
            modern: 'СОВРЕМЕННЫЙ МИР'
        };
        const randomEpoch = epochs[randomInt(0, epochs.length - 1)];
        this.state.currentEpoch = randomEpoch;
        this.state.epochName = epochNames[randomEpoch];
    },

    render() {
        const gameArea = $('#game-area');
        gameArea.innerHTML = '';

        const container = createElement('div', {
            className: 'level3-runner-container',
            parent: gameArea
        });

        const topPanel = createElement('div', {
            className: 'runner-top-panel',
            parent: container
        });

        createElement('div', {
            className: 'runner-timer',
            id: 'runner-timer',
            text: '01:00',
            parent: topPanel
        });

        createElement('div', {
            className: 'runner-score',
            id: 'runner-score',
            text: 'Очки: 0',
            parent: topPanel
        });

        createElement('div', {
            className: 'runner-epoch',
            id: 'runner-epoch',
            text: this.state.epochName,
            parent: topPanel
        });

        const gameCanvas = createElement('div', {
            className: 'runner-game-canvas',
            id: 'runner-canvas',
            parent: container
        });

        createElement('div', {
            className: 'runner-ground',
            id: 'runner-ground',
            parent: gameCanvas
        });

        createElement('div', {
            className: 'runner-player',
            id: 'runner-player',
            html: '⏱️',
            parent: gameCanvas
        });

        createElement('div', {
            className: 'runner-obstacles-container',
            id: 'obstacles-container',
            parent: gameCanvas
        });

        createElement('div', {
            className: 'runner-message-container',
            id: 'message-container',
            parent: gameCanvas
        });

        createElement('div', {
            className: 'runner-instruction',
            text: 'Нажми ПРОБЕЛ или ↑ для прыжка',
            parent: container
        });
    },

    showStartMessage() {
        const messageContainer = $('#message-container');
        messageContainer.innerHTML = '';

        const message = createElement('div', {
            className: 'runner-start-message',
            html: `
                <div class="start-message-title">ТЫ ПОПАЛ В ${this.state.epochName}</div>
                <div class="start-message-subtitle">ПРОЙДИ ВСЕ ПРЕПЯТСТВИЯ ЧТОБЫ ПЕРЕМЕСТИТЬСЯ ВО ВРЕМЕНИ</div>
                <div class="start-message-countdown" id="countdown">3</div>
            `,
            parent: messageContainer
        });

        let countdown = 3;
        const countdownEl = $('#countdown');

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                countdownEl.textContent = countdown;
            } else {
                clearInterval(countdownInterval);
                message.remove();
                this.startGame();
            }
        }, 1000);
    },

    startGame() {
        this.state.isActive = true;
        this.state.lastSpeedUpdate = Date.now();
        this.setupControls();
        this.gameLoop();
        this.startTimer();
    },

    setupControls() {
        this.keyDownHandler = (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && !this.state.isJumping && this.state.isActive) {
                e.preventDefault();
                this.jump();
            }
        };

        document.addEventListener('keydown', this.keyDownHandler);
    },

    jump() {
        if (!this.state.isJumping && this.state.isActive) {
            this.state.isJumping = true;
            this.state.jumpVelocity = this.state.jumpPower;
        }
    },

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.state.isActive && !this.state.isPaused) {
                this.state.timeLeft--;

                // Обновление таймера
                const timerEl = $('#runner-timer');
                timerEl.textContent = formatTime(this.state.timeLeft);

                // Проверка на увеличение скорости каждые 20 секунд
                const elapsedTime = 60 - this.state.timeLeft;

                if (elapsedTime === 20 && this.state.speedStage === 1) {
                    this.increaseSpeed(2);
                } else if (elapsedTime === 40 && this.state.speedStage === 2) {
                    this.increaseSpeed(3);
                }

                // Конец игры
                if (this.state.timeLeft <= 0) {
                    this.endGame(true);
                }
            }
        }, 1000);
    },

    increaseSpeed(stage) {
        this.state.speedStage = stage;
        this.state.speed = this.CONFIG.speeds[stage];
        this.showSpeedMessage();
    },

    showSpeedMessage() {
        if (this.state.showingMessage) return;

        this.state.showingMessage = true;
        const messageContainer = $('#message-container');

        const message = createElement('div', {
            className: 'runner-speed-message',
            text: 'ДЛЯ ПЕРЕМЕЩЕНИЯ НЕ ХВАТАЕТ СКОРОСТИ, ПРИБАВЛЯЕМ!',
            parent: messageContainer
        });

        setTimeout(() => {
            message.remove();
            this.state.showingMessage = false;
        }, 2000);
    },

    gameLoop() {
        if (!this.state.isActive) return;

        this.updatePlayer();
        this.updateObstacles();
        this.checkCollisions();
        this.spawnObstacle();

        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    },

    updatePlayer() {
        const player = $('#runner-player');
        if (!player) return;

        if (this.state.isJumping) {
            this.state.playerY += this.state.jumpVelocity;
            this.state.jumpVelocity -= this.state.gravity;

            if (this.state.playerY <= 0) {
                this.state.playerY = 0;
                this.state.isJumping = false;
                this.state.jumpVelocity = 0;
            }
        }

        player.style.bottom = `${60 + this.state.playerY}px`;
    },

    spawnObstacle() {
        this.state.obstacleTimer++;

        // Интервал спавна препятствий из CONFIG
        const spawnRate = this.CONFIG.spawnRates[this.state.speedStage];

        if (this.state.obstacleTimer >= spawnRate) {
            this.state.obstacleTimer = 0;

            const obstacleSymbols = this.OBSTACLES[this.state.currentEpoch];
            const symbol = obstacleSymbols[randomInt(0, obstacleSymbols.length - 1)];

            const canvas = $('#runner-canvas');
            const canvasWidth = canvas ? canvas.offsetWidth : 900;

            const obstacle = {
                id: `${Date.now()}_${Math.floor(Math.random() * 100000)}`,
                x: canvasWidth,
                symbol: symbol,
                passed: false
            };

            this.state.obstacles.push(obstacle);
            this.renderObstacle(obstacle);
        }
    },

    renderObstacle(obstacle) {
        const container = $('#obstacles-container');
        if (!container) return;

        createElement('div', {
            className: 'runner-obstacle',
            id: `obstacle-${obstacle.id}`,
            html: obstacle.symbol,
            styles: {
                left: `${obstacle.x}px`
            },
            parent: container
        });
    },

    updateObstacles() {
        this.state.obstacles = this.state.obstacles.filter(obstacle => {
            obstacle.x -= this.state.speed;

            const obstacleEl = $(`#obstacle-${obstacle.id}`);
            if (obstacleEl) {
                obstacleEl.style.left = `${obstacle.x}px`;
            }

            // Начисление очков за прохождение препятствия
            if (!obstacle.passed && obstacle.x < 50) {
                obstacle.passed = true;
                this.state.score += this.CONFIG.pointsPerObstacle;
                this.updateScore();
            }

            // Удаление препятствия, которое ушло за экран
            if (obstacle.x < -50) {
                if (obstacleEl) obstacleEl.remove();
                return false;
            }

            return true;
        });
    },

    checkCollisions() {
        const playerRect = {
            left: 50,
            right: 90,
            top: 60 + this.state.playerY,
            bottom: 100 + this.state.playerY
        };

        for (const obstacle of this.state.obstacles) {
            const obstacleRect = {
                left: obstacle.x,
                right: obstacle.x + 40,
                top: 60,
                bottom: 100
            };

            if (this.isColliding(playerRect, obstacleRect)) {
                this.endGame(false);
                return;
            }
        }
    },

    isColliding(rect1, rect2) {
        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
    },

    updateScore() {
        const scoreEl = $('#runner-score');
        scoreEl.textContent = `Очки: ${this.state.score}`;
        Game.updateScore(this.state.score);
    },

    endGame(success) {
        this.state.isActive = false;
        this.state.gameSuccess = success; // Сохраняем результат
        clearInterval(this.timerInterval);
        cancelAnimationFrame(this.animationFrame);

        const messageContainer = $('#message-container');
        messageContainer.innerHTML = '';

        const endMessage = createElement('div', {
            className: 'runner-end-message',
            html: success
                ? `<div class="end-message-title">УСПЕШНОЕ ПЕРЕМЕЩЕНИЕ!</div>
                   <div class="end-message-score">Финальный счет: ${this.state.score}</div>`
                : `<div class="end-message-title">СТОЛКНОВЕНИЕ!</div>
                   <div class="end-message-score">Финальный счет: ${this.state.score}</div>`,
            parent: messageContainer
        });

        setTimeout(() => {
            this.complete();
        }, 2000);
    },

    complete() {
        this.cleanup();
        Game.onLevelComplete({
            level: 3,
            score: this.state.score,
            success: this.state.gameSuccess === true // Передаем сохраненный результат
        });
    },

    cleanup() {
        this.state.isActive = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
        }
        const questionPanel = $('#question-panel');
        if (questionPanel) {
            questionPanel.style.display = 'block';
        }
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
            level: 3,
            score: this.state.score,
            forced: true
        });
    },

    getScore() {
        return this.state.score;
    }
};

