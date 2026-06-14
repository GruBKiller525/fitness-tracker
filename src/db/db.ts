import Dexie, { type Table } from 'dexie';
import type { Exercise, RoutineDay, WorkoutSession, BodyMeasurement, DailyHabit } from './types';

class FitnessDB extends Dexie {
  exercises!: Table<Exercise, string>;
  routines!: Table<RoutineDay, string>;
  sessions!: Table<WorkoutSession, string>;
  measurements!: Table<BodyMeasurement, string>;
  habits!: Table<DailyHabit, string>;

  constructor() {
    super('FitnessTrackerDB');
    this.version(1).stores({
      exercises: 'id, name, muscleGroup, type',
      routines: 'id, name',
      sessions: 'id, date, routineDayId',
      measurements: 'id, date',
      habits: 'id, date',
    });
  }
}

export const db = new FitnessDB();
