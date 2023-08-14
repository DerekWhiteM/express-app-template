const { onUpdateTrigger } = require("../../knexfile.js");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("user_permissions", table => {
      table.increments("id");

      table.integer("user_id").references("id").inTable("users").onDelete("cascade");

      table.integer("permission_id").references("id").inTable("permissions").onDelete("cascade");

      table.unique(["user_id", "permission_id"]);

      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    })
    .raw(onUpdateTrigger("user_permissions"));
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("user_permissions");
};
