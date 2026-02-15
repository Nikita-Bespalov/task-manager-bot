const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.routes');
const telegramService = require('./services/telegram.service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://localhost:5173',
    'https://task-manager-frontend.onrender.com',
    /\.onrender\.com$/  // Разрешить все поддомены onrender.com
  ],
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

