import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '../db/db';
import { generateId, today, formatDate, getTodayRoutineSlot } from '../lib/utils';
import type { DailyHabit } from '../db/types';

export function Home() {
  const navigate = useNavigate();
  const todayStr = today();
  const [quickWeight, setQuickWeight] = useState('');
  const [showWeightInput, setShowWeightInput] = useState(false);

  const sessions = useLiveQuery(() => db.sessions.orderBy('date').reverse().limit(1).toArray());
  const lastSession = sessions?.[0];

  const routines = useLiveQuery(() => db.routines.toArray());
  const dayARoutine = routines?.find((r) => r.id === 'day-a');
  const dayBRoutine = routines?.find((r) => r.id === 'day-b');

  const weights = useLiveQuery(() =>
    db.measurements.where('date').aboveOrEqual(
      format(new Date(Date.now() - 30 * 86400000), 'yyyy-MM-dd')
    ).sortBy('date')
  );
  const latestWeight = weights?.[weights.length - 1];

  const habit = useLiveQuery(() => db.habits.get(todayStr));

  const slot = getTodayRoutineSlot();
  const todayRoutine = slot === 'A' ? dayARoutine : slot === 'B' ? dayBRoutine : null;

  async function startSession(routineId: string) {
    const id = generateId();
    await db.sessions.put({
      id,
      date: todayStr,
      routineDayId: routineId,
      energy: 3,
      sleepHours: 7,
      sets: [],
    });
    navigate(`/session/${id}`);
  }

  async function saveWeight() {
    const w = parseFloat(quickWeight);
    if (isNaN(w) || w <= 0) return;
    await db.measurements.put({
      id: generateId(),
      date: todayStr,
      weight: w,
    });
    setQuickWeight('');
    setShowWeightInput(false);
  }

  async function toggleHabit(field: keyof Pick<DailyHabit, 'morningMobility' | 'eveningStretch'>) {
    const existing = await db.habits.get(todayStr);
    if (existing) {
      await db.habits.update(todayStr, { [field]: !existing[field] });
    } else {
      await db.habits.put({
        id: todayStr,
        date: todayStr,
        morningMobility: field === 'morningMobility',
        eveningStretch: field === 'eveningStretch',
        posturalSnacks: 0,
      });
    }
  }

  async function changeSnacks(delta: number) {
    const existing = await db.habits.get(todayStr);
    if (existing) {
      await db.habits.update(todayStr, { posturalSnacks: Math.max(0, existing.posturalSnacks + delta) });
    } else {
      await db.habits.put({
        id: todayStr,
        date: todayStr,
        morningMobility: false,
        eveningStretch: false,
        posturalSnacks: Math.max(0, delta),
      });
    }
  }

  const dayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="flex flex-col min-h-svh pb-20 bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <p className="text-gray-400 text-sm capitalize">{dayLabel}</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">¡Hola! 💪</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Main CTA */}
        {todayRoutine ? (
          <button
            onClick={() => startSession(todayRoutine.id)}
            className="w-full py-5 bg-indigo-600 rounded-2xl text-white text-xl font-bold active:bg-indigo-700 transition-colors"
          >
            Empezar {todayRoutine.name}
          </button>
        ) : (
          <div className="w-full py-4 bg-gray-800 rounded-2xl text-gray-400 text-center">
            <p className="text-lg font-semibold">Día de descanso</p>
            <p className="text-sm mt-1">Toca para sesión libre</p>
          </div>
        )}

        {/* Free session buttons */}
        <div className="flex gap-2">
          {dayARoutine && (
            <button
              onClick={() => startSession('day-a')}
              className="flex-1 py-3 bg-gray-800 rounded-xl text-gray-300 text-sm font-medium active:bg-gray-700"
            >
              Sesión Día A
            </button>
          )}
          {dayBRoutine && (
            <button
              onClick={() => startSession('day-b')}
              className="flex-1 py-3 bg-gray-800 rounded-xl text-gray-300 text-sm font-medium active:bg-gray-700"
            >
              Sesión Día B
            </button>
          )}
        </div>

        {/* Habit tracker */}
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-300">Hábitos de hoy</p>
          <div className="flex gap-2">
            <button
              onClick={() => toggleHabit('morningMobility')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                habit?.morningMobility ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {habit?.morningMobility ? '✓' : '○'} Movilidad mañana
            </button>
            <button
              onClick={() => toggleHabit('eveningStretch')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                habit?.eveningStretch ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {habit?.eveningStretch ? '✓' : '○'} Estiram. noche
            </button>
          </div>
          <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-300">Snacks posturales</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeSnacks(-1)}
                className="w-10 h-10 bg-gray-700 rounded-lg text-xl text-white flex items-center justify-center active:bg-gray-600"
              >
                −
              </button>
              <span className="text-2xl font-bold text-white w-6 text-center">
                {habit?.posturalSnacks ?? 0}
              </span>
              <button
                onClick={() => changeSnacks(1)}
                className="w-10 h-10 bg-indigo-700 rounded-lg text-xl text-white flex items-center justify-center active:bg-indigo-600"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Last session */}
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">Última sesión</p>
            {lastSession ? (
              <>
                <p className="text-sm font-semibold text-white leading-tight">
                  {routines?.find((r) => r.id === lastSession.routineDayId)?.name?.split('—')[0]?.trim() ?? '—'}
                </p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(lastSession.date)}</p>
                <p className="text-xs text-indigo-400 mt-0.5">
                  {lastSession.sets.filter((s) => s.completed).length} series
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Sin sesiones aún</p>
            )}
          </div>

          {/* Bodyweight */}
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">Peso corporal</p>
            {latestWeight ? (
              <>
                <p className="text-2xl font-bold text-white">{latestWeight.weight}<span className="text-sm font-normal text-gray-400"> kg</span></p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(latestWeight.date)}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Sin registros</p>
            )}
            <button
              onClick={() => setShowWeightInput(!showWeightInput)}
              className="mt-2 text-xs text-indigo-400 underline"
            >
              + Registrar hoy
            </button>
          </div>
        </div>

        {/* Quick weight input */}
        {showWeightInput && (
          <div className="bg-gray-900 rounded-2xl p-4 flex gap-3">
            <input
              type="number"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              placeholder="Peso en kg"
              value={quickWeight}
              onChange={(e) => setQuickWeight(e.target.value)}
              className="flex-1 bg-gray-800 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={saveWeight}
              className="px-5 bg-indigo-600 rounded-xl text-white font-semibold active:bg-indigo-700"
            >
              OK
            </button>
          </div>
        )}
      </div>

      {/* Bottom nav spacer handled by pb-20 */}
    </div>
  );
}
