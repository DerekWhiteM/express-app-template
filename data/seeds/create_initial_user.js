const bcrypt = require("bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('users').del()
  await knex('users').insert({
    email: "test@test.com", 
    username: "root", 
    hashed_password: await bcrypt.hash("root", 10)
  });
};
