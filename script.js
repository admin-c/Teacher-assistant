// API конфигурация
const API_BASE_URL = 'https://champion-league.onrender.com/api';

// Текущая страница
let currentPage = 'home';
let deferredPrompt; // Для PWA установки

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация SPA
    initSPA();
    
    // Проверяем форму на главной
    const form = document.getElementById('registration-form');
    if (form) {
        form.addEventListener('submit', registerTeam);
    }
    
    // Загружаем начальные данные для главной страницы
    loadNews();
    loadTeams();
    
    // Инициализация PWA
    initPWA();
});

function initSPA() {
    // Обработка кликов по навигации
    const navLinks = document.querySelectorAll('nav a[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Убираем активный класс с текущей кнопки
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Добавляем активный класс к нажатой кнопке
            link.classList.add('active');
            
            const pageId = link.getAttribute('data-page');
            switchPage(pageId);
            
            // Загружаем данные для новой страницы
            setTimeout(() => {
                if (pageId === 'news') {
                    loadNews();
                } else if (pageId === 'schedule') {
                    loadSchedule();
                } else if (pageId === 'results') {
                    loadResults();
                } else if (pageId === 'table') {
                    loadTable();
                } else if (pageId === 'teams') {
                    loadTeams();
                }
            }, 100);
        });
    });
}

function switchPage(pageId) {
    // Скрываем все страницы
    document.querySelectorAll('.section').forEach(page => {
        page.classList.remove('active');
    });
    
    // Показываем выбранную страницу
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    currentPage = pageId;
}

async function registerTeam(e) {
    e.preventDefault();

    const teamName = document.getElementById('team-name').value;
    const ownerName = document.getElementById('owner-name').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register-team`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teamName, ownerName })
        });

        if (response.ok) {
            document.getElementById('status-message').classList.remove('hidden');
            
            // Скрываем сообщение через 4 секунды
            setTimeout(() => {
                document.getElementById('status-message').classList.add('hidden');
            }, 4000);
            
            e.target.reset();
        } else {
            alert('❌ Ошибка при регистрации команды');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Произошла ошибка при регистрации');
    }
}

async function loadNews() {
    try {
        const response = await fetch(`${API_BASE_URL}/news`);
        const news = await response.json();

        const container = document.getElementById('news-container');
        if (!container) return;

        container.innerHTML = '';

        if (news.length === 0) {
            container.innerHTML = '<div class="card"><p>📰 Новостей пока нет</p></div>';
            return;
        }

        news.forEach((item, index) => {
            const newsElement = document.createElement('div');
            newsElement.className = 'card';
            newsElement.style.animationDelay = `${index * 0.1}s`;
            newsElement.innerHTML = `
                <h3>📢 ${item.title}</h3>
                <p>${item.content}</p>
                <small>📅 ${new Date(item.date).toLocaleDateString('ru-RU')}</small>
            `;
            container.appendChild(newsElement);
        });
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
    }
}

async function loadTeams() {
    try {
        const response = await fetch(`${API_BASE_URL}/teams`);
        const teams = await response.json();

        const container = document.getElementById('teams-container');
        if (!container) return;

        container.innerHTML = '';

        if (teams.length === 0) {
            container.innerHTML = '<div class="card"><p>👥 Команд пока нет</p></div>';
            return;
        }

        teams.forEach((team, index) => {
            const teamCard = document.createElement('div');
            teamCard.className = 'card';
            teamCard.style.animationDelay = `${index * 0.1}s`;
            teamCard.innerHTML = `
                <h3>🏆 ${team.name}</h3>
                <p>👤 Владелец: ${team.owner}</p>
            `;
            container.appendChild(teamCard);
        });
    } catch (error) {
        console.error('Ошибка загрузки команд:', error);
    }
}

async function loadSchedule() {
    try {
        const response = await fetch(`${API_BASE_URL}/matches`);
        const matches = await response.json();

        const container = document.getElementById('schedule-container');
        if (!container) return;

        container.innerHTML = '';

        if (matches.length === 0) {
            container.innerHTML = '<div class="card"><p>⚽ Матчей пока нет</p></div>';
            return;
        }

        matches.forEach((match, index) => {
            const matchElement = document.createElement('div');
            matchElement.className = 'card';
            matchElement.style.animationDelay = `${index * 0.1}s`;
            matchElement.innerHTML = `
                <h3>⚔️ ${match.team1} vs ${match.team2}</h3>
                <p>📅 ${new Date(match.date).toLocaleString('ru-RU')}</p>
                <p>📊 Статус: ${match.status}</p>
                ${match.score1 !== undefined && match.score2 !== undefined ? 
                    `<p>🏆 Счёт: ${match.score1} - ${match.score2}</p>` : ''}
            `;
            container.appendChild(matchElement);
        });
    } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
    }
}

async function loadResults() {
    try {
        const response = await fetch(`${API_BASE_URL}/results`);
        const results = await response.json();

        const container = document.getElementById('results-container');
        if (!container) return;

        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<div class="card"><p>📊 Результатов пока нет</p></div>';
            return;
        }

        results.forEach((result, index) => {
            const resultElement = document.createElement('div');
            resultElement.className = 'card';
            resultElement.style.animationDelay = `${index * 0.1}s`;
            resultElement.innerHTML = `
                <h3>🏆 ${result.team1} ${result.score1} - ${result.score2} ${result.team2}</h3>
                <p> Тур: ${result.round}</p>
                <p>📅 ${new Date(result.date).toLocaleDateString('ru-RU')}</p>
            `;
            container.appendChild(resultElement);
        });
    } catch (error) {
        console.error('Ошибка загрузки результатов:', error);
    }
}

async function loadTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/table`);
        const tableData = await response.json();

        const tbody = document.querySelector('#tournament-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (tableData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">📈 Команд пока нет</td></tr>';
            return;
        }

        tableData.forEach((team, index) => {
            const row = document.createElement('tr');
            row.style.animationDelay = `${index * 0.05}s`;
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.played}</td>
                <td>${team.wins}</td>
                <td>${team.draws}</td>
                <td>${team.losses}</td>
                <td>${team.points}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка загрузки таблицы:', error);
    }
}

// Инициализация PWA
function initPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.classList.remove('hidden');
            installButton.onclick = showInstallPromotion;
        }
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA была установлена');
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.classList.add('hidden');
        }
    });
}

function showInstallPromotion() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ Пользователь принял установку');
            } else {
                console.log('❌ Пользователь отклонил установку');
            }
            deferredPrompt = null;
        });
    }
}

// Установка PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('✅ SW зарегистрирован'))
            .catch(error => console.log('❌ Ошибка регистрации SW:', error));
    });
}
