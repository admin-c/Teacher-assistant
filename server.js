const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// In-memory storage (замените на базу данных в продакшене)
let teams = [];
let pendingRegistrations = [];
let news = [];
let matches = [];
let results = [];
let table = [];
let currentRound = 1;

// Routes
app.post('/api/register-team', (req, res) => {
    const { teamName, ownerName } = req.body;
    const newRegistration = {
        id: Date.now().toString(),
        teamName,
        ownerName,
        timestamp: new Date()
    };
    
    pendingRegistrations.push(newRegistration);
    res.status(200).json({ message: 'Команда зарегистрирована на подтверждение' });
});

app.get('/api/pending-registrations', (req, res) => {
    res.json(pendingRegistrations);
});

app.post('/api/approve-registration/:id', (req, res) => {
    const id = req.params.id;
    const index = pendingRegistrations.findIndex(r => r.id === id);
    
    if (index !== -1) {
        const registration = pendingRegistrations[index];
        teams.push({
            id: registration.id,
            name: registration.teamName,
            owner: registration.ownerName
        });
        
        // Добавляем команду в таблицу
        table.push({
            id: registration.id,
            name: registration.teamName,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            points: 0
        });
        
        pendingRegistrations.splice(index, 1);
        res.json({ message: 'Регистрация подтверждена' });
    } else {
        res.status(404).json({ error: 'Регистрация не найдена' });
    }
});

app.delete('/api/reject-registration/:id', (req, res) => {
    const id = req.params.id;
    const index = pendingRegistrations.findIndex(r => r.id === id);
    
    if (index !== -1) {
        pendingRegistrations.splice(index, 1);
        res.json({ message: 'Регистрация отклонена' });
    } else {
        res.status(404).json({ error: 'Регистрация не найдена' });
    }
});

app.get('/api/teams', (req, res) => {
    res.json(teams);
});

app.put('/api/teams/:id', (req, res) => {
    const id = req.params.id;
    const { name, owner } = req.body;
    const teamIndex = teams.findIndex(t => t.id === id);
    
    if (teamIndex !== -1) {
        teams[teamIndex].name = name;
        teams[teamIndex].owner = owner;
        
        // Обновляем имя в таблице
        const tableIndex = table.findIndex(t => t.id === id);
        if (tableIndex !== -1) {
            table[tableIndex].name = name;
        }
        
        res.json({ message: 'Команда обновлена' });
    } else {
        res.status(404).json({ error: 'Команда не найдена' });
    }
});

app.delete('/api/teams/:id', (req, res) => {
    const id = req.params.id;
    const teamIndex = teams.findIndex(t => t.id === id);
    
    if (teamIndex !== -1) {
        teams.splice(teamIndex, 1);
        
        // Удаляем из таблицы
        const tableIndex = table.findIndex(t => t.id === id);
        if (tableIndex !== -1) {
            table.splice(tableIndex, 1);
        }
        
        // Удаляем из матчей и результатов
        matches = matches.filter(m => m.team1Id !== id && m.team2Id !== id);
        results = results.filter(r => r.team1Id !== id && r.team2Id !== id);
        
        res.json({ message: 'Команда удалена' });
    } else {
        res.status(404).json({ error: 'Команда не найдена' });
    }
});

app.get('/api/news', (req, res) => {
    res.json(news);
});

app.post('/api/news', (req, res) => {
    const { title, content, date } = req.body;
    news.unshift({
        id: Date.now().toString(),
        title,
        content,
        date: date || new Date().toISOString()
    });
    res.json({ message: 'Новость добавлена' });
});

app.get('/api/matches', (req, res) => {
    res.json(matches);
});

app.post('/api/matches', (req, res) => {
    const { team1, team2, date, status } = req.body;
    matches.push({
        id: Date.now().toString(),
        team1,
        team2,
        date,
        status: status || 'Запланирован'
    });
    res.json({ message: 'Матч добавлен' });
});

app.put('/api/matches/:id/score', (req, res) => {
    const id = req.params.id;
    const { score1, score2 } = req.body;
    
    const matchIndex = matches.findIndex(m => m.id === id);
    if (matchIndex !== -1) {
        matches[matchIndex].score1 = score1;
        matches[matchIndex].score2 = score2;
        matches[matchIndex].status = 'Завершён';
        
        // Добавляем результат
        results.push({
            id: Date.now().toString(),
            team1: matches[matchIndex].team1,
            team2: matches[matchIndex].team2,
            score1,
            score2,
            round: currentRound,
            date: new Date().toISOString()
        });
        
        // Обновляем таблицу
        updateTableFromResults();
        
        res.json({ message: 'Счёт обновлён' });
    } else {
        res.status(404).json({ error: 'Матч не найден' });
    }
});

app.get('/api/results', (req, res) => {
    res.json(results);
});

app.put('/api/results/:id', (req, res) => {
    const id = req.params.id;
    const { score1, score2 } = req.body;
    
    const resultIndex = results.findIndex(r => r.id === id);
    if (resultIndex !== -1) {
        results[resultIndex].score1 = score1;
        results[resultIndex].score2 = score2;
        
        // Обновляем соответствующий матч
        const match = matches.find(m => m.team1 === results[resultIndex].team1 && m.team2 === results[resultIndex].team2);
        if (match) {
            match.score1 = score1;
            match.score2 = score2;
        }
        
        updateTableFromResults();
        
        res.json({ message: 'Результат обновлён' });
    } else {
        res.status(404).json({ error: 'Результат не найден' });
    }
});

app.delete('/api/results/:id', (req, res) => {
    const id = req.params.id;
    const resultIndex = results.findIndex(r => r.id === id);
    
    if (resultIndex !== -1) {
        results.splice(resultIndex, 1);
        
        // Обновляем таблицу
        updateTableFromResults();
        
        res.json({ message: 'Результат удалён' });
    } else {
        res.status(404).json({ error: 'Результат не найден' });
    }
});

app.get('/api/table', (req, res) => {
    const sortedTable = [...table].sort((a, b) => b.points - a.points);
    res.json(sortedTable);
});

app.post('/api/perform-draw', (req, res) => {
    if (teams.length < 2) {
        return res.status(400).json({ error: 'Недостаточно команд для жеребьёвки' });
    }
    
    // Создаём копию команд для жеребьёвки
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const pairs = [];
    
    // Формируем пары (простой алгоритм - чётные против нечётных)
    for (let i = 0; i < shuffledTeams.length - 1; i += 2) {
        pairs.push({
            team1: shuffledTeams[i].name,
            team2: shuffledTeams[i + 1].name
        });
    }
    
    // Сохраняем матчи для тура
    pairs.forEach(pair => {
        matches.push({
            id: Date.now().toString() + Math.random(),
            team1: pair.team1,
            team2: pair.team2,
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Через неделю
            status: 'Запланирован'
        });
    });
    
    currentRound++;
    
    res.json({ pairs, message: 'Жеребьёвка проведена, матчи созданы' });
});

function updateTableFromResults() {
    // Сбрасываем таблицу
    table.forEach(team => {
        team.played = 0;
        team.wins = 0;
        team.draws = 0;
        team.losses = 0;
        team.points = 0;
    });
    
    // Обновляем статистику по результатам
    results.forEach(result => {
        const team1Index = table.findIndex(t => t.name === result.team1);
        const team2Index = table.findIndex(t => t.name === result.team2);
        
        if (team1Index !== -1 && team2Index !== -1) {
            // Обновляем количество игр
            table[team1Index].played++;
            table[team2Index].played++;
            
            // Обновляем результаты
            if (result.score1 > result.score2) {
                table[team1Index].wins++;
                table[team1Index].points += 3;
                table[team2Index].losses++;
            } else if (result.score1 < result.score2) {
                table[team2Index].wins++;
                table[team2Index].points += 3;
                table[team1Index].losses++;
            } else {
                table[team1Index].draws++;
                table[team1Index].points += 1;
                table[team2Index].draws++;
                table[team2Index].points += 1;
            }
        }
    });
}

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
