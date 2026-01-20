const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Файлы базы данных
const DB_FILE = 'db.json';
const NEWS_FILE = 'news.json';

// Инициализация базы данных
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      teams: [],
      matches: [],
      confirmedTeams: [],
      adminPassword: "Ali"
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
  
  if (!fs.existsSync(NEWS_FILE)) {
    const initialNews = {
      news: []
    };
    fs.writeFileSync(NEWS_FILE, JSON.stringify(initialNews, null, 2));
  }
}

// API для получения команд
app.get('/api/teams', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(data.confirmedTeams);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка чтения данных' });
  }
});

// API для регистрации команды
app.post('/api/register', (req, res) => {
  try {
    const { teamName, ownerName } = req.body;
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    
    const newTeam = {
      id: Date.now(),
      teamName,
      ownerName,
      points: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      status: 'pending',
      registrationDate: new Date().toISOString()
    };
    
    data.teams.push(newTeam);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    
    res.json({ success: true, message: 'Заявка отправлена на подтверждение' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// API для админ-панели
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const data = JSON.parse(fs.readFileSync(DB_FILE));
  
  if (password === data.adminPassword) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// API для получения заявок
app.get('/api/admin/pending', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(data.teams.filter(team => team.status === 'pending'));
  } catch (error) {
    res.status(500).json({ error: 'Ошибка чтения' });
  }
});

// API для подтверждения команды
app.post('/api/admin/confirm', (req, res) => {
  try {
    const { teamId } = req.body;
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    
    const teamIndex = data.teams.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
      data.teams[teamIndex].status = 'confirmed';
      data.confirmedTeams.push(data.teams[teamIndex]);
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

// API для отклонения команды
app.post('/api/admin/reject', (req, res) => {
  try {
    const { teamId } = req.body;
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    
    const teamIndex = data.teams.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
      data.teams[teamIndex].status = 'rejected';
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

// API для обновления результатов
app.post('/api/admin/update-results', (req, res) => {
  try {
    const { teamId, points, wins, draws, losses, goalsFor, goalsAgainst } = req.body;
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    
    const teamIndex = data.confirmedTeams.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
      data.confirmedTeams[teamIndex] = {
        ...data.confirmedTeams[teamIndex],
        points: points || 0,
        wins: wins || 0,
        draws: draws || 0,
        losses: losses || 0,
        goalsFor: goalsFor || 0,
        goalsAgainst: goalsAgainst || 0,
        played: (wins || 0) + (draws || 0) + (losses || 0)
      };
      
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

// API для новостей
app.get('/api/news', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(NEWS_FILE));
    res.json(data.news);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка чтения новостей' });
  }
});

app.post('/api/admin/add-news', (req, res) => {
  try {
    const { title, content } = req.body;
    const data = JSON.parse(fs.readFileSync(NEWS_FILE));
    
    const newNews = {
      id: Date.now(),
      title,
      content,
      date: new Date().toLocaleDateString('ru-RU'),
      time: new Date().toLocaleTimeString('ru-RU')
    };
    
    data.news.unshift(newNews);
    fs.writeFileSync(NEWS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка добавления новости' });
  }
});

// ВСЕ остальные маршруты отдают index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Инициализация и запуск
initDB();
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Доступ по: http://localhost:${PORT}`);
});