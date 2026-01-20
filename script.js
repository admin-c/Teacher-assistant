// Базовый URL API - ЗАМЕНИТЕ НА СВОЙ СЕРВЕР Render.com
const API_BASE = 'https://champion-league.onrender.com/api';

// Частицы для фона
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(255, 215, 0, 0.3)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        
        container.appendChild(particle);
    }
}

// CSS для анимации частиц
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
        100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Регистрация команды
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', registerTeam);
    }
    
    // Загрузка новостей на главной странице
    if (document.getElementById('newsContainer')) {
        loadNews();
    }
    
    // Загрузка таблицы
    if (document.getElementById('tableBody')) {
        loadTable();
        setupTableSorting();
    }
});

async function registerTeam() {
    const teamName = document.getElementById('teamName').value.trim();
    const ownerName = document.getElementById('ownerName').value.trim();
    
    if (!teamName || !ownerName) {
        alert('Заполните все поля!');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teamName, ownerName })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Заявка успешно отправлена! Ожидайте подтверждения админом.');
            // Сохраняем информацию о команде в localStorage
            localStorage.setItem('userTeam', teamName);
            localStorage.setItem('ownerName', ownerName);
            
            // Показываем кнопку перехода в меню
            document.querySelector('.already-btn').style.display = 'flex';
            
            // Очищаем поля
            document.getElementById('teamName').value = '';
            document.getElementById('ownerName').value = '';
        } else {
            alert('Ошибка регистрации: ' + data.error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка соединения с сервером');
    }
}

async function loadNews() {
    try {
        const response = await fetch(`${API_BASE}/news`);
        const news = await response.json();
        
        const container = document.getElementById('newsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (news.length === 0) {
            container.innerHTML = '<p>Новостей пока нет</p>';
            return;
        }
        
        news.forEach(item => {
            const newsDiv = document.createElement('div');
            newsDiv.className = 'news-item';
            newsDiv.innerHTML = `
                <h3>${item.title}</h3>
                <p>${item.content}</p>
                <div class="news-meta">
                    <span><i class="far fa-calendar"></i> ${item.date}</span>
                    <span><i class="far fa-clock"></i> ${item.time}</span>
                </div>
            `;
            container.appendChild(newsDiv);
        });
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
    }
}

async function loadTable() {
    try {
        const response = await fetch(`${API_BASE}/teams`);
        const teams = await response.json();
        
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // Сортируем по очкам
        teams.sort((a, b) => b.points - a.points);
        
        teams.forEach((team, index) => {
            const played = team.wins + team.draws + team.losses;
            const goalDifference = team.goalsFor - team.goalsAgainst;
            
            const row = document.createElement('tr');
            
            // Цвет строки в зависимости от позиции
            let rowClass = '';
            if (index < 4) rowClass = 'cl-row';
            else if (index < 8) rowClass = 'el-row';
            else if (index > teams.length - 3) rowClass = 'rel-row';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td class="team-name">${team.teamName}</td>
                <td>${team.ownerName}</td>
                <td>${played}</td>
                <td>${team.wins}</td>
                <td>${team.draws}</td>
                <td>${team.losses}</td>
                <td>${team.goalsFor}</td>
                <td>${team.goalsAgainst}</td>
                <td>${goalDifference}</td>
                <td><strong>${team.points}</strong></td>
            `;
            
            if (rowClass) row.classList.add(rowClass);
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка загрузки таблицы:', error);
        tbody.innerHTML = '<tr><td colspan="11">Ошибка загрузки данных</td></tr>';
    }
}

function setupTableSorting() {
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            sortButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // В реальном приложении здесь была бы пересортировка
            loadTable(); // Перезагружаем с сервера
        });
    });
    
    // Поиск команд
    const searchInput = document.getElementById('searchTeam');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#tableBody tr');
            
            rows.forEach(row => {
                const teamName = row.querySelector('.team-name').textContent.toLowerCase();
                if (teamName.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}

// Проверяем регистрацию пользователя при загрузке main.html
if (window.location.pathname.includes('main.html')) {
    const userTeam = localStorage.getItem('userTeam') || 'Не зарегистрирован';
    document.getElementById('userTeam').textContent = userTeam;
}