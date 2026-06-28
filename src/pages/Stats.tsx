import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { db } from '../db/db';
import { e1rm, formatDateShort } from '../lib/utils';
import { PageShell } from '../components/PageShell';
import { format, startOfWeek, addDays } from 'date-fns';

type Tab = 'ejercicio' | 'actividad' | 'guia';

export function Stats() {
  const [tab, setTab] = useState<Tab>('ejercicio');

  const labels: Record<Tab, string> = { ejercicio: 'Ejercicio', actividad: 'Actividad', guia: 'Guía' };

  return (
    <PageShell title="Estadísticas">
      <div className="flex gap-1 mb-4">
        {(['ejercicio', 'actividad', 'guia'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {labels[t]}
          </button>
        ))}
      </div>

      {tab === 'ejercicio' && <ExerciseStats />}
      {tab === 'actividad' && <ActivityStats />}
      {tab === 'guia' && <WikiGuide />}
    </PageShell>
  );
}

function ExerciseStats() {
  const exercises = useLiveQuery(() => db.exercises.toArray());
  const [selectedId, setSelectedId] = useState<string>('');
  const sessions = useLiveQuery(() => db.sessions.orderBy('date').toArray());

  const selected = exercises?.find((e) => e.id === selectedId) ?? exercises?.[0];

  const chartData = sessions
    ?.filter((s) => s.sets.some((set) => set.exerciseId === (selected?.id ?? '') && set.completed))
    .map((s) => {
      const sets = s.sets.filter((set) => set.exerciseId === selected?.id && set.completed);
      const bestE1rm = Math.max(...sets.map((set) => e1rm(set.weight, set.reps)));
      const volume = sets.reduce((acc, set) => acc + set.weight * set.reps, 0);
      return { date: formatDateShort(s.date), e1rm: bestE1rm, volume };
    }) ?? [];

  const allSets = sessions?.flatMap((s) =>
    s.sets.filter((set) => set.exerciseId === selected?.id && set.completed)
  ) ?? [];
  const bestSet = allSets.reduce<typeof allSets[0] | null>(
    (best, s) => (!best || e1rm(s.weight, s.reps) > e1rm(best.weight, best.reps) ? s : best),
    null
  );

  return (
    <div className="space-y-4">
      <select
        value={selectedId || selected?.id || ''}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white text-base focus:outline-none"
      >
        {exercises?.map((ex) => (
          <option key={ex.id} value={ex.id}>{ex.name}</option>
        ))}
      </select>

      {bestSet && (
        <div className="bg-gray-900 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Mejor set histórico</p>
          <p className="text-2xl font-bold text-white mt-1">
            {bestSet.weight} kg × {bestSet.reps} reps
          </p>
          <p className="text-sm text-orange-400">e1RM: {e1rm(bestSet.weight, bestSet.reps)} kg</p>
        </div>
      )}

      {chartData.length > 1 ? (
        <>
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3">e1RM estimado (kg)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="e1rm" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3">Volumen por sesión (kg×reps)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
                <Bar dataKey="volume" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">Necesitas al menos 2 sesiones con este ejercicio</p>
      )}
    </div>
  );
}

function ActivityStats() {
  const sessions = useLiveQuery(() => db.sessions.orderBy('date').toArray());
  const stretchLogs = useLiveQuery(() => db.stretchLogs.orderBy('date').toArray());

  if (!sessions || !stretchLogs) return null;

  // Build last 8 weeks of data
  const weekData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(addDays(new Date(), -(7 * (7 - i))), { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    const label = format(weekStart, 'dd/MM');
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(weekEnd, 'yyyy-MM-dd');

    const gym = sessions.filter((s) =>
      (s.routineDayId === 'day-a' || s.routineDayId === 'day-b') &&
      s.date >= startStr && s.date <= endStr
    ).length;
    const sport = sessions.filter((s) =>
      s.routineDayId === 'sport' && s.date >= startStr && s.date <= endStr
    ).length;
    const stretch = stretchLogs.filter((l) =>
      l.date >= startStr && l.date <= endStr
    ).length;

    return { label, gym, sport, stretch };
  });

  const totalGym = sessions.filter((s) => s.routineDayId === 'day-a' || s.routineDayId === 'day-b').length;
  const totalSport = sessions.filter((s) => s.routineDayId === 'sport').length;
  const totalStretch = stretchLogs.length;

  return (
    <div className="space-y-4">
      {/* Totals */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-orange-400">{totalGym}</p>
          <p className="text-xs text-gray-400 mt-0.5">Gym</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-blue-400">{totalSport}</p>
          <p className="text-xs text-gray-400 mt-0.5">Deporte</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-green-400">{totalStretch}</p>
          <p className="text-xs text-gray-400 mt-0.5">Estiram.</p>
        </div>
      </div>

      {/* Weekly breakdown chart */}
      <div className="bg-gray-900 rounded-2xl p-4">
        <p className="text-xs text-gray-400 mb-3">Actividad por semana (últimas 8)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekData} barSize={8}>
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            <Bar dataKey="gym" name="Gym" fill="#f97316" radius={[3, 3, 0, 0]} />
            <Bar dataKey="sport" name="Deporte" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="stretch" name="Estiram." fill="#22c55e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Last 4 weeks summary */}
      <div className="bg-gray-900 rounded-2xl p-4">
        <p className="text-xs text-gray-400 mb-2">Últimas 4 semanas</p>
        <div className="space-y-2">
          {[
            { label: 'Sesiones gym', value: sessions.filter((s) => (s.routineDayId === 'day-a' || s.routineDayId === 'day-b') && s.date >= format(addDays(new Date(), -28), 'yyyy-MM-dd')).length, color: 'text-orange-400' },
            { label: 'Sesiones deporte', value: sessions.filter((s) => s.routineDayId === 'sport' && s.date >= format(addDays(new Date(), -28), 'yyyy-MM-dd')).length, color: 'text-blue-400' },
            { label: 'Estiramientos', value: stretchLogs.filter((l) => l.date >= format(addDays(new Date(), -28), 'yyyy-MM-dd')).length, color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{label}</span>
              <span className={`text-sm font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type WikiSection = { title: string; color: string; items: { name: string; muscles: string; benefit: string; tips: string }[] };

const wikiData: WikiSection[] = [
  {
    title: 'Día A — Fuerza y volumen',
    color: 'border-orange-500',
    items: [
      {
        name: 'Sentadilla con barra',
        muscles: 'Cuádriceps, glúteos, isquios, core',
        benefit: 'El ejercicio compuesto más completo para el tren inferior. Desarrolla fuerza estructural, masa muscular global y estimula la producción hormonal (testosterona, GH).',
        tips: 'Baja hasta paralelo o por debajo. Rodillas alineadas con los pies. Core activado durante todo el recorrido.',
      },
      {
        name: 'Press banca con barra',
        muscles: 'Pectoral mayor, deltoides anterior, tríceps',
        benefit: 'Principal movimiento de empuje horizontal. Desarrolla anchura y grosor de pecho, con alta transferencia a fuerza funcional.',
        tips: 'Escápulas retraídas y deprimidas. Baja la barra al pecho controlado. Agarre ligeramente más ancho que los hombros.',
      },
      {
        name: 'Remo con barra',
        muscles: 'Dorsal ancho, romboides, trapecios, bíceps',
        benefit: 'Contrarresta el press banca y equilibra el desarrollo anterior/posterior. Fundamental para una espalda gruesa y una postura correcta.',
        tips: 'Tronco a 45°. Lleva la barra al ombligo. Aprieta escápulas en la contracción.',
      },
      {
        name: 'Press militar mancuernas',
        muscles: 'Deltoides (cabeza anterior y media), tríceps, trapecios',
        benefit: 'Desarrolla hombros anchos y estables. Las mancuernas permiten mayor rango de movimiento y corrigen asimetrías entre lados.',
        tips: 'No bloquees codos al subir. Mantén la espalda baja neutra. Sube hasta casi extender sin hiperextender.',
      },
      {
        name: 'Curl bíceps barra',
        muscles: 'Bíceps braquial, braquial anterior, braquiorradial',
        benefit: 'Aislamiento directo del bíceps. Maximiza el pico de contracción y el desarrollo de la manga.',
        tips: 'Codos fijos a los costados. Sube controlado y baja lento (excéntrico). Evita balancear el tronco.',
      },
      {
        name: 'Face pull polea',
        muscles: 'Deltoides posterior, manguito rotador, romboides',
        benefit: 'Crucial para la salud del hombro. Refuerza los rotadores externos y previene lesiones derivadas del exceso de empuje horizontal.',
        tips: 'Polea alta. Tira hacia la frente separando manos al final. Mantén codos a la altura de los hombros.',
      },
      {
        name: 'Plancha abdominal',
        muscles: 'Core (transverso, oblicuos, recto abdominal), glúteos',
        benefit: 'Estabilidad espinal isométrica. Protege la columna en todos los demás ejercicios y mejora la transferencia de fuerza.',
        tips: 'Cuerpo recto de cabeza a talones. No eleves caderas ni dejes caer la pelvis. Respira normal.',
      },
    ],
  },
  {
    title: 'Día B — Fuerza posterior y empuje',
    color: 'border-blue-500',
    items: [
      {
        name: 'Peso muerto rumano',
        muscles: 'Isquiotibiales, glúteos, erector espinal, core',
        benefit: 'Ejercicio rey para la cadena posterior. Desarrolla isquios y glúteos con alta tensión excéntrica, mejora la postura y previene lesiones de rodilla.',
        tips: 'Mantén la barra pegada al cuerpo. Bisagra de cadera, no cuclillas. Espalda neutra en todo momento.',
      },
      {
        name: 'Jalón al pecho',
        muscles: 'Dorsal ancho, redondo mayor, bíceps, romboides',
        benefit: 'Alternativa de tracción vertical que desarrolla amplitud de espalda en forma de V. Accesible para todos los niveles.',
        tips: 'Agarre pronado algo más ancho que hombros. Tira hacia la clavícula. Mantén el pecho alto y escápulas deprimidas.',
      },
      {
        name: 'Press inclinado mancuernas',
        muscles: 'Pectoral mayor (clavicular), deltoides anterior, tríceps',
        benefit: 'Ataca la porción superior del pecho que el press plano no estimula suficientemente. Da volumen y definición a la zona alta del pectoral.',
        tips: 'Banco a 30-45°. Mancuernas con agarre neutro o pronado. Controla la bajada 2-3 segundos.',
      },
      {
        name: 'Hip thrust con barra',
        muscles: 'Glúteo mayor (90%), isquios, core',
        benefit: 'El ejercicio con mayor activación de glúteo mayor demostrada por EMG. Desarrolla potencia de cadera, rendimiento atlético y estética glútea.',
        tips: 'Espalda apoyada en banco a altura de omóplatos. Empuja con talones. Aprieta glúteos al llegar arriba.',
      },
      {
        name: 'Elevaciones laterales',
        muscles: 'Deltoides medial, supraespinoso',
        benefit: 'Único ejercicio que aísla la cabeza media del hombro, responsable de la anchura de hombros. Imprescindible para la apariencia en V.',
        tips: 'Ligera inclinación hacia adelante. Sube hasta altura de hombros. Controla la bajada, no dejes caer.',
      },
      {
        name: 'Extensión tríceps polea',
        muscles: 'Tríceps (cabeza larga, medial y lateral)',
        benefit: 'El tríceps supone 2/3 del volumen del brazo. Este ejercicio lo desarrolla con alta tensión en toda la cabeza larga.',
        tips: 'Codos fijos. Extiende completamente en cada rep. Prueba agarre neutro o con cuerda para mayor rango.',
      },
    ],
  },
  {
    title: 'Snack P. — Corrección diaria',
    color: 'border-green-500',
    items: [
      {
        name: 'Chin tucks',
        muscles: 'Flexores cervicales profundos, trapecio superior',
        benefit: 'Corrige la cabeza adelantada (postura de pantalla). Reactiva los músculos cervicales profundos inhibidos por el sedentarismo.',
        tips: 'Mentón hacia atrás sin bajar la cabeza. Como si hicieras doble barbilla. Aguanta 3 seg por rep.',
      },
      {
        name: '"W" con escápulas',
        muscles: 'Romboides, trapecio medio e inferior, deltoides posterior',
        benefit: 'Activa y fortalece los retractores escapulares. Contrarresta los hombros enrollados hacia delante típicos de quien pasa horas sentado.',
        tips: 'Brazos en forma de W en el aire. Aprieta fuerte las escápulas hacia la columna. 3 seg de contracción.',
      },
      {
        name: 'Estiramiento pectoral',
        muscles: 'Pectoral mayor y menor, deltoides anterior',
        benefit: 'Abre el pecho y libera la tensión acumulada por el trabajo de escritorio. Mejora la postura torácica y facilita la respiración profunda.',
        tips: 'Marco de puerta, brazo a 90°. Rota el torso hacia afuera lentamente. Sin forzar, mantén 15 seg cada lado.',
      },
    ],
  },
];

function WikiGuide() {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 pb-1">Toca un ejercicio para ver su descripción completa.</p>
      {wikiData.map((section, si) => (
        <div key={si} className={`bg-gray-900 rounded-2xl overflow-hidden border-l-4 ${section.color}`}>
          <button
            className="w-full px-4 py-3 flex items-center justify-between text-left"
            onClick={() => setOpenSection(openSection === si ? null : si)}
          >
            <span className="text-white font-bold text-sm">{section.title}</span>
            <span className="text-orange-400 text-lg">{openSection === si ? '−' : '+'}</span>
          </button>

          {openSection === si && (
            <div className="divide-y divide-gray-800">
              {section.items.map((item) => {
                const key = `${si}-${item.name}`;
                return (
                  <div key={key}>
                    <button
                      className="w-full px-4 py-3 flex items-center justify-between text-left"
                      onClick={() => setOpenItem(openItem === key ? null : key)}
                    >
                      <div>
                        <p className="text-white text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.muscles}</p>
                      </div>
                      <span className="text-gray-500 text-lg ml-2">{openItem === key ? '−' : '+'}</span>
                    </button>

                    {openItem === key && (
                      <div className="px-4 pb-4 space-y-2">
                        <div className="bg-gray-800 rounded-xl p-3">
                          <p className="text-xs text-orange-400 font-semibold mb-1">¿Qué aporta?</p>
                          <p className="text-xs text-gray-300 leading-relaxed">{item.benefit}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-3">
                          <p className="text-xs text-green-400 font-semibold mb-1">Claves técnicas</p>
                          <p className="text-xs text-gray-300 leading-relaxed">{item.tips}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
