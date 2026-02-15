const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.routes');
const telegramService = require('./services/telegram.service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Базовый route
app.get('/', (req, res) => {
  res.json({ 
    message: '🤖 Task Manager Bot API работает!',
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks',
      userTasks: '/api/tasks/:telegramId',
      createTask: 'POST /api/tasks',
      updateStatus: 'PATCH /api/tasks/:taskId/status'
    }
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен на http://localhost:${PORT}`);
});

// Инициализация
async function init() {
  try {
    console.log('Начало инициализации...');
    console.log('Telegram ID:', telegramId);
    console.log('API URL:', API_URL);
    
    // Получаем данные пользователя
    console.log('Загружаем пользователя...');
    const userResponse = await fetch(`${API_URL}/user/${telegramId}`);
    
    console.log('User response status:', userResponse.status);
    
    if (!userResponse.ok) {
      throw new Error('Пользователь не найден');
    }
    
    currentUser = await userResponse.json();
    console.log('Пользователь загружен:', currentUser);
    
    // Обновляем UI
    userName.textContent = currentUser.full_name || currentUser.username;
    userRole.textContent = currentUser.role;
    userRole.classList.add(currentUser.role);
    
    // Показываем кнопку создания задачи для админа
    if (currentUser.role === 'admin') {
      createTaskBtn.style.display = 'block';
    }
    
    // Загружаем задачи
    console.log('Загружаем задачи...');
    await loadTasks();
    console.log('Задачи загружены');
    
    // Если админ - загружаем список пользователей для формы
    if (currentUser.role === 'admin') {
      console.log('Загружаем список пользователей...');
      await loadUsers();
    }
    
    // Показываем главный экран
    console.log('Показываем главный экран');
    showScreen('main');
    
  } catch (error) {
    console.error('Ошибка инициализации:', error);
    tg.showAlert('Ошибка загрузки данных. Попробуйте позже.');
  }
}