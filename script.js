// API конфигурация
const API_BASE_URL = 'https://champion-league.onrender.com/api';

// Текущая страница
let currentPage = 'home';

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация SPA
    initSPA();
    
    // Проверяем форму на главной
    const form = document.getElementById('registration-form');
    if (form) {
        form.addEventListener('submit', registerTeam);
    }
    
    // Загружаем начальные данные
    loadNews();
    loadTeams();
    loadSchedule();
    loadResults();
    loadTable();
});

function initSPA() {
    // Обработка кликов по навигации
    const navLinks = document.querySelectorAll('nav a[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            switchPage(pageId);
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
        
        // Загружаем данные для страницы, если нужно
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
            document.getElementById('status-message').style.animation = 'pulse 2s infinite';
            e.target.reset();
        } else {
            alert('Ошибка при регистрации команды');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при регистрации');
    }
}

async function loadNews() {
    try {
        const response = await fetch(`${API_BASE_URL}/news`);
        const news = await response.json();

        const container = document.getElementById('news-container');
        if (!container) return;

        container.innerHTML = '';

        news.forEach((item, index) => {
            const newsElement = document.createElement('div');
            newsElement.className = 'news-item load-in';
            newsElement.style.animationDelay = `${index * 0.1}s`;
            newsElement.innerHTML = `
                <h3>${item.title}</h3>
                <p>${item.content}</p>
                <small>${new Date(item.date).toLocaleDateString()}</small>
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

        teams.forEach((team, index) => {
            const teamCard = document.createElement('div');
            teamCard.className = 'team-card load-in';
            teamCard.style.animationDelay = `${index * 0.1}s`;
            teamCard.innerHTML = `
                <h3>${team.name}</h3>
                <p>Владелец: ${team.owner}</p>
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

        matches.forEach((match, index) => {
            const matchElement = document.createElement('div');
            matchElement.className = 'match-item load-in';
            matchElement.style.animationDelay = `${index * 0.1}s`;
            matchElement.innerHTML = `
                <h3>${match.team1} vs ${match.team2}</h3>
                <p>Дата: ${new Date(match.date).toLocaleString()}</p>
                <p>Статус: ${match.status}</p>
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

        results.forEach((result, index) => {
            const resultElement = document.createElement('div');
            resultElement.className = 'result-item load-in';
            resultElement.style.animationDelay = `${index * 0.1}s`;
            resultElement.innerHTML = `
                <h3>${result.team1} ${result.score1} - ${result.score2} ${result.team2}</h3>
                <p>Тур: ${result.round}</p>
                <p>Дата: ${new Date(result.date).toLocaleDateString()}</p>
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

        tableData.forEach((team, index) => {
            const row = document.createElement('tr');
            row.className = 'load-in';
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

// Установка PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
