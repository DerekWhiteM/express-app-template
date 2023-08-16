/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("reset_tokens", table => {
      table.increments("id");
      table.string("token", 8).unique().notNullable();
      table.integer("user_id").notNullable().references("id").inTable("users").onDelete("cascade");
      table.timestamp("expires_at").notNullable().defaultTo(knex.raw("(datetime('now', '+1 day'))"));
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("reset_tokens");
};
