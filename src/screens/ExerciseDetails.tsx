import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Platform, Pressable, ScrollView, SectionList, StyleSheet, TextInput, View,
} from 'react-native';
import {
  Headline, IconButton, List, ThemeProvider,
} from 'react-native-paper';
import {
  Background, VictoryAxis, VictoryChart, VictoryScatter,
} from 'victory-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text } from '../components/Themed';
import { useSaveSet, useSetsForWorkout } from '../contexts/WorkoutDataContext';
import { RootStackScreenProps, ExerciseSet } from '../../types';
import Colors from '../../constants/Colors';

dayjs.extend(calendar, {
  sameDay: '[Today at] h:mm A', // The same day (Today at 2:30 AM)
  nextDay: '[Tomorrow]', // The next day (Tomorrow at 2:30 AM)
  nextWeek: 'dddd', // The next week (Sunday at 2:30 AM)
  lastDay: '[Yesterday]', // The day before ( Yesterday at 2:30 AM )
  lastWeek: '[Last] dddd', // Last week ( Last Monday at 2:30 AM )
  sameElse: 'DD/MM/YYYY', // Everything else ( 7/10/2011 )
});

const Stepper: React.FC<{ readonly minValue?: number, readonly value: number, readonly textTitle: string, readonly onValueUpdated: React.Dispatch<React.SetStateAction<number>> }> = ({
  textTitle, onValueUpdated, value, minValue = 0,
}) => {
  const InputValue = useCallback(() => {
    let val;
    if (value) {
      val = value;
    }
  }, [value]);

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%',
    }}
    >
      <IconButton size={40} disabled={minValue === value} animated icon='minus' onPress={() => onValueUpdated((p) => Math.max(minValue, p - 1))} />
      {/* <Text style={{
        width: 50, fontSize: 30, fontVariant: ['tabular-nums'], textAlign: 'center', alignSelf: 'center',
      }}
      >
        { value.toString() }
      </Text> */}
      <View style={{ width: 50, flexDirection: 'row' }}>
        <TextInput
          style={{
            fontSize: 20, fontVariant: ['tabular-nums'], textAlign: 'center', alignSelf: 'center',
          }}
          value={value.toString()}
          // onBlur={}
          keyboardType='numeric'
        />
        <Text style={{
          fontSize: 10, fontVariant: ['tabular-nums'], textAlign: 'center', alignSelf: 'center', paddingLeft: 4,
        }}
        >
          {textTitle}
        </Text>
      </View>
      <IconButton size={40} animated icon='plus' onPress={() => onValueUpdated((p) => Math.max(minValue, p + 1))} />
    </View>
  );
};

export default function ModalScreen({ navigation, route: { params: { workout } } }: RootStackScreenProps<'Modal'>) {
  const workoutId = workout.id;
  const sets = useSetsForWorkout(workoutId);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(10);
  const saveSet = useSaveSet();

  useEffect(() => {
    if (sets[0]) {
      setReps(sets[0].reps);
      setWeight(sets[0].weight);
    }
  }, [sets]);

  const setsPerDay = React.useMemo(() => sets.reduce<readonly {readonly title: string, readonly data: readonly ExerciseSet[]}[]>((acc, set) => {
    const title = dayjs(set.createdAt).startOf('day').calendar(null, {
      sameDay: '[Today]', // The same day ( Today at 2:30 AM )
      nextDay: '[Tomorrow]', // The next day ( Tomorrow at 2:30 AM )
      nextWeek: 'dddd', // The next week ( Sunday at 2:30 AM )
      lastDay: '[Yesterday]', // The day before ( Yesterday at 2:30 AM )
      lastWeek: '[Last] dddd', // Last week ( Last Monday at 2:30 AM )
      sameElse: 'DD/MM/YYYY', // Everything else ( 7/10/2011 )
    });
    const foundEntry = acc.find((s) => s.title === title);
    return foundEntry ? [...acc.filter((s) => s.title !== title), { title, data: [...foundEntry.data, set] }] : [...acc, { title, data: [set] }];
  }, []), [sets]);

  useEffect(() => {
    navigation.setOptions({
      title: `${workout.name}`,
    });
  }, [navigation, workout]);
  return (

    <View style={styles.container}>
      <ScrollView>
        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

        <VictoryChart>
          <VictoryScatter
            style={{ data: { fill: '#c43a31' } }}
            bubbleProperty='amount'
            maxBubbleSize={10}
            domainPadding={{ x: 10, y: 10 }}
            minBubbleSize={5}
            height={200}
            data={sets.map((s) => ({ x: s.createdAt, y: s.weight, amount: s.reps }))}

          />
          <VictoryAxis dependentAxis crossAxis domainPadding={{ x: 10, y: 10 }} orientation='left' />
          <VictoryAxis tickFormat={() => ''} domainPadding={{ x: 10, y: 10 }} orientation='bottom' />
        </VictoryChart>
        <SectionList
          sections={setsPerDay}
          style={{ width: '100%' }}
          renderSectionHeader={({ section: { title } }) => (
            <Headline style={{ paddingHorizontal: 10 }}>{title}</Headline>
          )}
          renderItem={({ item }) => (
            <List.Item
              title={(
                <Text>
                  { `${item.reps} reps @ `}
                  <Text style={{ fontWeight: 'bold' }}>{`${item.weight} kg`}</Text>
                </Text>
              )}
              description={dayjs(item.createdAt).format('hh:mm')}
            />
          )}
        />
      </ScrollView>
      <View style={{
        width: '100%', justifyContent: 'center', alignItems: 'center', padding: 10, backgroundColor: 'lightgray', borderTopLeftRadius: 20, borderTopRightRadius: 20,
      }}
      >
        <Stepper minValue={1} value={reps} onValueUpdated={setReps} textTitle='REPS' />
        <Pressable
          style={styles.saveSetBtn}
          onPressIn={() => saveSet({ reps, weight, workoutId })}
        >
          <Text>SAVE SET</Text>
        </Pressable>
        <Stepper value={weight} onValueUpdated={setWeight} textTitle='KG' />
      </View>
      <View style={{
        width: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row',
      }}
      >
        <View style={{
          justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row-reverse',
        }}
        >
          <Text style={{ padding: 20 }}>00:00</Text>
        </View>
        <View style={{
          justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row-reverse',
        }}
        >
          <IconButton icon='arrow-right' color='black' size={35} onPress={() => console.log('Pressed')} />
          <IconButton icon='pause' color='black' size={35} onPress={() => console.log('Pressed')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  saveSetBtn: {
    width: 100,
    height: 100,
    borderRadius: 10000,
    borderColor: 'black',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
});