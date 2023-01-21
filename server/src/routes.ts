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

    // todos os possíveis hábitos do dia
    const possibleHabits = await prisma.habit.findMany({
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

    console.log(day);

    const completedHabits = day?.dayHabits.map((dayHabit) => {
      return dayHabit.habitId;
    });

    return {
      possibleHabits,
      completedHabits,
    };
  });

  app.patch('/habits/:habitId/toggle', async (req, res) => {
    const toggleHabitParams = z.object({
      habitId: z.string().uuid(),
    });

    const { habitId } = toggleHabitParams.parse(req.params);

    const today = dayjs().startOf('day').toDate();

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      },
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        },
      });
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        dayId_habitId: {
          dayId: day.id,
          habitId,
        },
      },
    });

    // toggle
    if (dayHabit) {
      // remover o hábito completo do dia
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      });
    } else {
      // completar o hábito do dia
      await prisma.dayHabit.create({
        data: {
          dayId: day.id,
          habitId,
        },
      });
    }
  });

  app.get('/summary', async (req, res) => {
    // [ { date: 17/01, total: 5, completed: 1 }, { date: 18/01, amount: 2, completed: 2 }, { ... }, ... ]

    const summary = await prisma.$queryRaw`
      SELECT 
        D.id, 
        D.date,

        (
          SELECT 
            cast(count(*) as float) 
          FROM day_habits DH
          WHERE DH.dayId = D.id 
        ) as completed,

        (
          SELECT 
            cast(count(*) as float) 
          FROM habit_week_days HWD
          JOIN habits H
            ON HWD.habitId = H.id
          WHERE 
            HWD.WeekDay = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
            AND H.createdAt <= D.date
        ) as total

      FROM days D
    `;

    // Unix Epoch Timestamp

    return summary;
  });
}
