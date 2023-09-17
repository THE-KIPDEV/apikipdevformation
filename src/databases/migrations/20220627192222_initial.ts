import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('users', table => {
    table.dateTime('created_at').nullable();
    table.dateTime('updated_at').nullable();
    table.integer('updated_by').nullable();
    table.integer('created_by').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('users', table => {
    table.dropColumn('created_at');
    table.dropColumn('updated_at');
    table.dropColumn('updated_by');
    table.dropColumn('created_by');
  });
}
