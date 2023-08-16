import { knex } from "../utils/db";
import { random_string } from "../utils/utils";

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

  static async find_by_email(email: string): Promise<User | null> {
    const row = await knex
      .select([...this.columns])
      .from(this.table)
      .where("email", email)
      .first();
    return row ? new User(row) : null;
  }

  static async find_password_by_id(
    id: number | string
  ): Promise<string | null> {
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

  static async get_permissions(): Promise<{ id: number; code: string }[]> {
    const rows = await knex("permissions").returning(["id", "code"]);
    return rows;
  }

  async get_permissions(): Promise<
    { id: number; permission_id: number; code: string }[]
  > {
    const rows = await knex("user_permissions")
      .returning(["id", "permission_id", "code"])
      .innerJoin(
        "permissions",
        "user_permissions.permission_id",
        "=",
        "permissions.id"
      )
      .where({ user_id: this.id });
    return rows;
  }

  async grant_permission(code: string) {
    const permission = await knex("permissions")
      .returning("id")
      .where({ code })
      .first();
    return await knex("user_permissions").insert({
      user_id: this.id,
      permission_id: permission.id,
    });
  }

  async revoke_permission(code: string) {
    const permission = await knex("permissions")
      .returning("id")
      .where({ code })
      .first();
    return await knex("user_permissions")
      .where({ user_id: this.id, permission_id: permission.id })
      .del();
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

  async check_permission(code: string): Promise<boolean> {
    const permission = await knex("permissions")
      .returning(["id", "code"])
      .where({ code })
      .first();
    const row = await knex("user_permissions")
      .returning("id")
      .where({
        user_id: this.id,
        permission_id: permission.id,
      })
      .first();
    return row?.id ? true : false;
  }

  async generate_reset_token() {
    const value = random_string(8);
    await knex("reset_tokens")
      .returning(["id", "token", "user_id", "expires_at"])
      .insert({
        token: value,
        user_id: this.id,
      });
    return value;
  }
}
