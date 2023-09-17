import { Model, ModelObject } from 'objection';
import { User } from '@interfaces/users.interface';

export class Users extends Model implements User {
  id!: number;
  email!: string;
  password!: string;
  role_name!: string;
  genre!: string;
  birthdate!: string;
  firstname!: string;
  lastname!: string;
  phone!: string;
  active!: boolean;
  last_connect!: Date;
  created_at!: Date;
  updated_at!: Date;
  updated_by!: number;
  created_by!: number;
  forget_password_token!: string | null;
  token!: string | null;
  static tableName = 'users'; // database table name
  static idColumn = 'id'; // id column name
}

export type UsersShape = ModelObject<Users>;
