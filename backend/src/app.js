const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.routes');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://localhost:5173',
  'http://localhost:8080',
  'https://localhost:8080',
  'https://task-manager-frontend.onrender.com',
  /\.onrender\.com$/
];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
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
