export type TodoType = 'DAILY' | 'LONGTERM';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
  _count?: { todos: number };
}

export interface Todo {
  id: string;
  title: string;
  type: TodoType;
  completed: boolean;
  priority: Priority;
  dueDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  memo?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categoryId?: string | null;
  category?: Category | null;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type FilterType = 'all' | 'active' | 'completed';
export type TabType = 'daily' | 'longterm' | 'calendar';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
