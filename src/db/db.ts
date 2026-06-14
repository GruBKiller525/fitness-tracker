import Dexie, { type Table } from 'dexie';
import type { Exercise, RoutineDay, WorkoutSession, BodyMeasurement, DailyHabit, StretchRoutine } from './types';

class FitnessDB extends Dexie {
  exercises!: Table<Exercise, string>;
  routines!: Table<RoutineDay, string>;
  sessions!: Table<WorkoutSession, string>;
  measurements!: Table<BodyMeasurement, string>;
  habits!: Table<DailyHabit, string>;
  stretchRoutines!: Table<StretchRoutine, string>;

  constructor() {
    super('FitnessTrackerDB');
    this.version(1).stores({
      exercises: 'id, name, muscleGroup, type',
      routines: 'id, name',
      sessions: 'id, date, routineDayId',
      measurements: 'id, date',
      habits: 'id, date',
    });
    this.version(2).stores({
      exercises: 'id, name, muscleGroup, type',
      routines: 'id, name',
      sessions: 'id, date, routineDayId',
      measurements: 'id, date',
      habits: 'id, date',
      stretchRoutines: 'id, name',
    });
  }
}

export const db = new FitnessDB();
