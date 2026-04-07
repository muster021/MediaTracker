import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('mediaItem', (table) => {
    table.text('watchProviders').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('mediaItem', (table) => {
    table.dropColumn('watchProviders');
  });
}
