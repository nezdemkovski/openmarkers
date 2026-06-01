import {
  pgTable,
  serial,
  text,
  doublePrecision,
  integer,
  timestamp,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

export const profiles = pgTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    authUserId: text("auth_user_id").notNull(),
    name: text("name").notNull(),
    dateOfBirth: text("date_of_birth").notNull(),
    sex: text("sex", { enum: ["M", "F"] }).notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    isPublic: boolean("is_public").notNull().default(false),
    publicHandle: text("public_handle").unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [unique().on(t.authUserId, t.name)],
);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const biomarkers = pgTable("biomarkers", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  unit: text("unit"),
  refMinM: doublePrecision("ref_min_m"),
  refMaxM: doublePrecision("ref_max_m"),
  refMinF: doublePrecision("ref_min_f"),
  refMaxF: doublePrecision("ref_max_f"),
  type: text("type", { enum: ["quantitative", "qualitative"] })
    .notNull()
    .default("quantitative"),
  molecularWeight: doublePrecision("molecular_weight"),
  conventionalUnit: text("conventional_unit"),
  displayOrder: integer("display_order").notNull().default(0),
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
    refMin: doublePrecision("ref_min"),
    refMax: doublePrecision("ref_max"),
    unit: text("unit"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [unique().on(t.profileId, t.biomarkerId, t.date)],
);

export const userPreferences = pgTable("user_preferences", {
  authUserId: text("auth_user_id").primaryKey(),
  unitSystem: text("unit_system", { enum: ["si", "conventional"] })
    .notNull()
    .default("si"),
});
