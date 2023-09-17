export interface Media {
  id: number;
  name: string;
  type: string;
  url: string;
  format: Array<any>;
  subtype: string;
  extension: string;
  created_at: Date;
  updated_at: Date;
  updated_by: number;
  created_by: number;
}
