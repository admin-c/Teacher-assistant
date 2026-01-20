const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (замените на базу данных в продакшене)
let teams = [];
let pendingRegistrations = [];
let news = [];
let matches = [];
let table = [];

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

app.get('/api/table', (req, res) => {
    // Сортировка таблицы по очкам
    const sortedTable = [...table].sort((a, b) => b.points - a.points);
    res.json(sortedTable);
});

app.post('/api/update-table', (req, res) => {
    // Здесь можно реализовать логику обновления таблицы на основе результатов матчей
    res.json({ message: 'Таблица обновлена' });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});