// Этот файл объединяет все API вызовы
const API_CONFIG = {
    baseUrl: 'https://your-api-url.onrender.com/api', // Замените на ваш API URL
    headers: {
        'Content-Type': 'application/json'
    }
};

class ApiService {
    static async makeRequest(endpoint, options = {}) {
        const url = `${API_CONFIG.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...API_CONFIG.headers,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // Регистрация команды
    static async registerTeam(teamData) {
        return this.makeRequest('/register-team', {
            method: 'POST',
            body: JSON.stringify(teamData)
        });
    }
    
    // Получение новостей
    static async getNews() {
        return this.makeRequest('/news');
    }
    
    // Получение расписания матчей
    static async getMatches() {
        return this.makeRequest('/matches');
    }
    
    // Получение турнирной таблицы
    static async getTable() {
        return this.makeRequest('/table');
    }
    
    // Получение ожидающих регистраций
    static async getPendingRegistrations() {
        return this.makeRequest('/pending-registrations');
    }
    
    // Подтверждение регистрации
    static async approveRegistration(id) {
        return this.makeRequest(`/approve-registration/${id}`, {
            method: 'POST'
        });
    }
    
    // Отклонение регистрации
    static async rejectRegistration(id) {
        return this.makeRequest(`/reject-registration/${id}`, {
            method: 'DELETE'
        });
    }
    
    // Добавление новости
    static async addNews(newsData) {
        return this.makeRequest('/news', {
            method: 'POST',
            body: JSON.stringify(newsData)
        });
    }
    
    // Добавление матча
    static async addMatch(matchData) {
        return this.makeRequest('/matches', {
            method: 'POST',
            body: JSON.stringify(matchData)
        });
    }
    
    // Обновление таблицы
    static async updateTable() {
        return this.makeRequest('/update-table', {
            method: 'POST'
        });
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}