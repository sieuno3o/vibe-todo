import { PrismaClient, TodoType, Priority } from '@prisma/client';

const prisma = new PrismaClient();

export const getTodos = async (userId: string, type?: string) => {
  return prisma.todo.findMany({
    where: {
      userId,
      ...(type ? { type: type as TodoType } : {}),
    },
    include: { category: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });
};

export const createTodo = async (
  userId: string,
  data: {
    title: string;
    type: TodoType;
    priority?: Priority;
    dueDate?: string;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    memo?: string;
  }
) => {
  if (data.type === TodoType.LONGTERM) {
    if (!data.startDate || !data.endDate) {
      throw new Error('장기 목표는 시작일과 종료일이 필수입니다.');
    }
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      throw new Error('종료일은 시작일보다 이후여야 합니다.');
    }
  }

  const lastTodo = await prisma.todo.findFirst({
    where: { userId, type: data.type },
    orderBy: { order: 'desc' },
  });

  return prisma.todo.create({
    data: {
      title: data.title,
      type: data.type,
      priority: data.priority || Priority.MEDIUM,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      memo: data.memo,
      order: (lastTodo?.order ?? -1) + 1,
      userId,
      categoryId: data.categoryId || null,
    },
    include: { category: true },
  });
};

export const updateTodo = async (
  id: string,
  userId: string,
  data: {
    title?: string;
    priority?: Priority;
    dueDate?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    categoryId?: string | null;
    memo?: string | null;
  }
) => {
  const todo = await prisma.todo.findFirst({ where: { id, userId } });
  if (!todo) throw new Error('할 일을 찾을 수 없습니다.');

  if (todo.type === TodoType.LONGTERM) {
    const startDate = data.startDate !== undefined
      ? (data.startDate ? new Date(data.startDate) : null)
      : todo.startDate;
    const endDate = data.endDate !== undefined
      ? (data.endDate ? new Date(data.endDate) : null)
      : todo.endDate;

    if (!startDate || !endDate) {
      throw new Error('장기 목표는 시작일과 종료일이 필수입니다.');
    }
    if (endDate <= startDate) {
      throw new Error('종료일은 시작일보다 이후여야 합니다.');
    }
  }

  return prisma.todo.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(data.memo !== undefined && { memo: data.memo }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    },
    include: { category: true },
  });
};

export const toggleTodo = async (id: string, userId: string) => {
  const todo = await prisma.todo.findFirst({ where: { id, userId } });
  if (!todo) throw new Error('할 일을 찾을 수 없습니다.');

  return prisma.todo.update({
    where: { id },
    data: { completed: !todo.completed },
    include: { category: true },
  });
};

export const deleteTodo = async (id: string, userId: string) => {
  const todo = await prisma.todo.findFirst({ where: { id, userId } });
  if (!todo) throw new Error('할 일을 찾을 수 없습니다.');

  return prisma.todo.delete({ where: { id } });
};

export const reorderTodos = async (
  userId: string,
  orderedIds: string[]
) => {
  const updates = orderedIds.map((id, index) =>
    prisma.todo.updateMany({
      where: { id, userId },
      data: { order: index },
    })
  );
  await prisma.$transaction(updates);
};
