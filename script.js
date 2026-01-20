// API конфигурация
const API_BASE_URL = 'https://your-api-url.onrender.com/api'; // Замените на ваш API URL

// Проверка регистрации пользователя
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    if (form) {
        form.addEventListener('submit', registerTeam);
    }
    
    loadNews();
    loadSchedule();
    loadTable();
    
    // Анимация появления контента
    animateElements();
});

function animateElements() {
    const elements = document.querySelectorAll('.animate-in');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
    });
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
            form.reset();
            
            // Добавляем анимацию для сообщения
            setTimeout(() => {
                document.getElementById('status-message').style.animation = '';
            }, 2000);
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

async function loadSchedule() {
    try {
        const response = await fetch(`${API_BASE_URL}/matches`);
        const matches = await response.json();
        
        const container = document.getElementById('schedule-container');
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

async function loadTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/table`);
        const tableData = await response.json();
        
        const tbody = document.querySelector('#tournament-table tbody');
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