const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.routes');
const telegramService = require('./services/telegram.service');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'https://task-manager-frontend-1rbo.onrender.com',
  /\.onrender\.com$/
];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (например, мобильные приложения, Postman)
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.some((allowedOrigin) => (
      allowedOrigin instanceof RegExp
        ? allowedOrigin.test(origin)
        : allowedOrigin === origin
    ));

    if (isAllowed) {
      return callback(null, true);
    }

    console.log(`❌ CORS blocked for origin: ${origin}`);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
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