import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as categoryService from '../services/category.service';

export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await categoryService.getCategories(req.userId!);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ message: '카테고리 이름을 입력해주세요.' });
      return;
    }
    const category = await categoryService.createCategory(
      req.userId!,
      name.trim(),
      color || '#6366f1'
    );
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id, req.userId!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
