// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "data/data.db",
    },
    useNullAsDefault: true,
    migrations: {
      tableName: "migrations",
      directory: "data/migrations",
    },
    seeds: {
      directory: "data/seeds",
    },
  },

  production: {
    client: "sqlite3",
    connection: {
      filename: "data/data.db",
    },
    useNullAsDefault: true,
    migrations: {
      tableName: "migrations",
      directory: "data/migrations",
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
