import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: '모든 필드를 입력해주세요.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: '비밀번호는 최소 6자 이상이어야 합니다.' });
      return;
    }

    const result = await authService.register(username, email, password);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
      return;
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await authService.getMe(req.userId!);
    res.json(user);
  } catch (error) {
    next(error);
  }
};
