import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('users', table => {
    table.string('role_name').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('users', table => {
    table.dropColumn('role_name');
  });
}
