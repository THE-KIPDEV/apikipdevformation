import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('medias', table => {
    table.json('extension').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('groups', table => {
    table.dropColumn('extension');
  });
}
