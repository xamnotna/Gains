/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    type RootParamList = RootStackParamList
  }
}

export type RootStackParamList = {
  readonly Root: NavigatorScreenParams<RootTabParamList> | undefined;
  readonly Modal: {
    readonly workout: Workout
  };
  readonly NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
RootStackParamList,
Screen
>;

export type RootTabParamList = {
  readonly WorkoutListTab: undefined;
  readonly ExerciseListTab: undefined;
  readonly StartWorkoutTab: undefined;
  readonly TabTwo: undefined;
  readonly ProfileTab: undefined;

};

export type LoginParamList = {
  readonly LoginRequest: undefined;
  readonly LoginConfirm: { readonly email: string };
};

export type LoginScreenProps<Screen extends keyof LoginParamList> = CompositeScreenProps<
NativeStackScreenProps<LoginParamList, Screen>,
NativeStackScreenProps<RootStackParamList>
>;

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
BottomTabScreenProps<RootTabParamList, Screen>,
NativeStackScreenProps<RootStackParamList>
>;

export type Workout = {
  readonly id: string;
  readonly name: string;
  readonly associatedCodes: Record<string, string>
}

export type ExerciseSet = {
  readonly id: string;
  readonly reps: number;
  readonly weight: number;
  readonly createdAt: number;
  readonly workoutId: string;
}
