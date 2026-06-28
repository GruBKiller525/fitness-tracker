import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, databaseId, payload } = req.body as {
    token: string;
    databaseId: string;
    payload: NotionPayload;
  };

  if (!token || !databaseId || !payload) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(buildNotionPage(databaseId, payload)),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message ?? 'Error de Notion' });
    }

    return res.status(200).json({ url: (data as { url?: string }).url });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}

type SetSummary = {
  exerciseName: string;
  sets: { weight: number; reps: number; rir: number }[];
  bestE1rm: number;
};

type NotionPayload = {
  sessionDate: string;
  routineName: string;
  durationMinutes?: number;
  energy: number;
  sleepHours: number;
  totalVolume: number;
  completedSets: number;
  targetSets: number;
  bodyweight?: number;
  exercises: SetSummary[];
  notes?: string;
};

function buildNotionPage(databaseId: string, p: NotionPayload) {
  const exerciseBlocks = p.exercises.flatMap((ex) => [
    {
      object: 'block',
      type: 'heading_3',
      heading_3: {
        rich_text: [{ type: 'text', text: { content: ex.exerciseName } }],
      },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: ex.sets
                .map((s, i) => `Serie ${i + 1}: ${s.weight}kg × ${s.reps} reps · RIR ${s.rir}`)
                .join('\n'),
            },
          },
        ],
      },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: `e1RM estimado: ${ex.bestE1rm} kg` },
            annotations: { italic: true, color: 'gray' },
          },
        ],
      },
    },
  ]);

  return {
    parent: { database_id: databaseId },
    properties: {
      Nombre: {
        title: [{ text: { content: `${p.routineName} — ${p.sessionDate}` } }],
      },
      Fecha: {
        date: { start: p.sessionDate },
      },
      Rutina: {
        rich_text: [{ text: { content: p.routineName } }],
      },
      'Series completadas': {
        number: p.completedSets,
      },
      ...(p.durationMinutes !== undefined && {
        'Duración (min)': { number: p.durationMinutes },
      }),
      ...(p.notes !== undefined && {
        Notas: { rich_text: [{ text: { content: p.notes } }] },
      }),
    },
    children: [
      {
        object: 'block',
        type: 'callout',
        callout: {
          icon: { emoji: '💪' },
          rich_text: [
            {
              type: 'text',
              text: {
                content: `${p.completedSets}/${p.targetSets} series · ${p.totalVolume.toFixed(0)} kg volumen total${p.durationMinutes ? ` · ${p.durationMinutes} min` : ''}`,
              },
            },
          ],
        },
      },
      ...exerciseBlocks,
      ...(p.notes
        ? [
            {
              object: 'block',
              type: 'quote',
              quote: {
                rich_text: [{ type: 'text', text: { content: p.notes } }],
              },
            },
          ]
        : []),
    ],
  };
}
