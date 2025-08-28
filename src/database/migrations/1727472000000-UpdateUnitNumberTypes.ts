import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUnitNumberTypes1727472000000 implements MigrationInterface {
  name = 'UpdateUnitNumberTypes1727472000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update bathrooms to integer
    await queryRunner.query(`
      ALTER TABLE "unit" 
      ALTER COLUMN "bathrooms" TYPE integer USING (bathrooms::numeric::integer)
    `);

    // Update market_rent to numeric with proper type casting
    await queryRunner.query(`
      ALTER TABLE "unit" 
      ALTER COLUMN "market_rent" TYPE numeric(12,2) USING (market_rent::numeric)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert bathrooms back to numeric(3,1)
    await queryRunner.query(`
      ALTER TABLE "unit" 
      ALTER COLUMN "bathrooms" TYPE numeric(3,1) USING (bathrooms::numeric)
    `);

    // Revert market_rent back to string type
    await queryRunner.query(`
      ALTER TABLE "unit" 
      ALTER COLUMN "market_rent" TYPE varchar USING (market_rent::varchar)
    `);
  }
}
