import { Schema, model, type InferSchemaType } from 'mongoose';

const GRADE_COUNT = 5;

const gradeSchema = new Schema(
  {
    grade: { type: Number, required: true, min: 1, max: GRADE_COUNT },
    level: { type: Number, required: true, min: 1 },
    lifePoints: { type: Number, required: true, min: 0 },
    ap: { type: Number, required: true, min: 0 },
    mp: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const dropSchema = new Schema(
  {
    // Reference vers items.ankamaId
    itemId: { type: Number, required: true },
    // Taux de drop de base en %, un par grade
    rates: {
      type: [Number],
      required: true,
      validate: {
        validator: (rates: number[]) => rates.length === GRADE_COUNT,
        message: `rates must contain ${GRADE_COUNT} values`,
      },
    },
  },
  { _id: false },
);

const monsterSchema = new Schema(
  {
    ankamaId: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    race: { type: String, default: null },
    boss: { type: Boolean, default: false },
    image: { type: String, default: null },
    grades: { type: [gradeSchema], default: [] },
    drops: { type: [dropSchema], default: [] },
  },
  { collection: 'monsters', timestamps: true },
);

monsterSchema.index({ 'drops.itemId': 1 });
monsterSchema.index({ race: 1 });
monsterSchema.index({ name: 'text' }, { default_language: 'french' });

export type MonsterData = InferSchemaType<typeof monsterSchema>;
export const Monster = model('Monster', monsterSchema);
