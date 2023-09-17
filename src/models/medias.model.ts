import { Model, ModelObject } from 'objection';
import { Media } from '@interfaces/medias.interface';

export class Medias extends Model implements Media {
  id!: number;
  name!: string;
  type!: string;
  url!: string;
  format!: Array<any>;
  subtype!: string;
  extension!: string;
  created_at!: Date;
  updated_at!: Date;
  updated_by!: number;
  created_by!: number;

  static tableName = 'medias'; // database table name
  static idColumn = 'id'; // id column name
}

export type MediasShape = ModelObject<Medias>;
