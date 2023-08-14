export const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "data/data.db"
  },
  pool: {
    afterCreate: (conn: any, cb: any) => conn.run('PRAGMA foreign_keys = ON', cb)
  },
  useNullAsDefault: true,
  migrations: {
    tableName: "migrations",
    directory: "data/migrations"
  }
});
