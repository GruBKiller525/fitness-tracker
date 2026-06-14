import { db } from './db';
import type { Exercise, RoutineDay, StretchRoutine } from './types';

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

const stretchRoutines: StretchRoutine[] = [
  {
    id: 'stretch-morning',
    name: 'Movilidad mañana',
    description: 'Rutina de 7 minutos para activar el cuerpo',
    exercises: [
      { name: 'Rotaciones de cuello', durationSeconds: 30, description: 'Gira el cuello lentamente en círculos, 5 en cada dirección' },
      { name: 'Círculos de hombros', durationSeconds: 30, description: 'Lleva los hombros hacia adelante y hacia atrás en círculos amplios' },
      { name: 'Rotación de cadera', durationSeconds: 40, description: 'Pies separados, manos en caderas, gira la pelvis en círculos grandes' },
      { name: 'Flexión lateral de tronco', durationSeconds: 40, description: 'De pie, inclínate lateralmente alternando lados con el brazo en alto' },
      { name: 'Sentadilla profunda con pausa', durationSeconds: 45, description: 'Baja despacio hasta el fondo, mantén 2 segundos y sube' },
      { name: 'Estiramiento de cuádriceps', durationSeconds: 45, description: 'De pie, dobla una rodilla y sujeta el pie, alterna piernas' },
      { name: 'Apertura de cadera (paloma)', durationSeconds: 60, description: 'En el suelo, una pierna doblada al frente y la otra estirada atrás' },
      { name: 'Estiramiento de isquiotibiales', durationSeconds: 45, description: 'Sentado en el suelo, piernas estiradas, inclínate hacia adelante' },
      { name: 'Gato-vaca', durationSeconds: 40, description: 'A cuatro patas, alterna arquear y redondear la espalda con la respiración' },
      { name: 'Respiración profunda', durationSeconds: 30, description: 'De pie, inhala 4 segundos, mantén 4, exhala 4. Repite.' },
    ],
  },
  {
    id: 'stretch-evening',
    name: 'Estiramientos noche',
    description: 'Rutina de 8 minutos para relajar y recuperar',
    exercises: [
      { name: 'Estiramiento de pecho en pared', durationSeconds: 45, description: 'Apoya el brazo en la pared a 90° y gira el cuerpo hacia el lado contrario' },
      { name: 'Estiramiento de dorsales', durationSeconds: 45, description: 'Agarra un soporte fijo y deja caer el peso del cuerpo hacia atrás' },
      { name: 'Estiramiento de psoas', durationSeconds: 50, description: 'Posición de zancada, rodilla en el suelo, empuja la cadera hacia adelante' },
      { name: 'Mariposa (ingles)', durationSeconds: 50, description: 'Sentado, junta las plantas de los pies y presiona suavemente las rodillas hacia abajo' },
      { name: 'Estiramiento piriforme', durationSeconds: 50, description: 'Tumbado boca arriba, cruza un tobillo sobre la rodilla contraria y estira' },
      { name: 'Estiramiento de columna (torsión)', durationSeconds: 40, description: 'Tumbado, lleva una rodilla al pecho y gírala al lado contrario, mira hacia el opuesto' },
      { name: 'Postura del niño', durationSeconds: 60, description: 'Arrodillado, siéntate sobre los talones y estira los brazos al frente en el suelo' },
      { name: 'Estiramiento de gemelos', durationSeconds: 40, description: 'Apoya las manos en la pared, una pierna adelantada y la otra estirada atrás' },
      { name: 'Estiramiento cervical lateral', durationSeconds: 40, description: 'Inclina la cabeza a un lado, lleva la oreja al hombro, aguanta y alterna' },
      { name: 'Respiración 4-7-8', durationSeconds: 60, description: 'Inhala 4 seg, mantén 7 seg, exhala 8 seg. Repite 3 veces para relajarte.' },
    ],
  },
];

export async function seedIfEmpty() {
  const count = await db.exercises.count();
  if (count > 0) {
    await seedStretchRoutines();
    return;
  }
  await db.exercises.bulkPut(exercises);
  await db.routines.bulkPut(routines);
  await db.stretchRoutines.bulkPut(stretchRoutines);
}

async function seedStretchRoutines() {
  const count = await db.stretchRoutines.count();
  if (count === 0) await db.stretchRoutines.bulkPut(stretchRoutines);
}
