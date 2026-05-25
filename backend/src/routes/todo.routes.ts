import { Router } from 'express';
import * as todoController from '../controllers/todo.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);
router.patch('/reorder', todoController.reorderTodos);
router.put('/:id', todoController.updateTodo);
router.patch('/:id/toggle', todoController.toggleTodo);
router.delete('/:id', todoController.deleteTodo);

export default router;
