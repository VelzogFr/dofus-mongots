export const PUBLIC_FIELDS = { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 } as const;

const MAX_SEARCH_LENGTH = 60;

export function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

export function optionalInt(value: unknown): number | undefined {
  const raw = firstString(value)?.trim();
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : undefined;
}

export function boundedInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = optionalInt(value);
  return n === undefined ? fallback : Math.min(max, Math.max(min, n));
}

export function optionalBool(value: unknown): boolean | undefined {
  const raw = firstString(value);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return undefined;
}

export function parseAnkamaId(value: string | undefined): number | null {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ACCENT_VARIANTS: Record<string, string> = {
  a: 'aàâä',
  c: 'cç',
  e: 'eéèêë',
  i: 'iîï',
  o: 'oôö',
  u: 'uùûü',
  y: 'yÿ',
};

const accentInsensitive = (s: string) =>
  escapeRegex(s.normalize('NFD').replace(/\p{M}/gu, '')).replace(/[aceiouy]/gi, (c) => `[${ACCENT_VARIANTS[c.toLowerCase()]}]`);

export function nameFilter(q: unknown): Record<string, unknown> {
  const term = firstString(q)?.trim().slice(0, MAX_SEARCH_LENGTH);
  return term ? { name: { $regex: accentInsensitive(term), $options: 'i' } } : {};
}

export function pagination(query: Record<string, unknown>, defaultLimit = 24) {
  const limit = boundedInt(query.limit, 1, 100, defaultLimit);
  const page = boundedInt(query.page, 1, 10_000, 1);
  return { page, limit, skip: (page - 1) * limit };
}

export function paged<T>(data: T[], total: number, { page, limit }: { page: number; limit: number }) {
  return { data, total, page, pages: Math.ceil(total / limit) };
}
