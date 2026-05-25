import api from './axios';
import { Todo, TodoType, Priority } from '../types';

export interface CreateTodoData {
  title: string;
  type: TodoType;
  priority?: Priority;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  memo?: string;
}

export interface UpdateTodoData {
  title?: string;
  priority?: Priority;
  dueDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  categoryId?: string | null;
  memo?: string | null;
}

export const todoApi = {
  getAll: async (type?: TodoType): Promise<Todo[]> => {
    const res = await api.get<Todo[]>('/todos', { params: type ? { type } : {} });
    return res.data;
  },

  create: async (data: CreateTodoData): Promise<Todo> => {
    const res = await api.post<Todo>('/todos', data);
    return res.data;
  },

  update: async (id: string, data: UpdateTodoData): Promise<Todo> => {
    const res = await api.put<Todo>(`/todos/${id}`, data);
    return res.data;
  },

  toggle: async (id: string): Promise<Todo> => {
    const res = await api.patch<Todo>(`/todos/${id}/toggle`);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },

  reorder: async (orderedIds: string[]): Promise<void> => {
    await api.patch('/todos/reorder', { orderedIds });
  },
};
