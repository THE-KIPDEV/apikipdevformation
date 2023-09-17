import { IsString, IsBase64, IsIn, IsObject, IsArray } from 'class-validator';
const type = ['bars', 'groups', 'events'] as const;
const subtypes = ['images', 'documents'] as const;
const extensions = ['jpg', 'pdf', 'doc', 'docx'] as const;
export class CreateMediaDto {
  @IsString()
  public name: string;

  @IsString()
  @IsIn(type)
  public type: string;

  @IsArray()
  public format: Array<any>;

  @IsString()
  @IsIn(subtypes)
  public subtype: string;

  @IsString()
  @IsIn(extensions)
  public file_type: string;

  @IsString()
  public fileBase64: string;
}
