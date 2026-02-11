document.addEventListener('DOMContentLoaded', () => {
    const playerNameInput = $('#player-name');
    const startBtn = $('#start-btn');
    const ratingBtn = $('#rating-btn');
    const savedPlayer = getCurrentPlayer();
    if (savedPlayer && savedPlayer.name) {
        playerNameInput.value = savedPlayer.name;
        startBtn.disabled = false;
    }
    playerNameInput.addEventListener('input', (e) => {
        const name = e.target.value.trim();
        startBtn.disabled = name.length === 0;
        if (name.toLowerCase() === 'teacher') {
            const hint = $('.teacher-hint');
            if (hint) {
                hint.style.opacity = '1';
                hint.innerHTML = '<small>Режим преподавателя активирован!</small>';
            }
        }
    });
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !startBtn.disabled) {
            startGame();
        }
    });
    playerNameInput.focus();
    startBtn.addEventListener('click', startGame);
    ratingBtn.addEventListener('click', () => {
        navigateTo('rating.html');
    });
    const title = $('.title-glow');
    if (title) {
        title.addEventListener('dblclick', () => {
            alert('Игра "Перемещение по времени" v1.0\nКурсовая работа Феофанова И.');
        });
    }
    function startGame() {
        const name = playerNameInput.value.trim();
        if (!name) {
            shakeElement(playerNameInput);
            return;
        }
        const player = createPlayer(name);
        startBtn.innerHTML = '<span class="btn-text">Загрузка...</span>';
        startBtn.disabled = true;
        glowElement(startBtn);
        setTimeout(() => {
            navigateTo('game.html');
        }, 500);
    }
    const animatedElements = [
        '.game-header',
        '.auth-card',
        '.theme-section',
        '.rules-preview'
    ];
    animatedElements.forEach((selector, index) => {
        const element = $(selector);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 + index * 150);
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r' && e.ctrlKey) {
            e.preventDefault();
            navigateTo('rating.html');
        }
    });
});