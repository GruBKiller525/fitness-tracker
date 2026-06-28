import { useState } from 'react';
import { PageShell } from '../components/PageShell';

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

export function Guide() {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <PageShell title="Guía de ejercicios">
      <p className="text-xs text-gray-500 mb-3">Toca un ejercicio para ver su descripción completa.</p>
      <div className="space-y-3">
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
    </PageShell>
  );
}
