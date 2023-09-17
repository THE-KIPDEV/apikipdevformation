import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('users', table => {
    table.string('forget_password_token').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('users', table => {
    table.dropColumn('forget_password_token');
  });
}
