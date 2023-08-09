import { knex } from "../db";

interface UserData {
  id: number;
  username: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

interface UserCreateInput {
  username: string;
  email: string;
  hashed_password: string;
}

interface UserUpdateInput {
  username?: string;
  email?: string;
}

export class User implements UserData {
  id: number;
  username: string;
  email: string;
  created_at: Date;
  updated_at: Date;

  static table = "users";
  static columns = ["id", "username", "email", "created_at", "updated_at"];

  constructor(data: UserData) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(data: UserCreateInput): Promise<User> {
    const rows = await knex(this.table).returning(this.columns).insert(data);
    return new User(rows[0]);
  }

  static async find_all(): Promise<User[]> {
    const rows = await knex.select([...this.columns]).from(this.table);
    return rows.map((row: UserData) => new User(row));
  }

  static async find_by_id(id: number | string): Promise<User | null> {
    const row = await knex
      .select([...this.columns])
      .from(this.table)
      .where("id", Number(id))
      .first();
    return row ? new User(row) : null;
  }

  static async find_by_username(username: string): Promise<User | null> {
    const row = await knex
      .select([...this.columns])
      .from(this.table)
      .where("username", username)
      .first();
    return row ? new User(row) : null;
  }

  static async find_password_by_id(id: number | string): Promise<string | null> {
    const row = await knex
      .select("hashed_password")
      .from(this.table)
      .where("id", Number(id))
      .first();
    return row ? row.hashed_password : null;
  }

  static async find_password_by_username(
    username: string
  ): Promise<string | null> {
    const row = await knex
      .select("hashed_password")
      .from(this.table)
      .where("username", username)
      .first();
    return row ? row.hashed_password : null;
  }

  async update(data: UserUpdateInput) {
    const rows = await knex(User.table)
      .returning(User.columns)
      .where({ id: this.id })
      .update(data);
    return new User(rows[0]);
  }

  async delete() {
    const num_deleted = await knex(User.table).where({ id: this.id }).del();
    return num_deleted;
  }

  async change_password(hashed_password: string) {
    await knex(User.table)
      .returning(User.columns)
      .where({ id: this.id })
      .update({ hashed_password });
  }
}
