// Telegram WebApp API
const tg = window.Telegram.WebApp;
tg.expand();

// API URL
const API_URL = 'https://task-manager-bot-cayt.onrender.com/api';

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
const editTaskScreen = document.getElementById('edit-task-screen');
const teamScreen = document.getElementById('team-screen');
const teamContainer = document.getElementById('team-container');
const teamFilterBtn = document.getElementById('team-filter-btn');

const userName = document.getElementById('user-name');
const userRole = document.getElementById('user-role');
const tasksList = document.getElementById('tasks-list');
const emptyState = document.getElementById('empty-state');
const createTaskBtn = document.getElementById('create-task-btn');

// Получить Telegram ID пользователя
const telegramId = tg.initDataUnsafe?.user?.id;

// Инициализация
async function init() {
  try {
    console.log('Начало инициализации...');
    console.log('Telegram ID:', telegramId);
    console.log('API URL:', API_URL);
    
    const userResponse = await fetch(`${API_URL}/user/${telegramId}`);
    console.log('User response status:', userResponse.status);
    
    if (!userResponse.ok) {
      throw new Error('Пользователь не найден');
    }
    
    currentUser = await userResponse.json();
    console.log('Пользователь загружен:', currentUser);
    
    userName.textContent = currentUser.full_name || currentUser.username;
    userRole.textContent = currentUser.role;
    userRole.classList.add(currentUser.role);
    
     if (currentUser.role === 'admin') {
      createTaskBtn.style.display = 'block';
      teamFilterBtn.style.display = 'block'; // Показываем кнопку "Команда"
    }
    
    console.log('Загружаем задачи...');
    await loadTasks();
    console.log('Задачи загружены');
    
    if (currentUser.role === 'admin') {
      console.log('Загружаем список пользователей...');
      await loadUsers();
    }
    
    console.log('Показываем главный экран');
    showScreen('main');
    
    // Автообновление задач каждые 10 секунд
    setInterval(async () => {
      console.log('Автообновление задач...');
      await loadTasks();
    }, 10000); // 10 секунд
    
  } catch (error) {
    console.error('Ошибка инициализации:', error);
    tg.showAlert('Ошибка загрузки данных. Попробуйте позже.');
  }
}

// Загрузить задачи
async function loadTasks() {
  try {
    let url = `${API_URL}/tasks/${telegramId}`;
    
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

// Загрузить пользователей
async function loadUsers() {
  try {
    const response = await fetch(`${API_URL}/users`);
    allUsers = await response.json();
    
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
// Отрисовать задачи
function renderTasks() {
  let filteredTasks = allTasks;
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  if (currentFilter === 'all') {
    filteredTasks = allTasks.filter(task => 
      task.status !== 'completed' && task.status !== 'cancelled'
    );
  } else if (currentFilter === 'completed') {
    filteredTasks = allTasks.filter(task => {
      if (task.status !== 'completed') return false;
      
      const completedDate = task.completed_date ? new Date(task.completed_date) : null;
      if (!completedDate) return true;
      
      return completedDate >= sevenDaysAgo;
    });
  } else {
    filteredTasks = allTasks.filter(task => task.status === currentFilter);
  }
  
  // Сохраняем позицию скролла
  const scrollPos = window.scrollY;
  
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
  
  // Восстанавливаем позицию скролла
  window.scrollTo(0, scrollPos);
}

// Создать карточку задачи
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  
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
  
  // Проверяем, назначена ли задача текущему пользователю
  const isAssignedToMe = task.assigned_to_id === String(telegramId);
  const canTakeInProgress = isAssignedToMe && task.status === 'new';
  
  card.innerHTML = `
    <div class="task-card-header">
      <div class="task-card-title" onclick="openTaskDetail(${JSON.stringify(task).replace(/"/g, '&quot;')})">${statusEmoji[task.status] || '📌'} ${task.title}</div>
    </div>
    ${task.description ? `<div class="task-card-description">${task.description}</div>` : ''}
    <div class="task-card-meta">
      <span class="priority-badge ${task.priority}">${priorityEmoji[task.priority]} ${priorityText[task.priority]}</span>
      <span class="status-badge ${task.status}">${statusText[task.status]}</span>
      ${task.deadline ? `<span>📅 ${task.deadline}</span>` : ''}
    </div>
    ${canTakeInProgress ? `
      <div class="task-card-actions">
        <button class="btn-take-progress" onclick="event.stopPropagation(); takeInProgress('${task.task_id}')">🚀 Взять в работу</button>
      </div>
    ` : ''}
  `;
  
  // Добавляем обработчик клика на карточку (кроме кнопки)
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.btn-take-progress')) {
      openTaskDetail(task);
    }
  });
  
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
  const editBtn = document.getElementById('edit-task-btn');
  
  if (currentUser && currentUser.role === 'admin') {
    editBtn.style.display = 'block';
  } else {
    editBtn.style.display = 'none';
  }
  
  if (task.status === 'completed' || task.status === 'cancelled') {
    completeBtn.disabled = true;
    completeBtn.textContent = '✅ Выполнена';
  } else {
    completeBtn.disabled = false;
    completeBtn.textContent = '✅ Отметить выполненной';
  }
  
  showScreen('detail');
}

// Открыть редактирование
function openEditTask() {
  if (!selectedTask) return;
  
  document.getElementById('edit-task-title').value = selectedTask.title;
  document.getElementById('edit-task-description').value = selectedTask.description || '';
  document.getElementById('edit-task-assignee').value = selectedTask.assigned_to_id;
  document.getElementById('edit-task-priority').value = selectedTask.priority;
  document.getElementById('edit-task-status').value = selectedTask.status;
  document.getElementById('edit-task-deadline').value = selectedTask.deadline || '';
  
  const assigneeSelect = document.getElementById('edit-task-assignee');
  if (assigneeSelect.options.length === 1) {
    allUsers.forEach(user => {
      if (user.active === 'TRUE') {
        const option = document.createElement('option');
        option.value = user.telegram_id;
        option.textContent = `${user.full_name} (${user.role})`;
        assigneeSelect.appendChild(option);
      }
    });
    assigneeSelect.value = selectedTask.assigned_to_id;
  }
  
  showScreen('edit');
  
  // ДОБАВЬТЕ ЭТУ СТРОКУ - сбрасываем скролл в начало
  window.scrollTo(0, 0);
}

// Создать задачу
async function createTask(e) {
  e.preventDefault();
  
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  const assignedToId = document.getElementById('task-assignee').value;
  const priority = document.getElementById('task-priority').value;
  const deadline = document.getElementById('task-deadline').value;
  
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        assigned_to_id: assignedToId,
        assigned_by_id: telegramId,
        priority,
        deadline
      })
    });
    
    if (!response.ok) throw new Error('Ошибка создания задачи');
    
    alert('✅ Задача успешно создана!');
    document.getElementById('task-form').reset();
    await loadTasks();
    showScreen('main');
    
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    alert('Ошибка при создании задачи');
  }
}

// Обновить задачу
async function updateTask(e) {
  e.preventDefault();
  
  if (!selectedTask) return;
  
  const title = document.getElementById('edit-task-title').value;
  const description = document.getElementById('edit-task-description').value;
  const assignedToId = document.getElementById('edit-task-assignee').value;
  const priority = document.getElementById('edit-task-priority').value;
  const status = document.getElementById('edit-task-status').value;
  const deadline = document.getElementById('edit-task-deadline').value;
  
  try {
    const allTasksResponse = await fetch(`${API_URL}/tasks`);
    const allTasksData = await allTasksResponse.json();
    const currentTask = allTasksData.find(t => t.task_id === selectedTask.task_id);
    
    if (!currentTask) throw new Error('Задача не найдена');
    
    const response = await fetch(`${API_URL}/tasks/${selectedTask.task_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rowIndex: currentTask.rowIndex,
        title,
        description,
        assigned_to_id: assignedToId,
        assigned_by_id: selectedTask.assigned_by_id,
        status,
        priority,
        created_date: selectedTask.created_date,
        deadline,
        completed_date: status === 'completed' ? new Date().toISOString().split('T')[0] : selectedTask.completed_date,
        comments: selectedTask.comments
      })
    });
    
    if (!response.ok) throw new Error('Ошибка обновления задачи');
    
    alert('✅ Задача успешно обновлена!');
    await loadTasks();
    showScreen('main');
    
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    alert('Ошибка при обновлении задачи');
  }
}

// Отметить выполненной
async function completeTask() {
  if (!selectedTask) return;
  
  try {
    const response = await fetch(`${API_URL}/tasks/${selectedTask.task_id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });
    
    if (!response.ok) throw new Error('Ошибка обновления статуса');
    
    alert('✅ Задача отмечена как выполненная!');
    await loadTasks();
    showScreen('main');
    
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    alert('Ошибка при обновлении задачи');
  }
}
// Взять в работу
async function takeInProgress(taskId) {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' })
    });
    
    if (!response.ok) throw new Error('Ошибка обновления статуса');
    
    alert('🚀 Задача взята в работу!');
    await loadTasks();
    
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    alert('Ошибка при обновлении задачи');
  }
}

// Сделать функцию глобальной для onclick
window.takeInProgress = takeInProgress;
// Переключение экранов
function showScreen(screenName) {
  loadingScreen.classList.remove('active');
  mainScreen.classList.remove('active');
  createTaskScreen.classList.remove('active');
  taskDetailScreen.classList.remove('active');
  editTaskScreen.classList.remove('active');
  teamScreen.classList.remove('active');
  
  // Сначала скроллим в самое начало
  window.scrollTo(0, 0);
  
  switch(screenName) {
    case 'loading': loadingScreen.classList.add('active'); break;
    case 'main': mainScreen.classList.add('active'); break;
    case 'create': createTaskScreen.classList.add('active'); break;
    case 'detail': taskDetailScreen.classList.add('active'); break;
    case 'edit': editTaskScreen.classList.add('active'); break;
    case 'team': teamScreen.classList.add('active'); break;
  }
  
  // Повторяем для надежности после рендера
  setTimeout(() => window.scrollTo(0, 0), 10);
}
// Показать экран команды
async function showTeamScreen() {
  if (currentUser.role !== 'admin') return;
  
  try {
    if (allUsers.length === 0) {
      await loadUsers();
    }
    
    const response = await fetch(`${API_URL}/tasks`);
    const allTasksData = await response.json();
    
    const userTasksMap = {};
    
    allUsers.forEach(user => {
      userTasksMap[user.telegram_id] = {
        user: user,
        tasks: { new: [], in_progress: [], completed: [] }
      };
    });
    
    allTasksData.forEach(task => {
      const userId = task.assigned_to_id;
      if (userTasksMap[userId]) {
        if (task.status === 'new') {
          userTasksMap[userId].tasks.new.push(task);
        } else if (task.status === 'in_progress') {
          userTasksMap[userId].tasks.in_progress.push(task);
        } else if (task.status === 'completed') {
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const completedDate = task.completed_date ? new Date(task.completed_date) : null;
          
          if (completedDate && completedDate >= sevenDaysAgo) {
            userTasksMap[userId].tasks.completed.push(task);
          }
        }
      }
    });
    
    teamContainer.innerHTML = '';
    
    Object.values(userTasksMap).forEach(userData => {
      if (userData.user.active !== 'TRUE') return;
      
      const card = document.createElement('div');
      card.className = 'team-member-card';
      
      const totalNew = userData.tasks.new.length;
      const totalInProgress = userData.tasks.in_progress.length;
      const totalCompleted = userData.tasks.completed.length;
      const totalActive = totalNew + totalInProgress;
      
      card.innerHTML = `
        <div class="team-member-header">
          <div class="team-member-avatar">${userData.user.full_name.charAt(0).toUpperCase()}</div>
          <div class="team-member-info">
            <div class="team-member-name">${userData.user.full_name}</div>
            <div class="team-member-role">${userData.user.role === 'admin' ? '👑 Администратор' : '👤 Сотрудник'}</div>
          </div>
        </div>
        <div class="team-member-stats">
          <div class="stat-item">
            <span class="stat-value">${totalActive}</span>
            <span class="stat-label">Активных</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${totalNew}</span>
            <span class="stat-label">Новых</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${totalInProgress}</span>
            <span class="stat-label">В работе</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${totalCompleted}</span>
            <span class="stat-label">Готово (7д)</span>
          </div>
        </div>
      `;
      
      card.addEventListener('click', () => showUserTasks(userData));
      teamContainer.appendChild(card);
    });
    
    showScreen('team');
    
  } catch (error) {
    console.error('Ошибка загрузки команды:', error);
    alert('Ошибка при загрузке данных команды');
  }
}

function showUserTasks(userData) {
  allTasks = [
    ...userData.tasks.new,
    ...userData.tasks.in_progress,
    ...userData.tasks.completed
  ];
  
  currentFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
  
  renderTasks();
  showScreen('main');
}
// Обработчики событий
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderTasks();
  });
});

createTaskBtn.addEventListener('click', () => showScreen('create'));
document.getElementById('back-btn').addEventListener('click', () => showScreen('main'));
document.getElementById('detail-back-btn').addEventListener('click', () => showScreen('main'));
document.getElementById('edit-back-btn').addEventListener('click', () => showScreen('detail'));
document.getElementById('task-form').addEventListener('submit', createTask);
document.getElementById('edit-task-form').addEventListener('submit', updateTask);
document.getElementById('complete-task-btn').addEventListener('click', completeTask);
document.getElementById('edit-task-btn').addEventListener('click', openEditTask);
teamFilterBtn.addEventListener('click', showTeamScreen);
document.getElementById('team-back-btn').addEventListener('click', async () => {
  await loadTasks();
  showScreen('main');
});
// Запуск
init();