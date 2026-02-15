const express = require('express');
const router = express.Router();
const sheetsService = require('../services/sheets.service');
const telegramService = require('../services/telegram.service');

// Получить информацию о пользователе
router.get('/user/:telegramId', async (req, res) => {
  try {
    const user = await sheetsService.getUserByTelegramId(req.params.telegramId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить задачи пользователя
router.get('/tasks/:telegramId', async (req, res) => {
  try {
    const tasks = await sheetsService.getUserTasks(req.params.telegramId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все задачи (только для админа)
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await sheetsService.getAllTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить всех пользователей (только для админа)
router.get('/users', async (req, res) => {
  try {
    const users = await sheetsService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новую задачу
router.post('/tasks', async (req, res) => {
  try {
    const { title, description, assigned_to_id, assigned_by_id, priority, deadline } = req.body;
    
    if (!title || !assigned_to_id || !assigned_by_id) {
      return res.status(400).json({ error: 'Недостаточно данных' });
    }

    const result = await sheetsService.createTask(
      title,
      description,
      assigned_to_id,
      assigned_by_id,
      priority,
      deadline
    );

    // Отправить уведомление исполнителю
    const message = `📋 *Новая задача!*\n\n*${title}*\n${description}\n\n📅 Дедлайн: ${deadline || 'не указан'}`;
    await telegramService.sendNotification(assigned_to_id, message);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить статус задачи
router.patch('/tasks/:taskId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await sheetsService.updateTaskStatus(req.params.taskId, status);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;