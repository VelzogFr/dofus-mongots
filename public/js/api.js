// Client de l'API Express (/api/*)
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function api(path, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  }
  const qs = query.toString();
  const res = await fetch(`/api${path}${qs ? `?${qs}` : ''}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? `HTTP ${res.status}`);
  return body;
}

const MAX_IDS = 100; // limite de /api/items?ids=

// Recupere plusieurs objets par ankamaId (par paquets de 100), renvoie une Map
export async function itemsById(ids) {
  const unique = [...new Set(ids)];
  const chunks = [];
  for (let i = 0; i < unique.length; i += MAX_IDS) chunks.push(unique.slice(i, i + MAX_IDS));
  const pages = await Promise.all(chunks.map((chunk) => api('/items', { ids: chunk.join(','), limit: chunk.length })));
  return new Map(pages.flatMap((p) => p.data).map((item) => [item.ankamaId, item]));
}
