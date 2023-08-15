// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "db/data/app.db",
    },
    pool: {
      afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb)
    },
    useNullAsDefault: true,
    migrations: {
      tableName: "migrations",
      directory: "db/migrations",
    },
    seeds: {
      directory: "db/seeds",
    },
  },

  production: {
    client: "sqlite3",
    connection: {
      filename: "db/data/app.db",
    },
    useNullAsDefault: true,
    migrations: {
      tableName: "migrations",
      directory: "db/migrations",
    },
  },

  onUpdateTrigger: (table) => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    BEGIN
      UPDATE ${table}
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END;
  `,
};
