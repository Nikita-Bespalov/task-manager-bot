import { Task, User } from './types';

export const API_URL = 'https://task-manager-bot-cayt.onrender.com/api';
console.log('🔗 API URL:', API_URL); // для отладки

export async function fetchUser(telegramId: string): Promise<User> {
  const response = await fetch(`${API_URL}/user/${telegramId}`);
  if (!response.ok) throw new Error('Пользователь не найден');
  return response.json();
}

export async function fetchTasks(telegramId: string, isAdmin: boolean): Promise<Task[]> {
  const url = isAdmin ? `${API_URL}/tasks` : `${API_URL}/tasks/${telegramId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Ошибка загрузки задач');
  return response.json();
}

export async function fetchAllUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) throw new Error('Ошибка загрузки пользователей');
  return response.json();
}

export async function createTask(data: {
  title: string;
  description: string;
  assigned_to_id: string;
  assigned_by_id: string;
  priority: string;
  deadline: string;
}): Promise<void> {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Ошибка создания задачи');
}

export async function updateTask(
  taskId: string,
  data: {
    rowIndex: number;
    title: string;
    description: string;
    assigned_to_id: string;
    assigned_by_id: string;
    status: string;
    priority: string;
    created_date: string;
    deadline: string;
    completed_date: string;
    comments: string;
  }
): Promise<void> {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Ошибка обновления задачи');
}

export async function updateTaskStatus(taskId: string, status: string): Promise<void> {
  const response = await fetch(`${API_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Ошибка обновления статуса');
}

export async function fetchAllTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/tasks`);
  if (!response.ok) throw new Error('Ошибка загрузки задач');
  return response.json();
}