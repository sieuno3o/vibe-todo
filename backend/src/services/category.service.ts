import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (userId: string) => {
  return prisma.category.findMany({
    where: { userId },
    include: { _count: { select: { todos: true } } },
    orderBy: { name: 'asc' },
  });
};

export const createCategory = async (
  userId: string,
  name: string,
  color: string
) => {
  const existing = await prisma.category.findFirst({
    where: { userId, name },
  });
  if (existing) throw new Error('이미 존재하는 카테고리 이름입니다.');

  return prisma.category.create({
    data: { name, color, userId },
  });
};

export const deleteCategory = async (id: string, userId: string) => {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) throw new Error('카테고리를 찾을 수 없습니다.');

  return prisma.category.delete({ where: { id } });
};
