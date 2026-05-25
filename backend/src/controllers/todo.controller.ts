import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as todoService from '../services/todo.service';
import { TodoType, Priority } from '@prisma/client';

export const getTodos = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type } = req.query;
    const todos = await todoService.getTodos(req.userId!, type as string | undefined);
    res.json(todos);
  } catch (error) {
    next(error);
  }
};

export const createTodo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, type, priority, dueDate, startDate, endDate, categoryId, memo } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ message: '제목을 입력해주세요.' });
      return;
    }

    const todo = await todoService.createTodo(req.userId!, {
      title: title.trim(),
      type: (type as TodoType) || TodoType.DAILY,
      priority: priority as Priority | undefined,
      dueDate,
      startDate,
      endDate,
      categoryId,
      memo,
    });

    res.status(201).json(todo);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const updateTodo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const todo = await todoService.updateTodo(id, req.userId!, req.body);
    res.json(todo);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const toggleTodo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const todo = await todoService.toggleTodo(id, req.userId!);
    res.json(todo);
  } catch (error) {
    next(error);
  }
};

export const deleteTodo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await todoService.deleteTodo(id, req.userId!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const reorderTodos = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderedIds } = req.body;
    await todoService.reorderTodos(req.userId!, orderedIds);
    res.json({ message: '순서가 업데이트되었습니다.' });
  } catch (error) {
    next(error);
  }
};
