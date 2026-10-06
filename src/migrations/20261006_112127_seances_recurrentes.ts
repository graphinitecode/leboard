import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_series_frequence" AS ENUM('hebdomadaire', 'mensuelle');
  CREATE TYPE "public"."enum_series_matiere" AS ENUM('maths', 'francais', 'anglais', 'autre');
  CREATE TABLE "series" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"frequence" "enum_series_frequence" NOT NULL,
  	"premiere" varchar NOT NULL,
  	"fin" varchar,
  	"heure_debut" varchar NOT NULL,
  	"duree" numeric NOT NULL,
  	"matiere" "enum_series_matiere" NOT NULL,
  	"prof_id" integer NOT NULL,
  	"genere_jusqua" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "series_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"eleves_id" integer
  );
  
  ALTER TABLE "seances" ADD COLUMN "serie_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "series_id" integer;
  ALTER TABLE "series" ADD CONSTRAINT "series_prof_id_users_id_fk" FOREIGN KEY ("prof_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series_rels" ADD CONSTRAINT "series_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "series_rels" ADD CONSTRAINT "series_rels_eleves_fk" FOREIGN KEY ("eleves_id") REFERENCES "public"."eleves"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "series_prof_idx" ON "series" USING btree ("prof_id");
  CREATE INDEX "series_updated_at_idx" ON "series" USING btree ("updated_at");
  CREATE INDEX "series_created_at_idx" ON "series" USING btree ("created_at");
  CREATE INDEX "series_rels_order_idx" ON "series_rels" USING btree ("order");
  CREATE INDEX "series_rels_parent_idx" ON "series_rels" USING btree ("parent_id");
  CREATE INDEX "series_rels_path_idx" ON "series_rels" USING btree ("path");
  CREATE INDEX "series_rels_eleves_id_idx" ON "series_rels" USING btree ("eleves_id");
  ALTER TABLE "seances" ADD CONSTRAINT "seances_serie_id_series_id_fk" FOREIGN KEY ("serie_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_series_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "seances_serie_idx" ON "seances" USING btree ("serie_id");
  CREATE INDEX "payload_locked_documents_rels_series_id_idx" ON "payload_locked_documents_rels" USING btree ("series_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "series" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "series_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "series" CASCADE;
  DROP TABLE "series_rels" CASCADE;
  ALTER TABLE "seances" DROP CONSTRAINT "seances_serie_id_series_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_series_fk";
  
  DROP INDEX "seances_serie_idx";
  DROP INDEX "payload_locked_documents_rels_series_id_idx";
  ALTER TABLE "seances" DROP COLUMN "serie_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "series_id";
  DROP TYPE "public"."enum_series_frequence";
  DROP TYPE "public"."enum_series_matiere";`)
}
