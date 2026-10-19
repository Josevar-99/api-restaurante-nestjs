import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1791930327474 implements MigrationInterface {
  name = 'InitialSchema1791930327474';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tables" ("id" uuid NOT NULL, "tableNumber" integer NOT NULL, "capacity" integer NOT NULL, "zone" character varying(20) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'AVAILABLE', CONSTRAINT "UQ_eaa9451297a2492ecdbae3d2ffb" UNIQUE ("tableNumber"), CONSTRAINT "PK_7cf2aca7af9550742f855d4eb69" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reservations" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "customerName" character varying(150) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(150) NOT NULL, "date" date NOT NULL, "time" TIME NOT NULL, "durationMinutes" integer NOT NULL DEFAULT '120', "guests" integer NOT NULL, "tableId" integer NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "cancelledAt" TIMESTAMP WITH TIME ZONE, "confirmedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_reservations_date" ON "reservations"  ("date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_reservations_table_date" ON "reservations"  ("tableId", "date") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."categories_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(100) NOT NULL, "description" text NOT NULL, "status" "public"."categories_status_enum" NOT NULL DEFAULT 'ACTIVE', CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON "categories"  ("name") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_availability_enum" AS ENUM('AVAILABLE', 'UNAVAILABLE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(150) NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "category_id" uuid NOT NULL, "availability" "public"."products_availability_enum" NOT NULL DEFAULT 'AVAILABLE', "status" "public"."products_status_enum" NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_42ee40914a466cb26141c81e878" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_42ee40914a466cb26141c81e878"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."products_availability_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8b0be371d28245da6e4f4b6187"`,
    );
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TYPE "public"."categories_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_reservations_table_date"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_reservations_date"`);
    await queryRunner.query(`DROP TABLE "reservations"`);
    await queryRunner.query(`DROP TABLE "tables"`);
  }
}
