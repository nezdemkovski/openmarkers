CREATE TABLE "biomarkers" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"unit" text,
	"ref_min_m" double precision,
	"ref_max_m" double precision,
	"ref_min_f" double precision,
	"ref_max_f" double precision,
	"type" text DEFAULT 'quantitative' NOT NULL,
	"molecular_weight" double precision,
	"conventional_unit" text,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth_user_id" text NOT NULL,
	"name" text NOT NULL,
	"date_of_birth" text NOT NULL,
	"sex" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"public_handle" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_public_handle_unique" UNIQUE("public_handle"),
	CONSTRAINT "profiles_auth_user_id_name_unique" UNIQUE("auth_user_id","name")
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"biomarker_id" text NOT NULL,
	"date" text NOT NULL,
	"value" text NOT NULL,
	"ref_min" double precision,
	"ref_max" double precision,
	"unit" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "results_profile_id_biomarker_id_date_unique" UNIQUE("profile_id","biomarker_id","date")
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"auth_user_id" text PRIMARY KEY NOT NULL,
	"unit_system" text DEFAULT 'si' NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"extract_count" integer DEFAULT 0 NOT NULL,
	"extract_reset_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "biomarkers" ADD CONSTRAINT "biomarkers_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_biomarker_id_biomarkers_id_fk" FOREIGN KEY ("biomarker_id") REFERENCES "public"."biomarkers"("id") ON DELETE no action ON UPDATE no action;
