const bcrypt = require("bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const existing_users = await knex("users").first();
  if (existing_users) return;
  const users = await knex('users')
    .returning("id")
    .insert({
      email: "test@test.com", 
      username: "root", 
      hashed_password: await bcrypt.hash("root", 10)
    });
  await knex("permissions").del();
  const permissions = await knex('permissions')
    .returning("id")
    .insert([
      { code: "read_users" },
      { code: "write_users" }
    ]);
  await knex("user_permissions").del();
  await knex('user_permissions').insert([
    {
      user_id: users[0].id,
      permission_id: permissions[0].id
    },
    {
      user_id: users[0].id,
      permission_id: permissions[1].id
    }
  ]);
};
