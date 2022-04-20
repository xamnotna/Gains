import React, { useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid';

import {
  ExerciseSet, Exercise, Workout, WorkoutTemplate,
} from '../../types';
import { WorkoutExerciseType } from '../../clients/__generated__/schema';

// void AsyncStorage.clear();

export type GainsContextType = {
  readonly workouts: readonly Workout[],
  readonly workoutTemplates: readonly WorkoutTemplate[],
  readonly sets: readonly ExerciseSet[],
  readonly exercises: readonly Exercise[],
  // getCompletedSetCountForExercise(exercisesWithStatus:Workout[]): number,
  // getExercisesById(exerciseIds: string[]): readonly Exercise[],
  // getExerciseAutosuggestions(): readonly Exercise[],
  searchForExercises(query: string): readonly Exercise[],
  readonly addWorkout: (workout: Workout) => void,
  readonly upsertWorkoutTemplate:(exercises: readonly string[], name: string, workoutTemplateId?: string) => void,
  readonly addExercise:(exercise: Omit<Exercise, 'id'>) => void,
  readonly addSet: (set: Omit<ExerciseSet, 'id' | 'createdAt'>) => void,
  getTotalSetCountForExercise(exerciseId: string): number,
}

export const GainsContext = React.createContext<GainsContextType>({
  workouts: [],
  exercises: [],
  workoutTemplates: [],
  sets: [],
  searchForExercises: () => [],
  addWorkout: () => {},
  addExercise: () => {},
  upsertWorkoutTemplate: () => {},
  addSet: () => {},
  getTotalSetCountForExercise: () => 0,
});

const DEFAULT_SET_COUNT = 3;

const originalExercises: readonly Exercise[] = [{
  id: 'press_bench',
  workoutExerciseType: WorkoutExerciseType.PRESS_BENCH,
  name: 'Bench Press',
  associatedCodes: {},
}, {
  id: 'deadlift',
  workoutExerciseType: WorkoutExerciseType.DEADLIFT,
  name: 'Deadlift',
  associatedCodes: {},
}, {
  id: 'romanian_deadlift',
  workoutExerciseType: WorkoutExerciseType.DEADLIFT_RDL,
  name: 'Romanian Deadlift',
  associatedCodes: {},
}, {
  id: 'curl_bicep',
  workoutExerciseType: WorkoutExerciseType.CURL_BICEP,
  name: 'Bicep Curl',
  associatedCodes: {},
}, {
  id: 'triceps_extension',
  workoutExerciseType: WorkoutExerciseType.TRICEPS_EXTENSION,
  name: 'Triceps Extension',
  associatedCodes: {},
}, {
  id: 'shrug',
  workoutExerciseType: WorkoutExerciseType.SHRUG,
  name: 'Shrug',
  associatedCodes: {},
}, {
  id: 'press_shoulder',
  workoutExerciseType: WorkoutExerciseType.PRESS_SHOULDER,
  name: 'Shoulder Press',
  associatedCodes: {},
}, {
  id: 'pull_up',
  workoutExerciseType: WorkoutExerciseType.PULLUP,
  name: 'Pullup',
  associatedCodes: {},
}, {
  id: 'chinup',
  workoutExerciseType: WorkoutExerciseType.CHINUP,
  name: 'Chinup',
  associatedCodes: {},
}, {
  id: 'calf_press',
  workoutExerciseType: WorkoutExerciseType.CALF_PRESS,
  name: 'Calf Press',
  associatedCodes: {},
}, {
  id: 'leg_press',
  workoutExerciseType: WorkoutExerciseType.LEG_PRESS,
  name: 'Leg Press',
  associatedCodes: {},
}];

export const GainsContextProvider: React.FC = ({ children }) => {
  const [workouts, setWorkouts] = React.useState<readonly Workout[]>([]);
  const [exercises, setExercises] = React.useState<readonly Exercise[]>(originalExercises);
  const [workoutTemplates, setWorkoutTemplates] = React.useState<readonly WorkoutTemplate[]>([]);
  const [sets, setSets] = React.useState<readonly ExerciseSet[]>([]);
  // const [searchQuery, setSeachQuery] = React.useState<readonly Exercise[]>([]);

  useEffect(() => {
    void AsyncStorage.getItem('workouts').then((value) => {
      if (value) {
        setWorkouts(JSON.parse(value));
      }
    });

    void AsyncStorage.getItem('workoutTemplates').then((value) => {
      if (value) {
        setWorkoutTemplates(JSON.parse(value));
      }
    });

    void AsyncStorage.getItem('exercises').then((value) => {
      if (value) {
        setExercises(JSON.parse(value));
      }
    });

    void AsyncStorage.getItem('sets').then((value) => {
      if (value) {
        setSets(JSON.parse(value));
      }
    });
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem('sets', JSON.stringify(sets));
  }, [sets]);

  useEffect(() => {
    void AsyncStorage.setItem('workoutTemplates', JSON.stringify(workoutTemplates));
  }, [workoutTemplates]);

  useEffect(() => {
    void AsyncStorage.setItem('exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    void AsyncStorage.setItem('workouts', JSON.stringify(workouts));
  }, [workouts]);
  const addWorkout = useCallback((workout: Omit<Workout, 'id'>) => {
    setWorkouts((prev) => [{ id: nanoid(), ...workout }, ...prev]);
  }, []);

  const addExercise = useCallback((exercise: Omit<Exercise, 'id'>) => {
    setExercises((prev) => [{ id: nanoid(), ...exercise }, ...prev]);
  }, []);

  const addSet = useCallback((set: Omit<ExerciseSet, 'id' | 'createdAt'>) => {
    setSets((prev) => [{ id: nanoid(), createdAt: Date.now(), ...set }, ...prev]);
  }, []);
  const value = useMemo<GainsContextType>(() => ({
    sets,
    exercises,
    workouts,
    addExercise,
    addSet,
    addWorkout,
    getTotalSetCountForExercise: (exerciseId: string) => {
      const exercise = exercises.find((e) => e.id === exerciseId);
      if (exercise && exercise.setCount) {
        return exercise.setCount;
      }
      return DEFAULT_SET_COUNT;
    },
    workoutTemplates,
    searchForExercises: (query) => exercises.filter((exercise) => exercise.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())),
    upsertWorkoutTemplate: (exercises, name, workoutTemplateId) => {
      setWorkoutTemplates((prev) => {
        const workoutTemplate = prev.find((template) => template.id === workoutTemplateId);
        if (workoutTemplate) {
          return prev.map((template) => (template.id === workoutTemplateId ? { ...template, name, exerciseIds: exercises } : template));
        }
        return [...prev, { id: workoutTemplateId || nanoid(), exerciseIds: exercises, name }];
      });
    },
  }), [addSet, addExercise, sets, exercises, workouts, addWorkout, workoutTemplates]);

  return (
    <GainsContext.Provider value={value}>
      { children }
    </GainsContext.Provider>
  );
};

export const useSearchForExercises = () => {
  // eslint-disable-next-line
  const { searchForExercises } = React.useContext(GainsContext);

  return searchForExercises;
};

export const useExercises = () => React.useContext(GainsContext).exercises;

export const useSetsForExercise = (exerciseId: string) => {
  const { sets } = React.useContext(GainsContext);

  const setsForWorkout = useMemo(() => sets.filter((s) => s.exerciseId === exerciseId), [sets, exerciseId]);

  return setsForWorkout;
};

export const useWorkouts = () => React.useContext(GainsContext).workouts;

export const useAddExercise = () => React.useContext(GainsContext).addExercise;

export const useSaveSet = () => React.useContext(GainsContext).addSet;

export default GainsContext;
