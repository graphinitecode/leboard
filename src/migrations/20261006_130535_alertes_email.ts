import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "alertes" ADD COLUMN "notifie_le" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "alertes_email" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "alertes" DROP COLUMN "notifie_le";
  ALTER TABLE "users" DROP COLUMN "alertes_email";`)
}
