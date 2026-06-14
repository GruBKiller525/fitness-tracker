type Props = {
  value: number;
  onChange: (v: number) => void;
};

const labels = ['', '😴 Muy bajo', '😕 Bajo', '😐 Normal', '💪 Bueno', '🔥 Excelente'];

export function EnergyPicker({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">Nivel de energía</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 py-3 rounded-lg text-lg font-bold transition-colors ${
              value === n
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {value > 0 && <p className="text-sm text-indigo-400 mt-1">{labels[value]}</p>}
    </div>
  );
}
