import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { secondsToMMSS, e1rm } from '../lib/utils';
import type { SessionSet } from '../db/types';

export function Session() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const session = useLiveQuery(() => (id ? db.sessions.get(id) : undefined), [id]);
  const routine = useLiveQuery(
    () => (session ? db.routines.get(session.routineDayId) : undefined),
    [session?.routineDayId]
  );
  const exercises = useLiveQuery(() => db.exercises.toArray());

  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);


  async function updateSet(exerciseId: string, setIndex: number, field: keyof SessionSet, value: number | boolean) {
    if (!id || !session) return;
    const sets = [...session.sets];
    const idx = sets.findIndex((s) => s.exerciseId === exerciseId && s.setNumber === setIndex);
    if (idx === -1) {
      sets.push({
        exerciseId,
        setNumber: setIndex,
        weight: 0,
        reps: 0,
        rir: 2,
        completed: false,
        [field]: value,
      });
    } else {
      sets[idx] = { ...sets[idx], [field]: value };
    }
    await db.sessions.update(id, { sets });
  }

  async function toggleComplete(exerciseId: string, setIndex: number) {
    const current = session?.sets.find((s) => s.exerciseId === exerciseId && s.setNumber === setIndex);
    await updateSet(exerciseId, setIndex, 'completed', !(current?.completed ?? false));
  }

  async function addExtraSet(exerciseId: string, targetSets: number) {
    if (!id || !session) return;
    const exerciseSets = session.sets.filter((s) => s.exerciseId === exerciseId);
    const lastSet = exerciseSets[exerciseSets.length - 1];
    const newSet: SessionSet = {
      exerciseId,
      setNumber: targetSets + exerciseSets.filter(s => s.setNumber >= targetSets).length + 1,
      weight: lastSet?.weight ?? 0,
      reps: lastSet?.reps ?? 0,
      rir: lastSet?.rir ?? 2,
      completed: false,
    };
    await db.sessions.update(id, { sets: [...session.sets, newSet] });
  }

  async function finishSession() {
    if (!id) return;
    const mins = Math.round(elapsed / 60);
    await db.sessions.update(id, { durationMinutes: mins });
    navigate(`/session/${id}/summary`);
  }

  const getSet = useCallback(
    (exerciseId: string, setNumber: number): SessionSet | undefined =>
      session?.sets.find((s) => s.exerciseId === exerciseId && s.setNumber === setNumber),
    [session]
  );

  const getLastRecord = useCallback(
    async (exerciseId: string) => {
      const prev = await db.sessions
        .where('date').below(session?.date ?? '')
        .reverse()
        .filter((s) => s.sets.some((set) => set.exerciseId === exerciseId && set.completed))
        .first();
      if (!prev) return null;
      const best = prev.sets
        .filter((s) => s.exerciseId === exerciseId && s.completed)
        .reduce((a, b) => (e1rm(b.weight, b.reps) > e1rm(a.weight, a.reps) ? b : a), prev.sets[0]);
      return { date: prev.date, set: best };
    },
    [session?.date]
  );

  if (!session || !routine) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-gray-950">
        <p className="text-gray-400">Cargando sesión…</p>
      </div>
    );
  }


  const bgImage = session.routineDayId === 'day-a'
    ? '/fondo_dia_a.png'
    : session.routineDayId === 'day-b'
    ? '/fondo_dia_b.png'
    : null;

  return (
    <div className="flex flex-col min-h-svh bg-gray-950 relative">
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          className="fixed inset-0 w-full h-full object-cover opacity-15 pointer-events-none select-none z-0"
        />
      )}
      <div className="relative z-10 flex flex-col flex-1">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 px-2 py-3 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-orange-400 text-2xl active:text-orange-300 flex-shrink-0"
        >
          ‹
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 truncate">{routine.name}</p>
          <p className="text-lg font-bold text-white tabular-nums">{secondsToMMSS(elapsed)}</p>
        </div>
        <button
          onClick={finishSession}
          className="px-5 py-2 bg-green-700 rounded-xl text-white font-semibold text-sm active:bg-green-600 flex-shrink-0"
        >
          Terminar
        </button>
      </header>

      <div className="px-4 py-4 space-y-6">
        {routine.exercises.map((re) => {
          const ex = exercises?.find((e) => e.id === re.exerciseId);
          if (!ex) return null;

          const totalSets = re.targetSets + (session.sets.filter(
            (s) => s.exerciseId === re.exerciseId && s.setNumber > re.targetSets
          ).length);

          return (
            <ExerciseBlock
              key={re.exerciseId}
              exerciseName={ex.name}
              exerciseId={re.exerciseId}
              exerciseType={ex.type}
              imageUrl={ex.imageUrl}
              targetSets={re.targetSets}
              totalSets={totalSets}
              targetRepsMin={re.targetRepsMin}
              targetRepsMax={re.targetRepsMax}
              targetRIR={re.targetRIR}
              restSeconds={re.restSeconds}
              getSet={getSet}
              getLastRecord={getLastRecord}
              onSetChange={updateSet}
              onComplete={toggleComplete}
              onAddSet={() => addExtraSet(re.exerciseId, re.targetSets)}
            />
          );
        })}
      </div>
      </div>
    </div>
  );
}

type ExerciseBlockProps = {
  exerciseName: string;
  exerciseId: string;
  exerciseType: 'compound' | 'isolation';
  imageUrl?: string;
  targetSets: number;
  totalSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRIR: number;
  restSeconds: number;
  getSet: (exerciseId: string, setNumber: number) => SessionSet | undefined;
  getLastRecord: (exerciseId: string) => Promise<{ date: string; set: SessionSet } | null>;
  onSetChange: (exerciseId: string, setNumber: number, field: keyof SessionSet, value: number | boolean) => void;
  onComplete: (exerciseId: string, setNumber: number) => void;
  onAddSet: () => void;
};

function ExerciseBlock({
  exerciseName, exerciseId, exerciseType, imageUrl, targetSets, totalSets,
  targetRepsMin, targetRepsMax, targetRIR, restSeconds,
  getSet, getLastRecord, onSetChange, onComplete, onAddSet,
}: ExerciseBlockProps) {
  const [lastRecord, setLastRecord] = useState<{ date: string; set: SessionSet } | null>(null);
  const [imgExpanded, setImgExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    getLastRecord(exerciseId).then(setLastRecord);
  }, [exerciseId, getLastRecord]);

  const restLabel = restSeconds >= 60 ? `${restSeconds / 60}' desc` : `${restSeconds}'' desc`;

  const completedSets = Array.from({ length: totalSets }, (_, i) => i + 1)
    .filter((n) => getSet(exerciseId, n)?.completed).length;

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      {/* Header — tap to expand/collapse */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full px-4 py-3 flex items-start justify-between gap-2 active:bg-gray-800 transition-colors"
      >
        <div className="flex-1 min-w-0 text-left">
          <p className="font-semibold text-white text-base">{exerciseName}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {targetSets}×{targetRepsMin}-{targetRepsMax} · RIR {targetRIR} · {restLabel}
          </p>
          {lastRecord && (
            <p className="text-xs text-orange-400 mt-0.5">
              Último: {lastRecord.set.weight}kg × {lastRecord.set.reps} reps
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {completedSets > 0 && (
            <span className="text-xs text-green-400 font-semibold">{completedSets}/{totalSets}</span>
          )}
          {imageUrl && (
            <div
              onClick={(e) => { e.stopPropagation(); setImgExpanded((v) => !v); }}
              className="w-14 h-14 rounded-xl overflow-hidden border border-gray-700"
            >
              <img src={imageUrl} alt={exerciseName} className="w-full h-full object-cover" />
            </div>
          )}
          <span className="text-orange-400 text-xl">{collapsed ? '›' : '⌄'}</span>
        </div>
      </button>

      {imgExpanded && imageUrl && (
        <div
          className="mx-4 mb-3 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => setImgExpanded(false)}
        >
          <img src={imageUrl} alt={exerciseName} className="w-full max-h-64 object-contain bg-gray-800" />
          <p className="text-xs text-center text-gray-500 py-1">Toca para cerrar</p>
        </div>
      )}

      {!collapsed && (
        <>
          <div className="border-t border-gray-700" />
          {/* Column headers */}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_52px] gap-1 px-3 py-2 text-xs text-gray-500">
            <span>#</span>
            <span className="text-center">kg</span>
            <span className="text-center">reps</span>
            <span className="text-center">RIR</span>
            <span />
          </div>

          <div className="space-y-1 px-3 pb-3">
            {Array.from({ length: totalSets }, (_, i) => i + 1).map((setNum) => {
              const s = getSet(exerciseId, setNum);
              const isExtra = setNum > targetSets;

              let suggestion: string | null = null;
              if (lastRecord && setNum === 1 && !s?.weight) {
                const lastW = lastRecord.set.weight;
                const bump = exerciseType === 'compound' ? 2.5 : 1;
                suggestion = `Sugerencia: ${lastW + bump} kg`;
              }

              return (
                <SetRow
                  key={setNum}
                  setNumber={setNum}
                  isExtra={isExtra}
                  set={s}
                  suggestion={suggestion}
                  onFieldChange={(field, val) => onSetChange(exerciseId, setNum, field, val)}
                  onComplete={() => onComplete(exerciseId, setNum)}
                />
              );
            })}
          </div>

          <div className="px-3 pb-3 space-y-3">
            <button
              onClick={onAddSet}
              className="w-full py-2 bg-gray-800 rounded-xl text-gray-400 text-sm active:bg-gray-700"
            >
              + serie extra
            </button>
            {imageUrl && (
              <img
                src={imageUrl}
                alt={exerciseName}
                className="w-full max-h-48 object-contain rounded-xl bg-gray-800"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

type SetRowProps = {
  setNumber: number;
  isExtra: boolean;
  set: SessionSet | undefined;
  suggestion: string | null;
  onFieldChange: (field: keyof SessionSet, val: number | boolean) => void;
  onComplete: () => void;
};

function SetRow({ setNumber, isExtra, set, suggestion, onFieldChange, onComplete }: SetRowProps) {
  const done = set?.completed ?? false;

  return (
    <div className={`space-y-1 ${done ? 'opacity-60' : ''}`}>
      {suggestion && !done && (
        <p className="text-xs text-yellow-500 pl-10">{suggestion}</p>
      )}
      <div className="grid grid-cols-[40px_1fr_1fr_1fr_52px] gap-1 items-center">
        <span className={`text-sm font-medium ${isExtra ? 'text-yellow-500' : 'text-gray-400'}`}>
          {isExtra ? '+' : setNumber}
        </span>
        <NumInput
          value={set?.weight ?? 0}
          onChange={(v) => onFieldChange('weight', v)}
        />
        <NumInput
          value={set?.reps ?? 0}
          onChange={(v) => onFieldChange('reps', v)}
        />
        <NumInput
          value={set?.rir ?? 2}
          onChange={(v) => onFieldChange('rir', v)}
        />
        <button
          onClick={onComplete}
          className={`h-12 rounded-xl text-xl flex items-center justify-center transition-colors ${
            done ? 'bg-green-800 text-green-400 active:bg-red-900' : 'bg-gray-700 text-gray-300 active:bg-green-700'
          }`}
        >
          {done ? '✓' : '○'}
        </button>
      </div>
    </div>
  );
}

type NumInputProps = {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
};

function NumInput({ value, onChange, disabled }: NumInputProps) {
  return (
    <input
      type="number"
      inputMode="decimal"
      pattern="[0-9]*\.?[0-9]*"
      value={value === 0 ? '' : value}
      placeholder="0"
      disabled={disabled}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v)) onChange(v);
        else if (e.target.value === '') onChange(0);
      }}
      className="w-full bg-gray-800 rounded-lg px-1 py-2 text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
    />
  );
}
