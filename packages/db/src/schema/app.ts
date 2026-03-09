import {
  pgTable,
  pgSchema,
  serial,
  text,
  doublePrecision,
  integer,
  uuid,
  timestamp,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

// Reference to Neon Auth's managed schema (we don't define these tables, just reference them)
const neonAuthSchema = pgSchema("neon_auth");

export const neonAuthUser = neonAuthSchema.table("user", {
  id: uuid("id").primaryKey(),
  email: text("email"),
  name: text("name"),
});

// ---- Application tables ----

export const profiles = pgTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    authUserId: uuid("auth_user_id")
      .notNull()
      .references(() => neonAuthUser.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    dateOfBirth: text("date_of_birth").notNull(),
    sex: text("sex").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [unique().on(t.authUserId, t.name)],
);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
});

export const biomarkers = pgTable("biomarkers", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  unit: text("unit"),
  refMin: doublePrecision("ref_min"),
  refMax: doublePrecision("ref_max"),
  type: text("type").notNull().default("quantitative"),
});

export const results = pgTable(
  "results",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    biomarkerId: text("biomarker_id")
      .notNull()
      .references(() => biomarkers.id),
    date: text("date").notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [unique().on(t.profileId, t.biomarkerId, t.date)],
);

export const profileBiomarkers = pgTable(
  "profile_biomarkers",
  {
    profileId: integer("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    biomarkerId: text("biomarker_id")
      .notNull()
      .references(() => biomarkers.id),
    unit: text("unit"),
    refMin: doublePrecision("ref_min"),
    refMax: doublePrecision("ref_max"),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.biomarkerId] })],
);
