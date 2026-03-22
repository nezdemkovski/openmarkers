import {
  pgTable,
  pgSchema,
  serial,
  text,
  doublePrecision,
  integer,
  uuid,
  timestamp,
  bigint,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

const neonAuthSchema = pgSchema("neon_auth");

export const neonAuthUser = neonAuthSchema.table("user", {
  id: uuid("id").primaryKey(),
  email: text("email"),
  name: text("name"),
});

export const profiles = pgTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    authUserId: uuid("auth_user_id")
      .notNull()
      .references(() => neonAuthUser.id, { onDelete: "cascade" }),
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
  authUserId: uuid("auth_user_id")
    .primaryKey()
    .references(() => neonAuthUser.id, { onDelete: "cascade" }),
  unitSystem: text("unit_system", { enum: ["si", "conventional"] })
    .notNull()
    .default("si"),
  plan: text("plan", { enum: ["free", "pro"] }).notNull().default("free"),
  extractCount: integer("extract_count").notNull().default(0),
  extractResetAt: timestamp("extract_reset_at"),
});

export const oauthClients = pgTable("oauth_clients", {
  clientId: text("client_id").primaryKey(),
  clientSecret: text("client_secret").notNull().default(""),
  redirectUris: text("redirect_uris").notNull().default("[]"),
  clientName: text("client_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const oauthAuthCodes = pgTable("oauth_auth_codes", {
  code: text("code").primaryKey(),
  clientId: text("client_id").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  codeChallenge: text("code_challenge").notNull(),
  neonSessionToken: text("neon_session_token").notNull(),
  neonSessionCookie: text("neon_session_cookie").notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
});

export const oauthRefreshTokens = pgTable("oauth_refresh_tokens", {
  token: text("token").primaryKey(),
  clientId: text("client_id").notNull(),
  neonSessionCookie: text("neon_session_cookie").notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
});
