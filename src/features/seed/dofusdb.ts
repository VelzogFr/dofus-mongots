const BASE_URL = 'https://api.dofusdb.fr';
const GRADE_COUNT = 5;

interface RawGrade {
  grade: number;
  level: number;
  lifePoints: number;
  actionPoints: number;
  movementPoints: number;
}

interface RawDrop {
  objectId: number;
  [rate: `percentDropForGrade${number}`]: number;
}

export interface RawMonster {
  id: number;
  name: { fr: string };
  race: number;
  isBoss?: boolean;
  hideInBestiary?: boolean;
  img?: string;
  grades: RawGrade[];
  drops?: RawDrop[];
}

export interface MonsterInput {
  ankamaId: number;
  name: string;
  race: string | null;
  boss: boolean;
  image: string | null;
  grades: { grade: number; level: number; lifePoints: number; ap: number; mp: number }[];
  drops: { itemId: number; rates: number[] }[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`dofusdb ${res.status} on ${path}`);
  return (await res.json()) as T;
}

const raceNames = new Map<number, Promise<string | null>>();

export function fetchRaceName(id: number): Promise<string | null> {
  let name = raceNames.get(id);
  if (!name) {
    name = get<{ name?: { fr?: string } }>(`/monster-races/${id}?lang=fr`)
      .then((r) => r.name?.fr ?? null)
      .catch(() => null);
    raceNames.set(id, name);
  }
  return name;
}

const searchMonsters = (query: string) => get<{ data: RawMonster[] }>(`/monsters?${query}&$limit=10&lang=fr`).then((r) => r.data);

export async function findMonster(name: string): Promise<RawMonster | undefined> {
  const hits = await searchMonsters(`name.fr=${encodeURIComponent(name)}`);
  for (const m of hits) {
    if (m.hideInBestiary) continue;
    if (/invocation/i.test((await fetchRaceName(m.race)) ?? '')) continue;
    return m;
  }
  return hits[0];
}

export async function findMonstersDropping(itemId: number): Promise<RawMonster[]> {
  const hits = await searchMonsters(`drops.objectId=${itemId}`);
  return hits.filter((m) => !m.hideInBestiary);
}

export async function toMonster(raw: RawMonster, knownItemIds: ReadonlySet<number>): Promise<MonsterInput> {
  return {
    ankamaId: raw.id,
    name: raw.name.fr,
    race: await fetchRaceName(raw.race),
    boss: Boolean(raw.isBoss),
    image: raw.img ?? null,
    grades: raw.grades
      .filter((g) => g.grade <= GRADE_COUNT)
      .map((g) => ({ grade: g.grade, level: g.level, lifePoints: g.lifePoints, ap: g.actionPoints, mp: g.movementPoints })),
    drops: (raw.drops ?? [])
      .filter((d) => knownItemIds.has(d.objectId))
      .map((d) => ({
        itemId: d.objectId,
        rates: Array.from({ length: GRADE_COUNT }, (_, i) => Math.round((d[`percentDropForGrade${i + 1}`] ?? 0) * 100) / 100),
      })),
  };
}
