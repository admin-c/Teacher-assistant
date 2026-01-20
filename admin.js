// API конфигурация
const API_BASE_URL = 'https://champion-league.onrender.com/api'; // Замените на ваш API URL
let isAuthenticated = false;

function login() {
    const password = document.getElementById('admin-password').value;
    if (password === 'Ali') {
        isAuthenticated = true;
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        loadPendingRegistrations();
        loadMatchControls();
    } else {
        alert('Неверный пароль');
    }
}

async function loadPendingRegistrations() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/pending-registrations`);
        const registrations = await response.json();
        
        const container = document.getElementById('pending-registrations');
        container.innerHTML = '';
        
        registrations.forEach((reg, index) => {
            const regElement = document.createElement('div');
            regElement.className = 'registration-item load-in';
            regElement.style.animationDelay = `${index * 0.1}s`;
            regElement.innerHTML = `
                <p><strong>Команда:</strong> ${reg.teamName}</p>
                <p><strong>Владелец:</strong> ${reg.ownerName}</p>
                <button onclick="approveRegistration('${reg.id}')">Подтвердить</button>
                <button onclick="rejectRegistration('${reg.id}')">Отклонить</button>
            `;
            container.appendChild(regElement);
        });
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
    }
}

async function approveRegistration(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/approve-registration/${id}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            loadPendingRegistrations();
        }
    } catch (error) {
        console.error('Ошибка подтверждения:', error);
    }
}

async function rejectRegistration(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/reject-registration/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadPendingRegistrations();
        }
    } catch (error) {
        console.error('Ошибка отклонения:', error);
    }
}

async function addNews() {
    if (!isAuthenticated) return;
    
    const content = document.getElementById('news-content').value;
    if (!content) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/news`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                title: 'Новость от администратора',
                content: content,
                date: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            document.getElementById('news-content').value = '';
            alert('Новость добавлена');
        }
    } catch (error) {
        console.error('Ошибка добавления новости:', error);
    }
}

async function loadMatchControls() {
    if (!isAuthenticated) return;
    
    const container = document.getElementById('match-controls');
    container.innerHTML = `
        <form id="match-form">
            <input type="text" id="team1" placeholder="Команда 1" required>
            <input type="text" id="team2" placeholder="Команда 2" required>
            <input type="datetime-local" id="match-date" required>
            <button type="submit">Добавить матч</button>
        </form>
    `;
    
    document.getElementById('match-form').addEventListener('submit', addMatch);
}

async function addMatch(e) {
    e.preventDefault();
    
    const team1 = document.getElementById('team1').value;
    const team2 = document.getElementById('team2').value;
    const date = document.getElementById('match-date').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/matches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                team1,
                team2,
                date,
                status: 'Запланирован'
            })
        });
        
        if (response.ok) {
            document.getElementById('match-form').reset();
            alert('Матч добавлен');
        }
    } catch (error) {
        console.error('Ошибка добавления матча:', error);
    }
}

async function updateTable() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/update-table`, {
            method: 'POST'
        });
        
        if (response.ok) {
            alert('Таблица обновлена');
        }
    } catch (error) {
        console.error('Ошибка обновления таблицы:', error);
    }

}
