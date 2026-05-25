import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';
import categoryRoutes from './routes/category.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://frontend:5173'],
  credentials: true,
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/categories', categoryRoutes);

app.use(errorHandler);

export default app;
