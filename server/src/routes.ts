import dayjs from 'dayjs';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from './lib/prisma';

export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', async (req, res) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    const { title, weekDays } = createHabitBody.parse(req.body);

    // zera a hora/minuto/segundo/milisegundo -> 2023-01-10T00:00:00.000Z
    const today = dayjs().startOf('day').toDate();

    await prisma.habit.create({
      data: {
        title,
        createdAt: today,

        weekDays: {
          create: weekDays.map((weekDay) => {
            return {
              weekDay,
            };
          }),
        },
      },
    });
  });

  app.get('/day', async (req, res) => {
    const getDayParams = z.object({
      // converte a string para um objeto Date -> new Date(param)
      date: z.coerce.date(),
    });

    const { date } = getDayParams.parse(req.query);

    const parsedDate = dayjs(date).startOf('day');
    const weekDay = parsedDate.get('day');

    // todos os hábitos do dia
    const habits = await prisma.habit.findMany({
      where: {
        createdAt: { lte: date },
        weekDays: {
          some: {
            weekDay,
          },
        },
      },
    });

    // hábitos que foram completados no dia
    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    });

    const completedHabits = day?.dayHabits.map((dayHabit) => {
      return dayHabit.habitId;
    });

    return {
      habits,
      completedHabits,
    };
  });
}
