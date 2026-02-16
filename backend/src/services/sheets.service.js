const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;

function normalizeRole(telegramId, rawRole) {
  if (ADMIN_TELEGRAM_ID) {
    return String(telegramId) === String(ADMIN_TELEGRAM_ID) ? 'admin' : 'employee';
  }

  const role = String(rawRole || '').trim().toLowerCase();
  return role === 'admin' ? 'admin' : 'employee';
}

class SheetsService {
  constructor() {
  let credentials;
  
    // Пробуем получить из переменной окружения
    if (process.env.GOOGLE_CREDENTIALS) {
        try {
        credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        console.log('✅ Credentials загружены из переменной окружения');
        } catch (error) {
        console.error('❌ Ошибка парсинга GOOGLE_CREDENTIALS:', error);
        }
    }
    
    // Пробуем получить из Secret File на Render
    if (!credentials) {
        try {
        credentials = require('/etc/secrets/credentials.json');
        console.log('✅ Credentials загружены из /etc/secrets/');
        } catch (error) {
        console.log('⚠️  Не найдено в /etc/secrets/');
        }
    }
    
    // Для локальной разработки - из файла
    if (!credentials) {
        try {
        credentials = require(path.join(__dirname, '../../config/credentials.json'));
        console.log('✅ Credentials загружены из локального файла');
        } catch (error) {
        console.error('❌ Ошибка загрузки credentials:', error);
        }
    }

    if (!credentials) {
        throw new Error('❌ CREDENTIALS НЕ НАЙДЕНЫ! Проверьте настройки.');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = process.env.SHEET_ID;
    }

  // Получить все данные из листа
  async getSheetData(sheetName) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
      });
      return response.data.values || [];
    } catch (error) {
      console.error('Ошибка при чтении данных:', error);
      throw error;
    }
  }

  // Добавить строку в лист
  async appendRow(sheetName, values) {
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [values] },
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при добавлении строки:', error);
      throw error;
    }
  }

  // Обновить строку
  async updateRow(sheetName, rowIndex, values) {
    try {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [values] },
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении строки:', error);
      throw error;
    }
  }

  // Получить пользователя по Telegram ID
  async getUserByTelegramId(telegramId) {
    const data = await this.getSheetData('Users');
    const headers = data[0];
    const rows = data.slice(1);

    const user = rows.find(row => row[0] === String(telegramId));
    if (!user) return null;

    return {
      telegram_id: user[0],
      username: user[1],
      full_name: user[2],
      role: normalizeRole(user[0], user[3]),
      join_date: user[4],
      active: user[5],
    };
  }

  // Добавить нового пользователя
  async addUser(telegramId, username, fullName, role = 'employee') {
    const values = [
      String(telegramId),
      username || '',
      fullName || '',
      role,
      new Date().toISOString().split('T')[0],
      'TRUE',
    ];
    return await this.appendRow('Users', values);
  }

  // Получить все задачи пользователя
  async getUserTasks(telegramId) {
    const data = await this.getSheetData('Tasks');
    if (data.length === 0) return [];

    const headers = data[0];
    const rows = data.slice(1);

    const tasks = rows
      .map((row, index) => ({
        rowIndex: index + 2, // +2 потому что заголовок это строка 1
        task_id: row[0],
        title: row[1],
        description: row[2],
        assigned_to_id: row[3],
        assigned_by_id: row[4],
        status: row[5],
        priority: row[6],
        created_date: row[7],
        deadline: row[8],
        completed_date: row[9],
        comments: row[10],
      }))
      .filter(task => task.assigned_to_id === String(telegramId));

    return tasks;
  }

  // Получить все задачи (для админа)
  async getAllTasks() {
    const data = await this.getSheetData('Tasks');
    if (data.length === 0) return [];

    const rows = data.slice(1);

    const tasks = rows.map((row, index) => ({
      rowIndex: index + 2,
      task_id: row[0],
      title: row[1],
      description: row[2],
      assigned_to_id: row[3],
      assigned_by_id: row[4],
      status: row[5],
      priority: row[6],
      created_date: row[7],
      deadline: row[8],
      completed_date: row[9],
      comments: row[10],
    }));

    return tasks;
  }

  // Создать новую задачу
  async createTask(title, description, assignedToId, assignedById, priority = 'medium', deadline = '') {
    const taskId = 'TASK_' + Date.now();
    const values = [
      taskId,
      title,
      description,
      String(assignedToId),
      String(assignedById),
      'new',
      priority,
      new Date().toISOString().split('T')[0],
      deadline,
      '',
      '',
    ];
    await this.appendRow('Tasks', values);
    return { task_id: taskId };
  }

  // Обновить статус задачи
  async updateTaskStatus(taskId, newStatus) {
    const data = await this.getSheetData('Tasks');
    const rows = data.slice(1);

    const taskIndex = rows.findIndex(row => row[0] === taskId);
    if (taskIndex === -1) throw new Error('Задача не найдена');

    const rowIndex = taskIndex + 2;
    const task = rows[taskIndex];
    
    task[5] = newStatus; // status column
    if (newStatus === 'completed') {
      task[9] = new Date().toISOString().split('T')[0]; // completed_date
    }

    return await this.updateRow('Tasks', rowIndex, task);
  }

  // Получить всех пользователей
  async getAllUsers() {
    const data = await this.getSheetData('Users');
    if (data.length === 0) return [];

    const rows = data.slice(1);

    return rows.map(row => ({
      telegram_id: row[0],
      username: row[1],
      full_name: row[2],
      role: normalizeRole(row[0], row[3]),
      join_date: row[4],
      active: row[5],
    }));
  }
}

module.exports = new SheetsService();