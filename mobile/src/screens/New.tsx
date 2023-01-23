import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import colors from 'tailwindcss/colors';
import { BackButton } from '../components/BackButton';
import { Checkbox } from '../components/Checkbox';
import { api } from '../lib/axios';

const availableWeekDays = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export function New() {
  const [weekDays, setWeekDays] = useState<number[]>([]);
  const [title, setTitle] = useState('');

  function handleToggleWeekDay(weekDayIndex: number) {
    if (weekDays.includes(weekDayIndex)) {
      setWeekDays((prevState) =>
        prevState.filter((weekDay) => weekDay !== weekDayIndex)
      );
    } else {
      setWeekDays((prevState) => [...prevState, weekDayIndex]);
    }
  }

  async function handleCreateHabit() {
    try {
      if (!title.trim() || weekDays.length === 0) {
        return Alert.alert(
          'Ops',
          'Preencha o título do hábito e escolha os dias'
        );
      }

      await api.post('/habits', {
        title,
        weekDays,
      });

      setTitle('');
      setWeekDays([]);

      Alert.alert('Sucesso', 'Hábito criado com sucesso');
    } catch (error) {
      console.log(error);
      return Alert.alert('Ops', 'Não foi possível criar o hábito');
    } finally {
    }
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-white font-bold text-2xl">Criar hábito</Text>

        <Text className="mt-6 text-white font-semibold text-base">
          Qual é seu comprometimento?
        </Text>

        <TextInput
          className="h-12 pl-4 rounded-lg mt-3 bg-zinc-900 text-white border-2 border-zinc-800 focus:border-2 focus:border-violet-500"
          placeholder="Exercícios, dormir bem, etc..."
          placeholderTextColor={colors.zinc[400]}
          onChangeText={setTitle}
          value={title}
        />

        <Text className="font-semibold mt-4 mb-3 text-white text-base">
          Qual é a recorrência?
        </Text>

        {availableWeekDays.map((weekDay, index) => {
          return (
            <Checkbox
              key={weekDay}
              title={weekDay}
              checked={weekDays.includes(index)}
              onPress={() => handleToggleWeekDay(index)}
            />
          );
        })}

        <TouchableOpacity
          activeOpacity={0.7}
          className="w-full h-14 flex-row items-center justify-center bg-green-600 rounded-md mt-6"
          onPress={handleCreateHabit}
        >
          <Feather name="check" size={20} color={colors.white} />
          <Text className="font-semibold text-base text-white ml-2">
            Confirmar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
