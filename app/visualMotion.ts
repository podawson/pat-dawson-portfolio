export const CORPUS_MOTION = {
  navHoverIn: 180,
  navHoverOut: 240,
  navTransit: 420,
  selection: 1500,
  smoothMinRest: 10,
} as const;

export function corpusEase(amount: number) {
  const value = Math.max(0, Math.min(1, amount));
  return value * value * (3 - 2 * value);
}

export function corpusSmoothMin(a: number, b: number, blend: number) {
  if (blend <= 0) return Math.min(a, b);
  const amount = Math.max(0, Math.min(1, 0.5 + 0.5 * (b - a) / blend));
  return b * (1 - amount) + a * amount - blend * amount * (1 - amount);
}

export const CORPUS_SMOOTH_MIN_GLSL = `
  float corpusSmoothMin(float a, float b, float blend) {
    float amount = clamp(0.5 + 0.5 * (b - a) / blend, 0.0, 1.0);
    return mix(b, a, amount) - blend * amount * (1.0 - amount);
  }
`;
