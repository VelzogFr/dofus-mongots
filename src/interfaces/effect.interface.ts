export interface RawEffect {
  int_minimum: number;
  int_maximum: number;
  type?: { name?: string };
  formatted: string;
}

export interface EffectInput {
  label: string;
  min: number;
  max: number | null;
  text: string;
}
