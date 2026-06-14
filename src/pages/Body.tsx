import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { generateId, today, formatDate } from '../lib/utils';
import type { BodyMeasurement } from '../db/types';
import { PageShell } from '../components/PageShell';

const fields: { key: keyof BodyMeasurement; label: string }[] = [
  { key: 'weight', label: 'Peso (kg) *' },
  { key: 'neck', label: 'Cuello (cm)' },
  { key: 'shoulders', label: 'Hombros (cm)' },
  { key: 'chest', label: 'Pecho (cm)' },
  { key: 'waist', label: 'Cintura (cm)' },
  { key: 'hips', label: 'Caderas (cm)' },
  { key: 'armRelaxed', label: 'Brazo relajado (cm)' },
  { key: 'armFlexed', label: 'Brazo flexionado (cm)' },
  { key: 'forearm', label: 'Antebrazo (cm)' },
  { key: 'thigh', label: 'Muslo (cm)' },
  { key: 'calf', label: 'Pantorrilla (cm)' },
];

export function Body() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Record<keyof BodyMeasurement, string>>>({});

  const measurements = useLiveQuery(() => db.measurements.orderBy('date').reverse().toArray());
  const lastMeasurement = measurements?.[0];
  const daysSince = lastMeasurement
    ? Math.floor((Date.now() - new Date(lastMeasurement.date).getTime()) / 86400000)
    : null;

  async function save() {
    const w = parseFloat(form.weight ?? '');
    if (isNaN(w) || w <= 0) return;

    const record: BodyMeasurement = { id: generateId(), date: today(), weight: w };
    for (const { key } of fields) {
      if (key === 'weight' || key === 'id' || key === 'date' || key === 'notes') continue;
      const v = parseFloat(form[key] ?? '');
      if (!isNaN(v) && v > 0) (record as Record<string, unknown>)[key] = v;
    }
    if (form.notes) record.notes = form.notes;

    await db.measurements.put(record);
    setForm({});
    setShowForm(false);
  }

  return (
    <PageShell title="Mediciones corporales">
      {daysSince !== null && daysSince > 30 && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-2xl p-4 mb-4">
          <p className="text-yellow-400 text-sm">
            Han pasado {daysSince} días desde tu última medición. ¡Hora de actualizar!
          </p>
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-4 bg-orange-600 rounded-2xl text-white font-semibold mb-4 active:bg-indigo-700"
      >
        + Nueva medición
      </button>

      {showForm && (
        <div className="bg-gray-900 rounded-2xl p-4 mb-4 space-y-3">
          <p className="font-semibold text-white">Nueva medición — {formatDate(today())}</p>
          {fields.map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-gray-400 mb-1 block">{label}</label>
              <input
                type="number"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={form[key] ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <textarea
            placeholder="Notas (opcional)"
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
          />
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 py-3 bg-orange-600 rounded-xl text-white font-semibold active:bg-indigo-700">
              Guardar
            </button>
            <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-gray-700 rounded-xl text-white active:bg-gray-600">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {measurements?.map((m) => (
          <div key={m.id} className="bg-gray-900 rounded-2xl p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-white">{formatDate(m.date)}</p>
              <p className="text-2xl font-bold text-indigo-400">{m.weight} kg</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {fields.filter(({ key }) => key !== 'weight').map(({ key, label }) => {
                const val = (m as Record<string, unknown>)[key];
                if (!val) return null;
                return (
                  <p key={key} className="text-sm text-gray-400">
                    <span className="text-gray-500">{label.replace(' (cm)', '')}:</span>{' '}
                    <span className="text-white">{String(val)} cm</span>
                  </p>
                );
              })}
            </div>
            {m.notes && <p className="text-sm text-gray-400 mt-2 italic">{m.notes}</p>}
          </div>
        ))}
        {measurements?.length === 0 && (
          <p className="text-gray-500 text-center py-8">Sin mediciones registradas</p>
        )}
      </div>
    </PageShell>
  );
}
