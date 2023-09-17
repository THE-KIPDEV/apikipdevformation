import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('medias', table => {
    table.json('format').notNullable();
    table.string('subtype').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('groups', table => {
    table.dropColumn('format');
    table.dropColumn('subtype');
  });
}
