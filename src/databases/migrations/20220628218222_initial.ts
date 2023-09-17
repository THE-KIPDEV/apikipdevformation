import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('medias', table => {
    table.dropColumn('extension');
    table.string('file_type').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('groups', table => {
    table.dropColumn('file_type');
  });
}
