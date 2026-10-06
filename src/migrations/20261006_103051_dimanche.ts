import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_creneaux_jour" ADD VALUE 'dimanche';
  ALTER TYPE "public"."enum_users_disponibilites_jour" ADD VALUE 'dimanche';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "creneaux" ALTER COLUMN "jour" SET DATA TYPE text;
  DROP TYPE "public"."enum_creneaux_jour";
  CREATE TYPE "public"."enum_creneaux_jour" AS ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi');
  ALTER TABLE "creneaux" ALTER COLUMN "jour" SET DATA TYPE "public"."enum_creneaux_jour" USING "jour"::"public"."enum_creneaux_jour";
  ALTER TABLE "users_disponibilites" ALTER COLUMN "jour" SET DATA TYPE text;
  DROP TYPE "public"."enum_users_disponibilites_jour";
  CREATE TYPE "public"."enum_users_disponibilites_jour" AS ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi');
  ALTER TABLE "users_disponibilites" ALTER COLUMN "jour" SET DATA TYPE "public"."enum_users_disponibilites_jour" USING "jour"::"public"."enum_users_disponibilites_jour";`)
}
