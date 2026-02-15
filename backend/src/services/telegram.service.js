const TelegramBot = require('node-telegram-bot-api');
const sheetsService = require('./sheets.service');
require('dotenv').config();

class TelegramService {
  constructor() {
    this.bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
    this.initializeBot();
  }

  initializeBot() {
    console.log('🤖 Telegram бот запущен...');

    // Команда /start
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      const username = msg.from.username || '';
      const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

      try {
        // Проверяем, есть ли пользователь в базе
        let user = await sheetsService.getUserByTelegramId(telegramId);

        if (!user) {
          // Регистрируем нового пользователя
          await sheetsService.addUser(telegramId, username, fullName, 'employee');
          
          this.bot.sendMessage(
            chatId,
            `👋 Добро пожаловать, ${fullName}!\n\n` +
            `Вы успешно зарегистрированы в системе задач.\n` +
            `Используйте команды:\n\n` +
            `/mytasks - Мои задачи\n` +
            `/help - Помощь`
          );
        } else {
          this.bot.sendMessage(
            chatId,
            `👋 С возвращением, ${user.full_name}!\n\n` +
            `Используйте команды:\n` +
            `/mytasks - Мои задачи\n` +
            `/help - Помощь`
          );
        }
      } catch (error) {
        console.error('Ошибка при регистрации:', error);
        this.bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
      }
    });

    // Команда /mytasks
    this.bot.onText(/\/mytasks/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
        const tasks = await sheetsService.getUserTasks(telegramId);

        if (tasks.length === 0) {
        this.bot.sendMessage(chatId, '📋 У вас пока нет задач.');
        return;
        }

        let message = '📋 Ваши задачи:\n\n';

        tasks.forEach((task, index) => {
        const statusEmoji = this.getStatusEmoji(task.status);
        const priorityEmoji = this.getPriorityEmoji(task.priority);
        
        message += `${index + 1}. ${statusEmoji} ${task.title}\n`;
        message += `   ${priorityEmoji} Приоритет: ${task.priority}\n`;
        message += `   📅 Дедлайн: ${task.deadline || 'не указан'}\n`;
        message += `   Статус: ${task.status}\n`;
        message += `   ID: ${task.task_id}\n\n`;
        });

        message += '\n💡 Чтобы отметить задачу выполненной, используйте:\n';
        message += '/complete TASK_ID';

        this.bot.sendMessage(chatId, message);
    } catch (error) {
        console.error('Ошибка при получении задач:', error);
        this.bot.sendMessage(chatId, '❌ Ошибка при получении задач.');
    }
    });

    // Команда /complete
    this.bot.onText(/\/complete (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const taskId = match[1].trim();

      try {
        await sheetsService.updateTaskStatus(taskId, 'completed');
        this.bot.sendMessage(chatId, `✅ Задача ${taskId} отмечена как выполненная!`);
      } catch (error) {
        console.error('Ошибка при обновлении задачи:', error);
        this.bot.sendMessage(chatId, '❌ Ошибка. Проверьте ID задачи.');
      }
    });

   
    // Команда /help
    this.bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `🤖 Доступные команды:

    /start - Регистрация в системе
    /mytasks - Показать мои задачи
    /complete TASK_ID - Отметить задачу выполненной
    /help - Показать эту справку

    📱 Для работы с задачами через Mini App:
    Нажмите на кнопку меню внизу `;

    this.bot.sendMessage(chatId, helpMessage);
    });
  }

  getStatusEmoji(status) {
    const emojis = {
      'new': '🆕',
      'in_progress': '🔄',
      'completed': '✅',
      'cancelled': '❌'
    };
    return emojis[status] || '📌';
  }

  getPriorityEmoji(priority) {
    const emojis = {
      'low': '🟢',
      'medium': '🟡',
      'high': '🔴'
    };
    return emojis[priority] || '⚪';
  }

  // Отправить уведомление пользователю
  async sendNotification(telegramId, message) {
    try {
      await this.bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
    }
  }
}

module.exports = new TelegramService();