export const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "data/data.db"
  },
  useNullAsDefault: true,
  migrations: {
    tableName: "migrations",
    directory: "data/migrations"
  }
});
