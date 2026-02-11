const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function getRandomItems(array, count) {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, count);
}
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    if (options.className) {
        element.className = options.className;
    }
    if (options.id) {
        element.id = options.id;
    }
    if (options.text) {
        element.textContent = options.text;
    }
    if (options.html) {
        element.innerHTML = options.html;
    }
    if (options.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
            element.setAttribute(key, value);
        }
    }
    if (options.styles) {
        Object.assign(element.style, options.styles);
    }
    if (options.parent) {
        options.parent.appendChild(element);
    }
    return element;
}
function showScorePopup(x, y, score, isPositive = true) {
    const popup = createElement('div', {
        className: `score-popup ${isPositive ? 'positive' : 'negative'}`,
        text: isPositive ? `+${score}` : `${score}`,
        styles: {
            left: `${x}px`,
            top: `${y}px`
        },
        parent: document.body
    });
    setTimeout(() => popup.remove(), 1000);
}
function playSound(soundName) {
}
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
function createParticles(container, count = 20) {
}

function createConfetti() {
    const colors = ['#6C5CE7', '#00B894', '#FDCB6E', '#E74C3C', '#3498DB', '#9B59B6', '#E67E22'];
    const confettiCount = 100;
    const container = document.body;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';

        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        }

        container.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}
function applyTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    localStorage.setItem('gameTheme', themeName);
}
function getCurrentTheme() {
    return localStorage.getItem('gameTheme') || 'dark';
}
function initTheme() {
    const savedTheme = getCurrentTheme();
    applyTheme(savedTheme);
    const themeButtons = $$('.theme-btn');
    themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === savedTheme);
    });
}
function navigateTo(url, delay = 300) {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s';
    setTimeout(() => {
        window.location.href = url;
    }, delay);
}
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}
function isTeacher() {
    const currentUser = JSON.parse(localStorage.getItem('currentPlayer') || '{}');
    return currentUser.isTeacher === true;
}
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}
function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
}
function glowElement(element) {
    element.classList.add('glow');
    setTimeout(() => element.classList.remove('glow'), 2000);
}
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const particlesContainer = $('#particles-container');
    if (particlesContainer) {
        createParticles(particlesContainer);
    }
    const themeButtons = $$('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            applyTheme(theme);
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            createParticles(particlesContainer);
        });
    });
});