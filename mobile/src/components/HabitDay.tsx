import clsx from 'clsx';
import dayjs from 'dayjs';
import {
  Dimensions,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { generateProgressPercentage } from '../utils/generate-progress-percentage';

const weekDays = 7;
const screenHorizontalPadding = (32 * 2) / 5;

export const dayMarginBetween = 8;
export const daySize =
  Dimensions.get('screen').width / weekDays - (screenHorizontalPadding + 5);

interface HabitDayProps extends TouchableOpacityProps {
  totalOfHabits?: number;
  completedHabits?: number;
  date: Date;
}

export function HabitDay({
  totalOfHabits = 0,
  completedHabits = 0,
  date,
  ...props
}: HabitDayProps) {
  const progress =
    totalOfHabits > 0
      ? generateProgressPercentage({
          total: totalOfHabits,
          completed: completedHabits,
        })
      : 0;

  const today = dayjs().startOf('day').toDate();
  const isCurrentDay = dayjs(date).isSame(today, 'day');

  return (
    <TouchableOpacity
      className={clsx('rounded-lg border-2 m-1', {
        ['bg-zinc-900 border-zinc-800']: progress === 0,
        ['bg-violet-900 border-violet-800']: progress > 0 && progress < 20,
        ['bg-violet-800 border-violet-700']: progress > 20 && progress < 40,
        ['bg-violet-700 border-violet-600']: progress > 40 && progress < 60,
        ['bg-violet-600 border-violet-500']: progress > 60 && progress < 80,
        ['bg-violet-500 border-violet-400']: progress > 80,
        ['border-zinc-400']: isCurrentDay,
      })}
      style={{ width: daySize, height: daySize }}
      activeOpacity={0.7}
      {...props}
    ></TouchableOpacity>
  );
}
