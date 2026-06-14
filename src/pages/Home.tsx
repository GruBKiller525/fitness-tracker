import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { BottomNav } from '../components/BottomNav';
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
    <div className="flex flex-col min-h-svh pb-20 bg-gray-950 relative">
      <img
        src="/vegeta_wallpaper.png"
        alt=""
        className="fixed inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none z-0"
      />
      <div className="relative z-10 flex flex-col flex-1">
      {/* Header Dragon Ball */}
      <div className="relative overflow-hidden">
        <img
          src="/dragonball.svg"
          alt=""
          className="absolute right-0 top-0 w-48 opacity-30 pointer-events-none select-none"
        />
        <div className="px-4 pt-6 pb-4 relative z-10">
          <p className="text-orange-400 text-sm capitalize font-medium">{dayLabel}</p>
          <h1 className="text-3xl font-black text-white mt-0.5 tracking-tight">
            ¡A entrenar, guerrero! ⚡
          </h1>
          <p className="text-gray-500 text-xs mt-1">El poder se forja en el esfuerzo</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Main CTA */}
        {todayRoutine ? (
          <button
            onClick={() => startSession(todayRoutine.id)}
            className="w-full py-5 bg-orange-600 rounded-2xl text-white text-xl font-black active:bg-orange-700 transition-colors shadow-lg shadow-orange-900/40 tracking-wide"
          >
            ⚡ {todayRoutine.name}
          </button>
        ) : (
          <button
            onClick={() => startSession('day-a')}
            className="w-full py-4 bg-orange-600 rounded-2xl text-white text-lg font-black active:bg-orange-700 tracking-wide shadow-lg shadow-orange-900/40"
          >
            ⚡ Sesión de entrenamiento
          </button>
        )}

        {/* Session image buttons */}
        <div className="flex gap-2">
          {dayARoutine && (
            <button
              onClick={() => startSession('day-a')}
              className="flex-1 rounded-xl overflow-hidden relative active:opacity-80 transition-opacity"
            >
              <img src="/BotonSesionA_Raditz.png" alt="Día A" className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                <span className="text-white text-sm font-bold drop-shadow">Día A</span>
              </div>
            </button>
          )}
          {dayBRoutine && (
            <button
              onClick={() => startSession('day-b')}
              className="flex-1 rounded-xl overflow-hidden relative active:opacity-80 transition-opacity"
            >
              <img src="/BotonSesionB_Nappa.png" alt="Día B" className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                <span className="text-white text-sm font-bold drop-shadow">Día B</span>
              </div>
            </button>
          )}
        </div>

        {/* Estiramientos button - always visible */}
        <button
          onClick={() => navigate('/stretch')}
          className="w-full rounded-xl overflow-hidden relative active:opacity-80 transition-opacity"
        >
          <img src="/boton_saibaiman.png" alt="Estiramientos" className="w-full h-24 object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-end p-2">
            <span className="text-white text-sm font-bold drop-shadow">Estiramientos</span>
          </div>
        </button>

        {/* Habit tracker */}
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-orange-400">🔥 Entrenamiento diario</p>
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
                className="w-10 h-10 bg-orange-700 rounded-lg text-xl text-white flex items-center justify-center active:bg-orange-600"
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
                <p className="text-xs text-orange-400 mt-0.5">
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
              className="mt-2 text-xs text-orange-400 underline"
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
              className="px-5 bg-orange-600 rounded-xl text-white font-semibold active:bg-orange-700"
            >
              OK
            </button>
          </div>
        )}
      </div>
      </div>

      <BottomNav />
    </div>
  );
}
