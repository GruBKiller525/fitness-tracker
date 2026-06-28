export type ID = string;

export type MuscleGroup =
  | 'pecho' | 'espalda' | 'piernas' | 'hombros'
  | 'biceps' | 'triceps' | 'gluteo' | 'core' | 'cardio';

export type Exercise = {
  id: ID;
  name: string;
  muscleGroup: MuscleGroup;
  type: 'compound' | 'isolation';
  imageUrl?: string;
  notes?: string;
};

export type RoutineDayExercise = {
  exerciseId: ID;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRIR: number;
  restSeconds: number;
  notes?: string;
};

export type RoutineDay = {
  id: ID;
  name: string;
  exercises: RoutineDayExercise[];
};

export type SessionSet = {
  exerciseId: ID;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number;
  completed: boolean;
};

export type WorkoutSession = {
  id: ID;
  date: string;
  routineDayId: ID;
  energy: 1 | 2 | 3 | 4 | 5;
  sleepHours: number;
  bodyweight?: number;
  sets: SessionSet[];
  notes?: string;
  durationMinutes?: number;
};

export type BodyMeasurement = {
  id: ID;
  date: string;
  weight: number;
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  armRelaxed?: number;
  armFlexed?: number;
  forearm?: number;
  thigh?: number;
  calf?: number;
  notes?: string;
};

export type DailyHabit = {
  id: ID;
  date: string;
  morningMobility: boolean;
  eveningStretch: boolean;
  posturalSnacks: number;
  notes?: string;
};

export type StretchExercise = {
  name: string;
  durationSeconds: number;
  description?: string;
  imageUrl?: string;
};

export type StretchRoutine = {
  id: ID;
  name: string;
  description?: string;
  exercises: StretchExercise[];
};

export type StretchLog = {
  id: ID;
  date: string;
  routineId: string;
};

export type AppExport = {
  exercises: Exercise[];
  routines: RoutineDay[];
  sessions: WorkoutSession[];
  measurements: BodyMeasurement[];
  habits: DailyHabit[];
  exportedAt: string;
};
