import api from './axios';
import { Category } from '../types';

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },

  create: async (name: string, color: string): Promise<Category> => {
    const res = await api.post<Category>('/categories', { name, color });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
