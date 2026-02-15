// Telegram WebApp API
const tg = window.Telegram.WebApp;
tg.expand();

// API URL - ВАЖНО: измените на ваш URL когда задеплоите backend
const API_URL = 'http://localhost:3000/api';

// Глобальные переменные
let currentUser = null;
let allTasks = [];
let allUsers = [];
let currentFilter = 'all';
let selectedTask = null;

// Элементы DOM
const loadingScreen = document.getElementById('loading-screen');
const mainScreen = document.getElementById('main-screen');
const createTaskScreen = document.getElementById('create-task-screen');
const taskDetailScreen = document.getElementById('task-detail-screen');

const userName = document.getElementById('user-name');
const userRole = document.getElementById('user-role');
const tasksList = document.getElementById('tasks-list');
const emptyState = document.getElementById('empty-state');
const createTaskBtn = document.getElementById('create-task-btn');

// Получить Telegram ID пользователя
const telegramId = tg.initDataUnsafe?.user?.id || '7714999378'; // Для тестирования

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

// Загрузить задачи
async function loadTasks() {
  try {
    let url = `${API_URL}/tasks/${telegramId}`;
    
    // Админ видит все задачи
    if (currentUser.role === 'admin') {
      url = `${API_URL}/tasks`;
    }
    
    const response = await fetch(url);
    allTasks = await response.json();
    
    renderTasks();
    
  } catch (error) {
    console.error('Ошибка загрузки задач:', error);
    tg.showAlert('Ошибка загрузки задач');
  }
}

// Загрузить пользователей (для админа)
async function loadUsers() {
  try {
    const response = await fetch(`${API_URL}/users`);
    allUsers = await response.json();
    
    // Заполняем select в форме
    const assigneeSelect = document.getElementById('task-assignee');
    assigneeSelect.innerHTML = '<option value="">Выберите исполнителя</option>';
    
    allUsers.forEach(user => {
      if (user.active === 'TRUE') {
        const option = document.createElement('option');
        option.value = user.telegram_id;
        option.textContent = `${user.full_name} (${user.role})`;
        assigneeSelect.appendChild(option);
      }
    });
    
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
  }
}

// Отрисовать задачи
function renderTasks() {
  // Фильтруем задачи
  let filteredTasks = allTasks;
  
  if (currentFilter !== 'all') {
    filteredTasks = allTasks.filter(task => task.status === currentFilter);
  }
  
  // Очищаем список
  tasksList.innerHTML = '';
  
  if (filteredTasks.length === 0) {
    emptyState.classList.add('active');
  } else {
    emptyState.classList.remove('active');
    
    filteredTasks.forEach(task => {
      const taskCard = createTaskCard(task);
      tasksList.appendChild(taskCard);
    });
  }
}

// Создать карточку задачи
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.onclick = () => openTaskDetail(task);
  
  const statusEmoji = {
    'new': '🆕',
    'in_progress': '🔄',
    'completed': '✅',
    'cancelled': '❌'
  };
  
  const priorityEmoji = {
    'low': '🟢',
    'medium': '🟡',
    'high': '🔴'
  };
  
  const priorityText = {
    'low': 'Низкий',
    'medium': 'Средний',
    'high': 'Высокий'
  };
  
  const statusText = {
    'new': 'Новая',
    'in_progress': 'В работе',
    'completed': 'Выполнена',
    'cancelled': 'Отменена'
  };
  
  card.innerHTML = `
    <div class="task-card-header">
      <div class="task-card-title">${statusEmoji[task.status] || '📌'} ${task.title}</div>
    </div>
    ${task.description ? `<div class="task-card-description">${task.description}</div>` : ''}
    <div class="task-card-meta">
      <span class="priority-badge ${task.priority}">${priorityEmoji[task.priority]} ${priorityText[task.priority]}</span>
      <span class="status-badge ${task.status}">${statusText[task.status]}</span>
      ${task.deadline ? `<span>📅 ${task.deadline}</span>` : ''}
    </div>
  `;
  
  return card;
}

// Открыть детали задачи
function openTaskDetail(task) {
  selectedTask = task;
  
  const statusText = {
    'new': 'Новая',
    'in_progress': 'В работе',
    'completed': 'Выполнена',
    'cancelled': 'Отменена'
  };
  
  const priorityEmoji = {
    'low': '🟢',
    'medium': '🟡',
    'high': '🔴'
  };
  
  const priorityText = {
    'low': 'Низкий',
    'medium': 'Средний',
    'high': 'Высокий'
  };
  
  document.getElementById('detail-title').textContent = task.title;
  document.getElementById('detail-status').textContent = statusText[task.status];
  document.getElementById('detail-status').className = `status-badge ${task.status}`;
  document.getElementById('detail-priority').textContent = `${priorityEmoji[task.priority]} ${priorityText[task.priority]}`;
  document.getElementById('detail-deadline').textContent = task.deadline || 'Не указан';
  document.getElementById('detail-created').textContent = task.created_date || 'Неизвестно';
  document.getElementById('detail-description').textContent = task.description || 'Нет описания';
  
  const completeBtn = document.getElementById('complete-task-btn');
  
  if (task.status === 'completed' || task.status === 'cancelled') {
    completeBtn.disabled = true;
    completeBtn.textContent = '✅ Выполнена';
  } else {
    completeBtn.disabled = false;
    completeBtn.textContent = '✅ Отметить выполненной';
  }
  
  showScreen('detail');
}

// Создать задачу
async function createTask(e) {
  e.preventDefault();
  
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  const assignedToId = document.getElementById('task-assignee').value;
  const priority = document.getElementById('task-priority').value;
  const deadline = document.getElementById('task-deadline').value;
  
  console.log('Создаем задачу...');
  
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        assigned_to_id: assignedToId,
        assigned_by_id: telegramId,
        priority,
        deadline
      })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Ошибка создания задачи');
    }
    
    const result = await response.json();
    console.log('Задача создана:', result);
    
    // Показываем уведомление
    alert('✅ Задача успешно создана!');
    
    // Очищаем форму
    document.getElementById('task-form').reset();
    
    // Перезагружаем задачи
    console.log('Перезагружаем список задач...');
    await loadTasks();
    console.log('Задачи перезагружены');
    
    // Возвращаемся на главный экран
    console.log('Возвращаемся на главный экран');
    showScreen('main');
    
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    alert('Ошибка при создании задачи');
  }
}

// Отметить задачу выполненной
async function completeTask() {
  if (!selectedTask) return;
  
  console.log('Отмечаем задачу выполненной:', selectedTask.task_id);
  
  try {
    const response = await fetch(`${API_URL}/tasks/${selectedTask.task_id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'completed'
      })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Ошибка обновления статуса');
    }
    
    const result = await response.json();
    console.log('Статус обновлен:', result);
    
    // Показываем уведомление
    alert('✅ Задача отмечена как выполненная!');
    
    // Перезагружаем задачи
    console.log('Перезагружаем список задач...');
    await loadTasks();
    console.log('Задачи перезагружены');
    
    // Возвращаемся на главный экран
    console.log('Возвращаемся на главный экран');
    showScreen('main');
    
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    alert('Ошибка при обновлении задачи');
  }
}

// Переключение экранов
function showScreen(screenName) {
  loadingScreen.classList.remove('active');
  mainScreen.classList.remove('active');
  createTaskScreen.classList.remove('active');
  taskDetailScreen.classList.remove('active');
  
  switch(screenName) {
    case 'loading':
      loadingScreen.classList.add('active');
      break;
    case 'main':
      mainScreen.classList.add('active');
      break;
    case 'create':
      createTaskScreen.classList.add('active');
      break;
    case 'detail':
      taskDetailScreen.classList.add('active');
      break;
  }
}

// Обработчики событий

// Фильтры
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderTasks();
  });
});

// Кнопка создания задачи
createTaskBtn.addEventListener('click', () => {
  showScreen('create');
});

// Кнопка назад
document.getElementById('back-btn').addEventListener('click', () => {
  showScreen('main');
});

document.getElementById('detail-back-btn').addEventListener('click', () => {
  showScreen('main');
});

// Форма создания задачи
document.getElementById('task-form').addEventListener('submit', createTask);

// Кнопка завершения задачи
document.getElementById('complete-task-btn').addEventListener('click', completeTask);

// Запуск приложения
init();