import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { secondsToMMSS } from '../lib/utils';
import type { StretchExercise } from '../db/types';

export function StretchGuide() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routine = useLiveQuery(() => (id ? db.stretchRoutines.get(id) : undefined), [id]);

  const [step, setStep] = useState<'list' | 'active'>('list');
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (step !== 'active' || paused) return;
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, paused, timeLeft]);

  function startRoutine() {
    if (!routine) return;
    setCurrent(0);
    setTimeLeft(routine.exercises[0].durationSeconds);
    setPaused(false);
    setStep('active');
  }

  function next() {
    if (!routine) return;
    if (current + 1 >= routine.exercises.length) {
      navigate(-1);
      return;
    }
    const next = current + 1;
    setCurrent(next);
    setTimeLeft(routine.exercises[next].durationSeconds);
    setPaused(false);
  }

  function prev() {
    if (!routine || current === 0) return;
    const prev = current - 1;
    setCurrent(prev);
    setTimeLeft(routine.exercises[prev].durationSeconds);
    setPaused(false);
  }

  if (!routine) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-gray-950">
        <p className="text-gray-400">Cargando…</p>
      </div>
    );
  }

  if (step === 'list') {
    return <RoutineList routine={routine} onStart={startRoutine} onBack={() => navigate(-1)} />;
  }

  const ex = routine.exercises[current];
  const pct = timeLeft / ex.durationSeconds;

  return (
    <div className="min-h-svh bg-gray-950 flex flex-col relative">
      <img src="/fondo_stretch.png" alt="" className="fixed inset-0 w-full h-full object-cover opacity-15 pointer-events-none select-none z-0" />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 px-2 py-3 flex items-center gap-2">
        <button onClick={() => setStep('list')} className="w-10 h-10 flex items-center justify-center text-orange-400 text-2xl">‹</button>
        <div className="flex-1">
          <p className="text-xs text-gray-400">{routine.name}</p>
          <p className="text-sm font-semibold text-white">{current + 1} / {routine.exercises.length}</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 pr-2">Salir</button>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-1 bg-orange-500 transition-all duration-1000"
          style={{ width: `${((current) / routine.exercises.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col px-4 py-6 gap-6">
        {/* Image */}
        {ex.imageUrl ? (
          <img src={ex.imageUrl} alt={ex.name} className="w-full max-h-48 object-contain rounded-2xl bg-gray-900" />
        ) : (
          <div className="w-full h-40 rounded-2xl bg-gray-900 flex items-center justify-center">
            <span className="text-6xl">🧘</span>
          </div>
        )}

        {/* Exercise info */}
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">{ex.name}</h2>
          {ex.description && (
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">{ex.description}</p>
          )}
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="64" fill="none" stroke="#1f2937" strokeWidth="10" />
              <circle
                cx="72" cy="72" r="64" fill="none"
                stroke="#f97316" strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - pct)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black text-white tabular-nums">{secondsToMMSS(timeLeft)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 w-full">
            <button
              onClick={prev}
              disabled={current === 0}
              className="flex-1 py-4 bg-gray-800 rounded-2xl text-white font-bold text-lg active:bg-gray-700 disabled:opacity-30"
            >
              ‹ Anterior
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              className="flex-1 py-4 bg-gray-700 rounded-2xl text-white font-bold text-lg active:bg-gray-600"
            >
              {paused ? '▶ Reanudar' : '⏸ Pausa'}
            </button>
            <button
              onClick={next}
              className="flex-1 py-4 bg-orange-600 rounded-2xl text-white font-bold text-lg active:bg-orange-700"
            >
              {current + 1 === routine.exercises.length ? '✓ Fin' : 'Siguiente ›'}
            </button>
          </div>
        </div>

        {/* Next exercise preview */}
        {current + 1 < routine.exercises.length && (
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">Siguiente</p>
            <p className="text-sm font-semibold text-white">{routine.exercises[current + 1].name}</p>
            <p className="text-xs text-gray-400">{secondsToMMSS(routine.exercises[current + 1].durationSeconds)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RoutineList({
  routine,
  onStart,
  onBack,
}: {
  routine: { name: string; description?: string; exercises: StretchExercise[] };
  onStart: () => void;
  onBack: () => void;
}) {
  const total = routine.exercises.reduce((a, b) => a + b.durationSeconds, 0);

  return (
    <div className="min-h-svh bg-gray-950 flex flex-col relative">
      <img src="/fondo_stretch.png" alt="" className="fixed inset-0 w-full h-full object-cover opacity-15 pointer-events-none select-none z-0" />
      <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 px-2 py-3 flex items-center gap-2">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-orange-400 text-2xl">‹</button>
        <h1 className="text-lg font-semibold text-white flex-1">{routine.name}</h1>
      </header>

      <div className="px-4 py-6 flex flex-col gap-4 flex-1">
        <div className="bg-gray-900 rounded-2xl p-4 flex justify-between">
          <div className="text-center">
            <p className="text-2xl font-black text-orange-400">{routine.exercises.length}</p>
            <p className="text-xs text-gray-400">ejercicios</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-orange-400">{secondsToMMSS(total)}</p>
            <p className="text-xs text-gray-400">duración total</p>
          </div>
        </div>

        {routine.description && (
          <p className="text-gray-400 text-sm">{routine.description}</p>
        )}

        <div className="space-y-2">
          {routine.exercises.map((ex, i) => (
            <div key={i} className="bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-orange-400 font-bold text-sm w-6">{i + 1}</span>
              {ex.imageUrl && (
                <img src={ex.imageUrl} alt={ex.name} className="w-12 h-12 rounded-lg object-cover bg-gray-800 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{ex.name}</p>
                {ex.description && <p className="text-gray-500 text-xs truncate">{ex.description}</p>}
              </div>
              <span className="text-gray-400 text-sm flex-shrink-0">{secondsToMMSS(ex.durationSeconds)}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="w-full py-5 bg-orange-600 rounded-2xl text-white text-xl font-black active:bg-orange-700 shadow-lg shadow-orange-900/40 mt-auto"
        >
          🧘 Empezar rutina
        </button>
      </div>
    </div>
  );
}
