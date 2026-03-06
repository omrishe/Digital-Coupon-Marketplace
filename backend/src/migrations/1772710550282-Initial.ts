import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1772710550282 implements MigrationInterface {
    name = 'Initial1772710550282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."products_value_type_enum" AS ENUM('STRING', 'IMAGE')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text NOT NULL, "image_url" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "cost_price" numeric(10,2), "margin_percentage" numeric(5,2), "minimum_sell_price" numeric(10,2), "value_type" "public"."products_value_type_enum" DEFAULT 'STRING', "value" text, "is_sold" boolean DEFAULT false, "type" character varying NOT NULL, CONSTRAINT "CHK_d168e9625f12ca7954eb24d725" CHECK ("margin_percentage" >= 0), CONSTRAINT "CHK_dd570e448092b53f3d0bf4ae15" CHECK ("cost_price" >= 0), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_231ecc6b4e201d7033a8dec3f2" ON "products" ("is_sold") `);
        await queryRunner.query(`CREATE INDEX "IDX_d5662d5ea5da62fc54b0f12a46" ON "products" ("type") `);
        await queryRunner.query(`CREATE TYPE "public"."purchases_channel_enum" AS ENUM('customer', 'reseller')`);
        await queryRunner.query(`CREATE TABLE "purchases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "channel" "public"."purchases_channel_enum" NOT NULL, "price" numeric(10,2) NOT NULL, "reseller_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1d55032f37a34c6eceacbbca6b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1ce91bd87ddfcecde930deeaab" ON "purchases" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_94055395bbd8eccc140f8cd7d7" ON "purchases" ("reseller_id") `);
        await queryRunner.query(`ALTER TABLE "purchases" ADD CONSTRAINT "FK_1ce91bd87ddfcecde930deeaab9" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchases" DROP CONSTRAINT "FK_1ce91bd87ddfcecde930deeaab9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_94055395bbd8eccc140f8cd7d7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1ce91bd87ddfcecde930deeaab"`);
        await queryRunner.query(`DROP TABLE "purchases"`);
        await queryRunner.query(`DROP TYPE "public"."purchases_channel_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d5662d5ea5da62fc54b0f12a46"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_231ecc6b4e201d7033a8dec3f2"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_value_type_enum"`);
    }

}
