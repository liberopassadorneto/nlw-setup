import { useFocusEffect, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { daySize, HabitDay } from '../components/HabitDay';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { api } from '../lib/axios';
import { generateRangeDatesFromYearStart } from '../utils/generate-range-between-dates';

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const datesFromYearStart = generateRangeDatesFromYearStart();
const minimumSummaryDatesSize = 18 * 5;
const amountOfDatesToFill = minimumSummaryDatesSize - datesFromYearStart.length;

type Summary = {
  id: string;
  date: string;
  total: number;
  completed: number;
}[];

export function Home() {
  const { navigate } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);

  async function fetchData() {
    try {
      setLoading(true);

      const response = await api.get('/summary');

      setSummary(response.data);
    } catch (error) {
      Alert.alert('Ops', 'Ocorreu um erro ao buscar os dados');
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />

      <View className="flex-row mt-6 mb-2">
        {weekDays.map((weekDay, index) => (
          <Text
            key={`weekDay-${index}`}
            className="text-zinc-400 text-xl font-bold text-center mx-1"
            style={{ width: daySize }}
          >
            {weekDay}
          </Text>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {summary && (
          <View className="flex-row flex-wrap">
            {datesFromYearStart.map((date) => {
              const dayWithHabits = summary.find((day) => {
                return dayjs(date).isSame(day.date, 'day');
              });

              return (
                <HabitDay
                  key={date.toISOString()}
                  date={date}
                  totalOfHabits={dayWithHabits?.total}
                  completedHabits={dayWithHabits?.completed}
                  onPress={() =>
                    navigate('habit', { date: date.toISOString() })
                  }
                />
              );
            })}

            {amountOfDatesToFill > 0 &&
              Array.from({ length: amountOfDatesToFill }).map((_, index) => (
                <View
                  key={`empty-${index}`}
                  className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                  style={{ width: daySize, height: daySize }}
                />
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
