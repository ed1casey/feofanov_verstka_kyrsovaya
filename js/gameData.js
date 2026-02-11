const EPOCHS = [
    { id: 'ancient', name: 'Древний мир', icon: '', years: 'до 500 н.э.' },
    { id: 'medieval', name: 'Средневековье', icon: '', years: '500-1500 н.э.' },
    { id: 'modern', name: 'Новое время', icon: '', years: '1500-1900 н.э.' },
    { id: 'contemporary', name: 'Современность', icon: '', years: '1900-наши дни' }
];
const ARTIFACTS = [
    { name: 'Папирус', icon: '', epoch: 'ancient', hint: 'Древнеегипетский материал для письма' },
    { name: 'Римский меч', icon: '', epoch: 'ancient', hint: 'Гладиус легионера' },
    { name: 'Амфора', icon: '', epoch: 'ancient', hint: 'Греческий сосуд для вина' },
    { name: 'Колесница', icon: '', epoch: 'ancient', hint: 'Транспорт фараонов' },
    { name: 'Пирамида', icon: '', epoch: 'ancient', hint: 'Гробница фараона' },
    { name: 'Олимпийский венок', icon: '', epoch: 'ancient', hint: 'Награда античных атлетов' },
    { name: 'Рыцарский шлем', icon: '', epoch: 'medieval', hint: 'Защита головы воина' },
    { name: 'Катапульта', icon: '', epoch: 'medieval', hint: 'Осадное орудие замков' },
    { name: 'Свиток монаха', icon: '', epoch: 'medieval', hint: 'Рукопись из монастыря' },
    { name: 'Корона', icon: '', epoch: 'medieval', hint: 'Атрибут королевской власти' },
    { name: 'Замковый ключ', icon: '', epoch: 'medieval', hint: 'Открывает ворота крепости' },
    { name: 'Щит крестоносца', icon: '', epoch: 'medieval', hint: 'Символ крестовых походов' },
    { name: 'Компас', icon: '', epoch: 'modern', hint: 'Инструмент мореплавателей' },
    { name: 'Мушкет', icon: '', epoch: 'modern', hint: 'Огнестрельное оружие 17 века' },
    { name: 'Печатный станок', icon: '', epoch: 'modern', hint: 'Изобретение Гутенберга' },
    { name: 'Подзорная труба', icon: '', epoch: 'modern', hint: 'Инструмент Галилея' },
    { name: 'Паровой двигатель', icon: '', epoch: 'modern', hint: 'Двигатель промышленной революции' },
    { name: 'Карманные часы', icon: '', epoch: 'modern', hint: 'Аксессуар джентльмена' },
    { name: 'Смартфон', icon: '', epoch: 'contemporary', hint: 'Карманный компьютер' },
    { name: 'Компьютер', icon: '', epoch: 'contemporary', hint: 'Вычислительная машина' },
    { name: 'Космический спутник', icon: '', epoch: 'contemporary', hint: 'Летает на орбите Земли' },
    { name: 'Электрическая лампа', icon: '', epoch: 'contemporary', hint: 'Изобретение Эдисона' },
    { name: 'Автомобиль', icon: '', epoch: 'contemporary', hint: 'Самодвижущийся экипаж' },
    { name: 'Самолет', icon: '', epoch: 'contemporary', hint: 'Изобретение братьев Райт' }
];
const LEVEL1_QUESTIONS = [
    'Рассортируй артефакты по их временным эпохам',
    'Перетащи каждый предмет в правильную эпоху',
    'Распредели артефакты по историческим периодам',
    'Верни артефакты в свои эпохи!',
    'Каждый предмет — в свою эпоху!'
];
const ANOMALY_CATEGORIES = [
    { id: 'inventions', name: 'Изобретения', icon: '' },
    { id: 'events', name: 'События', icon: '' },
    { id: 'people', name: 'Личности', icon: '' },
    { id: 'places', name: 'Места', icon: '' }
];
const ANOMALIES = [
    { name: 'Телефон', category: 'inventions', year: 1876, icon: '' },
    { name: 'Радио', category: 'inventions', year: 1895, icon: '' },
    { name: 'Телевизор', category: 'inventions', year: 1927, icon: '' },
    { name: 'Интернет', category: 'inventions', year: 1969, icon: '' },
    { name: 'Электричество', category: 'inventions', year: 1879, icon: '' },
    { name: 'Паровоз', category: 'inventions', year: 1804, icon: '' },
    { name: 'Французская революция', category: 'events', year: 1789, icon: '' },
    { name: 'Высадка на Луну', category: 'events', year: 1969, icon: '' },
    { name: 'Падение Берлинской стены', category: 'events', year: 1989, icon: '' },
    { name: 'Первая мировая война', category: 'events', year: 1914, icon: '' },
    { name: 'Открытие Америки', category: 'events', year: 1492, icon: '' },
    { name: 'Олимпийские игры (возрождение)', category: 'events', year: 1896, icon: '' },
    { name: 'Эйнштейн', category: 'people', year: 1905, icon: '' },
    { name: 'Да Винчи', category: 'people', year: 1500, icon: '' },
    { name: 'Наполеон', category: 'people', year: 1804, icon: '' },
    { name: 'Гагарин', category: 'people', year: 1961, icon: '' },
    { name: 'Шекспир', category: 'people', year: 1600, icon: '' },
    { name: 'Ньютон', category: 'people', year: 1687, icon: '' },
    { name: 'Эйфелева башня', category: 'places', year: 1889, icon: '' },
    { name: 'Колизей', category: 'places', year: 80, icon: '' },
    { name: 'Великая стена', category: 'places', year: -200, icon: '' },
    { name: 'Статуя Свободы', category: 'places', year: 1886, icon: '' },
    { name: 'Тадж-Махал', category: 'places', year: 1653, icon: '' },
    { name: 'Биг-Бен', category: 'places', year: 1859, icon: '' }
];
const LEVEL2_QUESTIONS = [
    'Лови только {category}!',
    'Поймай все объекты из категории "{category}"',
    'Хватай {category}, избегай остальных!',
    'Нужны только {category}. Будь внимателен!',
    'Собери все {category} до истечения времени'
];
const HISTORICAL_EVENTS = [
    { name: 'Строительство пирамид', year: -2500, hint: 'Египет, эпоха фараонов', group: 1 },
    { name: 'Основание Рима', year: -753, hint: 'Легенда о Ромуле и Реме', group: 1 },
    { name: 'Расцвет Афин', year: -500, hint: 'Золотой век Греции', group: 1 },
    { name: 'Падение Рима', year: 476, hint: 'Конец Западной империи', group: 1 },
    { name: 'Крещение Руси', year: 988, hint: 'Князь Владимир', group: 2 },
    { name: 'Первый крестовый поход', year: 1096, hint: 'Освобождение Иерусалима', group: 2 },
    { name: 'Изобретение книгопечатания', year: 1450, hint: 'Гутенберг и его станок', group: 2 },
    { name: 'Открытие Америки', year: 1492, hint: 'Колумб достиг Нового Света', group: 2 },
    { name: 'Великая французская революция', year: 1789, hint: 'Взятие Бастилии', group: 3 },
    { name: 'Отечественная война', year: 1812, hint: 'Наполеон в России', group: 3 },
    { name: 'Отмена крепостного права', year: 1861, hint: 'Реформа Александра II', group: 3 },
    { name: 'Изобретение телефона', year: 1876, hint: 'Александр Белл', group: 3 },
    { name: 'Первая мировая война', year: 1914, hint: 'Глобальный конфликт', group: 4 },
    { name: 'Октябрьская революция', year: 1917, hint: 'Большевики у власти', group: 4 },
    { name: 'Вторая мировая война', year: 1939, hint: 'Начало войны в Европе', group: 4 },
    { name: 'Полет Гагарина', year: 1961, hint: 'Первый человек в космосе', group: 4 },
    { name: 'Высадка на Луну', year: 1969, hint: 'Армстронг ступает на Луну', group: 5 },
    { name: 'Создание интернета', year: 1983, hint: 'Появление TCP/IP', group: 5 },
    { name: 'Распад СССР', year: 1991, hint: 'Конец холодной войны', group: 5 },
    { name: 'Запуск первого iPhone', year: 2007, hint: 'Революция смартфонов', group: 5 }
];
const LEVEL3_QUESTIONS = [
    'Расставь события в хронологическом порядке',
    'Расположи события от самого древнего к новейшему',
    'Восстанови правильную последовательность событий',
    'Упорядочи исторические события по времени',
    'Выстрой временную линию событий'
];
const DIFFICULTY_SETTINGS = {
    level1: {
        roundsCount: 3,        
        artifactsPerRound: 6,  
        epochsPerRound: 3,     
        timeLimit: 90,         
        pointsCorrect: 15,     
        pointsWrong: -5,       
        comboBonus: 5          
    },
    level2: {
        roundsCount: 3,        
        anomaliesPerRound: 8,  
        spawnInterval: 2000,   
        spawnSpeedup: 0.9,     
        timeLimit: 0,          
        pointsCorrect: 20,     
        pointsWrong: -10,      
        pointsMiss: -5         
    },
    level3: {
        roundsCount: 3,        
        eventsPerRound: 4,     
        timeLimit: 60,         
        pointsCorrect: 25,     
        pointsPartial: 10,     
        pointsWrong: -8,       
        bonusAllCorrect: 50    
    }
};
function getRandomEpoch() {
    return EPOCHS[randomInt(0, EPOCHS.length - 1)];
}
function getArtifactsByEpoch(epochId) {
    return ARTIFACTS.filter(a => a.epoch === epochId);
}
function getRandomArtifacts(count, epochFilter = null) {
    let pool = epochFilter
        ? ARTIFACTS.filter(a => a.epoch === epochFilter)
        : [...ARTIFACTS];
    return getRandomItems(pool, Math.min(count, pool.length));
}
function getAnomaliesByCategory(categoryId) {
    return ANOMALIES.filter(a => a.category === categoryId);
}
function getRandomCategory() {
    return ANOMALY_CATEGORIES[randomInt(0, ANOMALY_CATEGORIES.length - 1)];
}
function getEventsByGroup(groupId) {
    return HISTORICAL_EVENTS.filter(e => e.group === groupId);
}
function getRandomEvents(count) {
    return getRandomItems(HISTORICAL_EVENTS, count);
}
function generateQuestion(level, context) {
    let questions;
    let template;
    switch (level) {
        case 1:
            questions = LEVEL1_QUESTIONS;
            return questions[randomInt(0, questions.length - 1)];
        case 2:
            questions = LEVEL2_QUESTIONS;
            template = questions[randomInt(0, questions.length - 1)];
            return template.replace('{category}', context.categoryName);
        case 3:
            questions = LEVEL3_QUESTIONS;
            return questions[randomInt(0, questions.length - 1)];
        default:
            return 'Выполни задание!';
    }
}