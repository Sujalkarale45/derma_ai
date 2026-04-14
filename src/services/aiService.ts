import type { SkinLesionClass } from '../types';

interface PredictionResult {
  class: SkinLesionClass;
  confidence: number;
  top3: Array<{ class: SkinLesionClass; prob: number }>;
}

const MOCK_PREDICTIONS: PredictionResult[] = [
  {
    class: 'nv',
    confidence: 0.87,
    top3: [
      { class: 'nv', prob: 0.87 },
      { class: 'bkl', prob: 0.08 },
      { class: 'mel', prob: 0.05 },
    ],
  },
  {
    class: 'mel',
    confidence: 0.62,
    top3: [
      { class: 'mel', prob: 0.62 },
      { class: 'nv', prob: 0.25 },
      { class: 'bkl', prob: 0.13 },
    ],
  },
  {
    class: 'bkl',
    confidence: 0.78,
    top3: [
      { class: 'bkl', prob: 0.78 },
      { class: 'nv', prob: 0.12 },
      { class: 'df', prob: 0.10 },
    ],
  },
];

/** Simulates network delay */
function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

/**
 * Calls the HuggingFace FastAPI backend or falls back to mock data.
 * @param imageBase64 - Base64 encoded image (without the data:image/... prefix)
 */
export async function predictSkinLesion(imageBase64: string): Promise<PredictionResult> {
  const apiUrl = import.meta.env.VITE_HF_API_URL;

  if (apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      return {
        class: data.predicted_class as SkinLesionClass,
        confidence: data.confidence,
        top3: (data.top3 || []).map((item: { class: string; prob: number }) => ({
          class: item.class as SkinLesionClass,
          prob: item.prob,
        })),
      };
    } catch (err) {
      console.warn('[aiService] API call failed, falling back to mock:', err);
    }
  }

  // Demo fallback: simulate realistic analysis time
  await sleep(2200);
  const randomPick = MOCK_PREDICTIONS[Math.floor(Math.random() * MOCK_PREDICTIONS.length)];
  // Add slight random noise to confidence for realism
  return {
    ...randomPick,
    confidence: Math.min(0.99, randomPick.confidence + (Math.random() * 0.06 - 0.03)),
  };
}
