import { db } from './db';
import type { Exercise, RoutineDay } from './types';

const exercises: Exercise[] = [
  { id: 'ex-squat', name: 'Sentadilla con barra', muscleGroup: 'piernas', type: 'compound' },
  { id: 'ex-bench', name: 'Press banca con barra', muscleGroup: 'pecho', type: 'compound' },
  { id: 'ex-row', name: 'Remo con barra', muscleGroup: 'espalda', type: 'compound' },
  { id: 'ex-ohp', name: 'Press militar mancuernas', muscleGroup: 'hombros', type: 'compound' },
  { id: 'ex-curl', name: 'Curl bíceps barra', muscleGroup: 'biceps', type: 'isolation' },
  { id: 'ex-facepull', name: 'Face pull polea', muscleGroup: 'hombros', type: 'isolation' },
  { id: 'ex-plank', name: 'Plancha abdominal', muscleGroup: 'core', type: 'isolation', notes: 'En segundos' },
  { id: 'ex-rdl', name: 'Peso muerto rumano', muscleGroup: 'piernas', type: 'compound' },
  { id: 'ex-pulldown', name: 'Jalón al pecho', muscleGroup: 'espalda', type: 'compound' },
  { id: 'ex-incpress', name: 'Press inclinado mancuernas', muscleGroup: 'pecho', type: 'compound' },
  { id: 'ex-hipthrust', name: 'Hip thrust con barra', muscleGroup: 'gluteo', type: 'compound' },
  { id: 'ex-lateral', name: 'Elevaciones laterales', muscleGroup: 'hombros', type: 'isolation' },
  { id: 'ex-triceps', name: 'Extensión tríceps polea', muscleGroup: 'triceps', type: 'isolation' },
];

const routines: RoutineDay[] = [
  {
    id: 'day-a',
    name: 'Día A — Empuje / Cuádriceps',
    exercises: [
      { exerciseId: 'ex-squat', targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetRIR: 2, restSeconds: 180 },
      { exerciseId: 'ex-bench', targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetRIR: 2, restSeconds: 180 },
      { exerciseId: 'ex-row', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRIR: 2, restSeconds: 120 },
      { exerciseId: 'ex-ohp', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRIR: 2, restSeconds: 90 },
      { exerciseId: 'ex-curl', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRIR: 1, restSeconds: 90 },
      { exerciseId: 'ex-facepull', targetSets: 3, targetRepsMin: 15, targetRepsMax: 15, targetRIR: 1, restSeconds: 60 },
      { exerciseId: 'ex-plank', targetSets: 3, targetRepsMin: 30, targetRepsMax: 45, targetRIR: 0, restSeconds: 60, notes: 'Segundos' },
    ],
  },
  {
    id: 'day-b',
    name: 'Día B — Tracción / Cadera',
    exercises: [
      { exerciseId: 'ex-rdl', targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetRIR: 2, restSeconds: 180 },
      { exerciseId: 'ex-pulldown', targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, targetRIR: 2, restSeconds: 90 },
      { exerciseId: 'ex-incpress', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRIR: 2, restSeconds: 90 },
      { exerciseId: 'ex-hipthrust', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRIR: 2, restSeconds: 90 },
      { exerciseId: 'ex-lateral', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRIR: 1, restSeconds: 60 },
      { exerciseId: 'ex-facepull', targetSets: 3, targetRepsMin: 15, targetRepsMax: 15, targetRIR: 1, restSeconds: 60 },
      { exerciseId: 'ex-triceps', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRIR: 1, restSeconds: 60 },
    ],
  },
];

export async function seedIfEmpty() {
  const count = await db.exercises.count();
  if (count > 0) return;
  await db.exercises.bulkPut(exercises);
  await db.routines.bulkPut(routines);
}
