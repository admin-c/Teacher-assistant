// API конфигурация
const API_BASE_URL = 'https://champion-league.onrender.com/api';
let isAuthenticated = false;

function login() {
    const password = document.getElementById('admin-password').value;
    if (password === 'Ali') {
        isAuthenticated = true;
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        
        // Загружаем начальные данные
        loadPendingRegistrations();
        loadTeamsList();
        loadMatchesList();
        loadResultsList();
    } else {
        alert('❌ Неверный пароль!');
    }
}

function logout() {
    isAuthenticated = false;
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('admin-password').value = '';
}

// Переключение вкладок
document.querySelectorAll('.admin-tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        button.classList.add('active');
        
        const tabId = button.getAttribute('data-tab');
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`tab-${tabId}`);
        if (targetTab) {
            targetTab.classList.add('active');
            
            if (tabId === 'registrations') {
                loadPendingRegistrations();
            } else if (tabId === 'teams') {
                loadTeamsList();
            } else if (tabId === 'matches') {
                loadMatchesList();
            } else if (tabId === 'results') {
                loadResultsList();
            }
        }
    });
});

// Заявки
async function loadPendingRegistrations() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/pending-registrations`);
        const registrations = await response.json();
        
        const container = document.getElementById('pending-registrations');
        container.innerHTML = '';
        
        if (registrations.length === 0) {
            container.innerHTML = '<div class="admin-card"><p>📋 Заявок нет</p></div>';
            return;
        }
        
        registrations.forEach((reg, index) => {
            const regElement = document.createElement('div');
            regElement.className = 'admin-card';
            regElement.innerHTML = `
                <p><strong>Команда:</strong> ${reg.teamName}</p>
                <p><strong>Владелец:</strong> ${reg.ownerName}</p>
                <p><strong>Дата:</strong> ${new Date(reg.timestamp).toLocaleString('ru-RU')}</p>
                <button onclick="approveRegistration('${reg.id}')" style="margin-right: 10px;">✅ Подтвердить</button>
                <button onclick="rejectRegistration('${reg.id}')">❌ Отклонить</button>
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
            alert('✅ Заявка подтверждена!');
            loadPendingRegistrations();
            loadTeamsList();
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
            alert('❌ Заявка отклонена!');
            loadPendingRegistrations();
        }
    } catch (error) {
        console.error('Ошибка отклонения:', error);
    }
}

// Команды
async function loadTeamsList() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/teams`);
        const teams = await response.json();
        
        const container = document.getElementById('teams-list');
        container.innerHTML = '';
        
        if (teams.length === 0) {
            container.innerHTML = '<div class="admin-card"><p>👥 Команд нет</p></div>';
            return;
        }
        
        teams.forEach((team, index) => {
            const teamElement = document.createElement('div');
            teamElement.className = 'admin-card';
            teamElement.innerHTML = `
                <p><strong>Команда:</strong> ${team.name}</p>
                <p><strong>Владелец:</strong> ${team.owner}</p>
                <button onclick="editTeam('${team.id}', '${team.name}', '${team.owner}')" style="margin-right: 10px;">✏️ Редактировать</button>
                <button onclick="deleteTeam('${team.id}')">🗑️ Удалить</button>
            `;
            container.appendChild(teamElement);
        });
    } catch (error) {
        console.error('Ошибка загрузки команд:', error);
    }
}

async function editTeam(id, name, owner) {
    const newName = prompt('Введите новое название команды:', name);
    const newOwner = prompt('Введите нового владельца:', owner);
    
    if (newName && newOwner) {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newName, owner: newOwner })
            });
            
            if (response.ok) {
                alert('✅ Команда обновлена!');
                loadTeamsList();
            }
        } catch (error) {
            console.error('Ошибка редактирования:', error);
        }
    }
}

async function deleteTeam(id) {
    if (confirm('⚠️ Вы уверены, что хотите удалить эту команду?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('✅ Команда удалена!');
                loadTeamsList();
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    }
}

// Жеребьёвка
async function performDraw() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/perform-draw`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        const container = document.getElementById('draw-results');
        container.innerHTML = '<h4>🎲 Сгенерированные пары:</h4>';
        
        if (result.pairs && result.pairs.length > 0) {
            result.pairs.forEach(pair => {
                const pairElement = document.createElement('p');
                pairElement.innerHTML = `⚔️ ${pair.team1} vs ${pair.team2}`;
                container.appendChild(pairElement);
            });
        } else {
            container.innerHTML = '<p>❌ Недостаточно команд для жеребьёвки</p>';
        }
    } catch (error) {
        console.error('Ошибка жеребьёвки:', error);
    }
}

// Матчи
async function loadMatchesList() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/matches`);
        const matches = await response.json();
        
        const container = document.getElementById('matches-list');
        container.innerHTML = '';
        
        if (matches.length === 0) {
            container.innerHTML = '<div class="admin-card"><p>⚽ Матчей нет</p></div>';
            return;
        }
        
        matches.forEach((match, index) => {
            const matchElement = document.createElement('div');
            matchElement.className = 'admin-card';
            matchElement.innerHTML = `
                <p><strong>⚔️ ${match.team1} vs ${match.team2}</strong></p>
                <p>📅 ${new Date(match.date).toLocaleString('ru-RU')}</p>
                <p>📊 Статус: ${match.status}</p>
                ${match.score1 !== undefined && match.score2 !== undefined ? 
                    `<p>🏆 Счёт: ${match.score1} - ${match.score2}</p>` : ''}
                <button onclick="updateMatchScore('${match.id}', '${match.team1}', '${match.team2}')">📝 Обновить счёт</button>
            `;
            container.appendChild(matchElement);
        });
    } catch (error) {
        console.error('Ошибка загрузки матчей:', error);
    }
}

async function updateMatchScore(matchId, team1, team2) {
    const score1 = prompt(`Введите счёт для ${team1}:`, '0');
    const score2 = prompt(`Введите счёт для ${team2}:`, '0');
    
    if (score1 !== null && score2 !== null) {
        try {
            const response = await fetch(`${API_BASE_URL}/matches/${matchId}/score`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ score1: parseInt(score1), score2: parseInt(score2) })
            });
            
            if (response.ok) {
                alert('✅ Счёт обновлён!');
                loadMatchesList();
                loadResultsList();
                
                // Обновляем таблицу на клиентской стороне
                if (window.loadTable) {
                    setTimeout(window.loadTable, 1000);
                }
            }
        } catch (error) {
            console.error('Ошибка обновления счёта:', error);
        }
    }
}

// Результаты
async function loadResultsList() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/results`);
        const results = await response.json();
        
        const container = document.getElementById('results-list');
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = '<div class="admin-card"><p>📊 Результатов нет</p></div>';
            return;
        }
        
        results.forEach((result, index) => {
            const resultElement = document.createElement('div');
            resultElement.className = 'admin-card';
            resultElement.innerHTML = `
                <p><strong>🏆 ${result.team1} ${result.score1} - ${result.score2} ${result.team2}</strong></p>
                <p> Тур: ${result.round}</p>
                <p>📅 ${new Date(result.date).toLocaleDateString('ru-RU')}</p>
                <button onclick="editResult('${result.id}', '${result.score1}', '${result.score2}')" style="margin-right: 10px;">✏️ Редактировать</button>
                <button onclick="deleteResult('${result.id}')">🗑️ Удалить</button>
            `;
            container.appendChild(resultElement);
        });
    } catch (error) {
        console.error('Ошибка загрузки результатов:', error);
    }
}

async function editResult(id, currentScore1, currentScore2) {
    const newScore1 = prompt('Введите новый счёт первой команды:', currentScore1);
    const newScore2 = prompt('Введите новый счёт второй команды:', currentScore2);
    
    if (newScore1 !== null && newScore2 !== null) {
        try {
            const response = await fetch(`${API_BASE_URL}/results/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ score1: parseInt(newScore1), score2: parseInt(newScore2) })
            });
            
            if (response.ok) {
                alert('✅ Результат обновлён!');
                loadResultsList();
                
                if (window.loadTable) {
                    setTimeout(window.loadTable, 1000);
                }
            }
        } catch (error) {
            console.error('Ошибка редактирования:', error);
        }
    }
}

async function deleteResult(id) {
    if (confirm('⚠️ Вы уверены, что хотите удалить этот результат?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/results/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('✅ Результат удалён!');
                loadResultsList();
                
                if (window.loadTable) {
                    setTimeout(window.loadTable, 1000);
                }
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    }
}

// Новости
async function addNews() {
    if (!isAuthenticated) return;
    
    const content = document.getElementById('news-content').value;
    if (!content.trim()) {
        alert('❌ Введите текст новости!');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/news`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                title: '📢 Новость от администратора',
                content: content,
                date: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            alert('✅ Новость добавлена!');
            document.getElementById('news-content').value = '';
        }
    } catch (error) {
        console.error('Ошибка добавления новости:', error);
    }
}
