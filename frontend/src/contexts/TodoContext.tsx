import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Todo, TodoType, FilterType, Category, Toast } from '../types';
import { todoApi, CreateTodoData, UpdateTodoData } from '../api/todo.api';
import { categoryApi } from '../api/category.api';
import { useAuth } from './AuthContext';

interface TodoState {
  todos: Todo[];
  categories: Category[];
  filter: FilterType;
  searchQuery: string;
  toasts: Toast[];
  isLoading: boolean;
}

type TodoAction =
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'SET_FILTER'; payload: FilterType }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: TodoState = {
  todos: [],
  categories: [],
  filter: 'all',
  searchQuery: '',
  toasts: [],
  isLoading: false,
};

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'SET_TODOS': return { ...state, todos: action.payload };
    case 'SET_CATEGORIES': return { ...state, categories: action.payload };
    case 'ADD_TODO': return { ...state, todos: [action.payload, ...state.todos] };
    case 'UPDATE_TODO':
      return { ...state, todos: state.todos.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TODO':
      return { ...state, todos: state.todos.filter(t => t.id !== action.payload) };
    case 'SET_FILTER': return { ...state, filter: action.payload };
    case 'SET_SEARCH': return { ...state, searchQuery: action.payload };
    case 'ADD_TOAST': return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST': return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    default: return state;
  }
}

interface TodoContextType {
  state: TodoState;
  fetchTodos: () => Promise<void>;
  createTodo: (data: CreateTodoData) => Promise<void>;
  updateTodo: (id: string, data: UpdateTodoData) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createCategory: (name: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setFilter: (filter: FilterType) => void;
  setSearch: (query: string) => void;
  addToast: (message: string, type: Toast['type']) => void;
  getFilteredTodos: (todoType: TodoType) => Todo[];
}

const TodoContext = createContext<TodoContextType | null>(null);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const { user } = useAuth();

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now().toString();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3500);
  }, []);

  const fetchTodos = useCallback(async () => {
    if (!user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const todos = await todoApi.getAll();
      dispatch({ type: 'SET_TODOS', payload: todos });
    } catch {
      addToast('할 일 목록을 불러오지 못했습니다.', 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, addToast]);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    try {
      const categories = await categoryApi.getAll();
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch {
      console.error('Failed to fetch categories');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTodos();
      fetchCategories();
    } else {
      dispatch({ type: 'SET_TODOS', payload: [] });
    }
  }, [user, fetchTodos, fetchCategories]);

  const createTodo = useCallback(async (data: CreateTodoData) => {
    const todo = await todoApi.create(data);
    dispatch({ type: 'ADD_TODO', payload: todo });
    addToast('할 일이 추가되었습니다! ✨', 'success');
  }, [addToast]);

  const updateTodo = useCallback(async (id: string, data: UpdateTodoData) => {
    const todo = await todoApi.update(id, data);
    dispatch({ type: 'UPDATE_TODO', payload: todo });
    addToast('할 일이 수정되었습니다.', 'success');
  }, [addToast]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = await todoApi.toggle(id);
    dispatch({ type: 'UPDATE_TODO', payload: todo });
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    await todoApi.delete(id);
    dispatch({ type: 'DELETE_TODO', payload: id });
    addToast('삭제되었습니다.', 'info');
  }, [addToast]);

  const createCategory = useCallback(async (name: string, color: string) => {
    const category = await categoryApi.create(name, color);
    dispatch({ type: 'SET_CATEGORIES', payload: [...state.categories, category] });
    addToast(`"${name}" 카테고리가 추가되었습니다.`, 'success');
  }, [state.categories, addToast]);

  const deleteCategory = useCallback(async (id: string) => {
    await categoryApi.delete(id);
    dispatch({ type: 'SET_CATEGORIES', payload: state.categories.filter(c => c.id !== id) });
    addToast('카테고리가 삭제되었습니다.', 'info');
  }, [state.categories, addToast]);

  const setFilter = useCallback((filter: FilterType) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const setSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  }, []);

  const getFilteredTodos = useCallback((todoType: TodoType): Todo[] => {
    return state.todos
      .filter(t => t.type === todoType)
      .filter(t => {
        if (state.filter === 'active') return !t.completed;
        if (state.filter === 'completed') return t.completed;
        return true;
      })
      .filter(t =>
        state.searchQuery
          ? t.title.toLowerCase().includes(state.searchQuery.toLowerCase())
          : true
      )
      .sort((a, b) => a.order - b.order);
  }, [state.todos, state.filter, state.searchQuery]);

  return (
    <TodoContext.Provider value={{
      state, fetchTodos, createTodo, updateTodo, toggleTodo, deleteTodo,
      fetchCategories, createCategory, deleteCategory,
      setFilter, setSearch, addToast, getFilteredTodos,
    }}>
      {state.toasts.length > 0 && (
        <div className="toast-container">
          {state.toasts.map(toast => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              {toast.message}
            </div>
          ))}
        </div>
      )}
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodo must be used within TodoProvider');
  return context;
};
