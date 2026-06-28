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
    title: 'Estiramientos — Corrección diaria',
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
  {
    title: 'Movilidad mañana — Activación',
    color: 'border-yellow-500',
    items: [
      { name: 'Rotaciones de cuello', muscles: 'Cervicales, trapecio superior', benefit: 'Libera la tensión acumulada durante el sueño y activa la circulación en la zona cervical.', tips: 'Movimientos lentos y controlados. 5 círculos en cada dirección sin forzar el rango.' },
      { name: 'Círculos de hombros', muscles: 'Deltoides, trapecio, manguito rotador', benefit: 'Lubrica la articulación glenohumeral y activa los músculos estabilizadores del hombro.', tips: 'Círculos amplios hacia delante y hacia atrás. Mantén el cuello relajado.' },
      { name: 'Rotación de cadera', muscles: 'Psoas, glúteos, rotadores externos de cadera', benefit: 'Moviliza la articulación coxofemoral y despierta la musculatura del core y cadera.', tips: 'Pies separados al ancho de hombros. Círculos amplios en ambos sentidos.' },
      { name: 'Flexión lateral de tronco', muscles: 'Oblicuos, cuadrado lumbar, intercostales', benefit: 'Estira la cadena lateral del tronco y mejora la movilidad torácica lateral.', tips: 'Brazo contrario en alto. Inclínate lateralmente sin rotar el tronco. Alterna lados.' },
      { name: 'Sentadilla profunda con pausa', muscles: 'Cuádriceps, glúteos, isquios, tobillo', benefit: 'Desarrolla movilidad de tobillo, cadera y columna torácica simultáneamente. Patrón de movimiento fundamental.', tips: 'Talones en el suelo. Baja despacio, aguanta 2 seg en el fondo y sube controlado.' },
      { name: 'Estiramiento de cuádriceps', muscles: 'Cuádriceps, psoas (parcial)', benefit: 'Contrarresta el acortamiento del cuádriceps por estar sentado y mejora la extensión de rodilla.', tips: 'De pie, sujeta el pie por detrás. Rodilla apuntando al suelo. Alterna piernas.' },
      { name: 'Apertura de cadera (paloma)', muscles: 'Glúteo, piriforme, rotadores externos de cadera', benefit: 'Abre la cadera en rotación externa. Muy eficaz para aliviar tensión lumbar y glútea.', tips: 'Una pierna doblada al frente, la otra estirada atrás. Mantén la cadera nivelada.' },
      { name: 'Estiramiento de isquiotibiales', muscles: 'Isquiotibiales, nervio ciático (movilización)', benefit: 'Mejora la flexión de cadera y reduce el riesgo de lesiones en la cadena posterior.', tips: 'Sentado, piernas estiradas. Inclínate desde la cadera (no redondees la espalda).' },
      { name: 'Gato-vaca', muscles: 'Erector espinal, multífidos, recto abdominal', benefit: 'Moviliza toda la columna en flexión y extensión. Activa la propiocepción espinal.', tips: 'A cuatro patas. Inhala al arquear (vaca), exhala al redondear (gato). Lento y fluido.' },
      { name: 'Respiración profunda', muscles: 'Diafragma, intercostales, core profundo', benefit: 'Activa el sistema nervioso parasimpático, mejora la oxigenación y prepara el cuerpo para el día.', tips: 'Inhala 4 seg, mantén 4, exhala 4. Deja que el vientre se expanda al inhalar.' },
    ],
  },
  {
    title: 'Estiramientos noche — Recuperación',
    color: 'border-purple-500',
    items: [
      { name: 'Estiramiento de pecho en pared', muscles: 'Pectoral mayor y menor, deltoides anterior', benefit: 'Abre el pecho tras un día de trabajo o entreno. Contrarresta la postura encorvada.', tips: 'Brazo apoyado en pared a 90°. Gira el cuerpo hacia el lado contrario. Aguanta y alterna.' },
      { name: 'Estiramiento de dorsales', muscles: 'Dorsal ancho, redondo mayor', benefit: 'Libera la tensión del dorsal tras ejercicios de tirón y mejora la movilidad torácica.', tips: 'Agarra un soporte fijo. Deja caer el peso del cuerpo hacia atrás. Rodillas ligeramente flexionadas.' },
      { name: 'Estiramiento de psoas', muscles: 'Psoas ilíaco, recto femoral', benefit: 'Contrarresta el acortamiento por sedentarismo. Clave para la salud lumbar y la postura.', tips: 'Zancada profunda, rodilla trasera en el suelo. Empuja la cadera hacia delante. Mantén erguido.' },
      { name: 'Mariposa (ingles)', muscles: 'Aductores, gracilis, pectíneo', benefit: 'Mejora la movilidad en abducción de cadera. Reduce rigidez de ingles y mejora la sentadilla.', tips: 'Sentado, plantas de los pies juntas. Presiona suavemente las rodillas hacia el suelo.' },
      { name: 'Estiramiento piriforme', muscles: 'Piriforme, rotadores externos de cadera', benefit: 'Alivia la compresión del nervio ciático. Muy útil si hay molestias en glúteo o zona lumbar.', tips: 'Tumbado boca arriba. Cruza un tobillo sobre la rodilla contraria y jala la pierna hacia ti.' },
      { name: 'Estiramiento de columna (torsión)', muscles: 'Rotadores espinales, cuadrado lumbar, piriforme', benefit: 'Descomprime las vértebras lumbares y mejora la rotación torácica. Reduce la tensión lumbar.', tips: 'Tumbado, lleva una rodilla al pecho y gírala al lado contrario. Mira hacia el lado opuesto.' },
      { name: 'Postura del niño', muscles: 'Dorsal, glúteos, lumbares, hombros', benefit: 'Posición de descanso activo. Estira la cadena posterior completa y reduce la presión espinal.', tips: 'Arrodillado, siéntate sobre talones y estira los brazos al frente. Frente al suelo.' },
      { name: 'Estiramiento de gemelos', muscles: 'Gastrocnemio, sóleo, fascia plantar', benefit: 'Previene contracturas de gemelo y fascitis plantar. Especialmente importante tras actividad de pie.', tips: 'Manos en pared, pierna trasera estirada con talón en el suelo. Aguanta y alterna.' },
      { name: 'Estiramiento cervical lateral', muscles: 'Trapecio superior, elevador de la escápula, ECM', benefit: 'Libera la tensión cervical acumulada por estrés, pantallas o mala postura.', tips: 'Inclina la cabeza lateralmente. Puedes ayudarte con la mano homolateral. Sin tirar bruscamente.' },
      { name: 'Respiración 4-7-8', muscles: 'Diafragma, sistema nervioso parasimpático', benefit: 'Reduce el cortisol nocturno, desacelera el ritmo cardíaco y prepara el cuerpo para dormir.', tips: 'Inhala 4 seg, mantén 7 seg, exhala 8 seg. Repite 3-4 veces.' },
    ],
  },
  {
    title: 'Post-entreno — Recuperación activa',
    color: 'border-red-500',
    items: [
      { name: 'Estiramiento de cuádriceps de pie', muscles: 'Cuádriceps, recto femoral', benefit: 'Acelera la recuperación del cuádriceps tras sentadillas o prensas. Reduce el DOMS.', tips: 'De pie, dobla la rodilla y agarra el pie por detrás. Mantén el equilibrio y alterna.' },
      { name: 'Estiramiento de isquiotibiales en suelo', muscles: 'Isquiotibiales, nervio ciático', benefit: 'Reduce la tensión posterior tras peso muerto y sentadilla. Mejora la flexibilidad de cadera.', tips: 'Tumbado boca arriba, lleva una pierna estirada hacia el pecho. Alterna lados.' },
      { name: 'Estiramiento de glúteo (figura 4)', muscles: 'Glúteo mayor, piriforme, rotadores externos', benefit: 'Alivia la tensión glútea tras hip thrust o sentadilla. Previene compresión del nervio ciático.', tips: 'Tumbado, cruza un tobillo sobre la rodilla contraria y jala la pierna hacia ti.' },
      { name: 'Estiramiento de pecho con manos unidas', muscles: 'Pectoral mayor, deltoides anterior, bíceps', benefit: 'Abre el pecho tras press banca. Restaura la postura y reduce la tensión anterior del hombro.', tips: 'Une las manos detrás de la espalda, saca pecho y sube los brazos suavemente.' },
      { name: 'Estiramiento de bíceps en pared', muscles: 'Bíceps braquial, braquial anterior', benefit: 'Estira el bíceps tras curls y jalones. Previene el acortamiento que limita la extensión de codo.', tips: 'Apoya la palma en la pared con el pulgar arriba. Gira el cuerpo hacia afuera lentamente.' },
      { name: 'Estiramiento de tríceps sobre cabeza', muscles: 'Tríceps (cabeza larga)', benefit: 'Recupera el tríceps tras press y extensiones. La cabeza larga necesita estiramiento con codo flexionado sobre la cabeza.', tips: 'Lleva un codo hacia atrás sobre la cabeza. Empuja suavemente con la otra mano.' },
      { name: 'Estiramiento de dorsales (arco de gato)', muscles: 'Dorsal ancho, redondo mayor, lumbares', benefit: 'Libera la tensión del dorsal tras jalones y remos. Descomprime la columna lumbar.', tips: 'A cuatro patas, lleva los glúteos hacia los talones y estira los brazos al frente.' },
      { name: 'Estiramiento de gemelos en escalón', muscles: 'Gastrocnemio, sóleo', benefit: 'Mayor rango que el estiramiento en pared. Muy eficaz para recuperar el tren inferior.', tips: 'Punta del pie en escalón, deja caer el talón. Rodilla estirada para gastrocnemio, flexionada para sóleo.' },
      { name: 'Torsión espinal sentado', muscles: 'Rotadores torácicos, cuadrado lumbar, piriforme', benefit: 'Descomprime las vértebras tras cargas axiales (sentadilla, peso muerto). Reduce la rigidez espinal.', tips: 'Sentado, cruza una pierna y gira el tronco hacia ese lado apoyando el codo en la rodilla.' },
      { name: 'Respiración de recuperación', muscles: 'Diafragma, sistema nervioso parasimpático', benefit: 'Activa el sistema nervioso parasimpático para acelerar la recuperación post-esfuerzo.', tips: 'Tumbado boca arriba. Respira llenando el vientre. Relaja completamente cada músculo al exhalar.' },
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
