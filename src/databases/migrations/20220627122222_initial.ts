import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('users', table => {
    table.string('genre').notNullable();
    table.date('birthdate').notNullable();
    table.string('firstname').notNullable();
    table.string('lastname').notNullable();
    table.string('phone').notNullable();
    table.boolean('active').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('users', table => {
    table.dropColumn('genre');
    table.dropColumn('birthdate');
    table.dropColumn('firstname');
    table.dropColumn('lastname');
    table.dropColumn('phone');
    table.dropColumn('active');
  });
}
