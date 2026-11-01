export interface RawGrade {
  grade: number;
  level: number;
  lifePoints: number;
  actionPoints: number;
  movementPoints: number;
}

export interface RawDrop {
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
