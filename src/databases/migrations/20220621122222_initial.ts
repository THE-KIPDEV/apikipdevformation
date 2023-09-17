import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('medias', table => {
    table.bigIncrements('id').unsigned().primary();
    table.string('name', 255).notNullable();
    table.string('type', 255).notNullable();
    table.string('url').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('medias');
}
