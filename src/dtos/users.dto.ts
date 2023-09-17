import { IsEmail, IsString, IsDate, IsBoolean, IsPhoneNumber, IsIn, Matches, IsOptional } from 'class-validator';
const roles = ['SUPER_ADMIN', 'USER'] as const;
const genres = ['Mr', 'Mlle', 'Mme'] as const;

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[~`¿¡!#$%\^&é*€£@+÷=\-\[\]\\';,/{}\(\)|\\":<>\?\.\_])[A-Za-z\d~`¿¡!#$%\^&é*€£@+÷=\-\[\]\\';,/{}\(\)|\\":<>\?\.\_]{8,}$/,
  )
  public password: string;

  @IsString()
  @IsOptional()
  public password_confirm: string;

  @IsString()
  @IsOptional()
  public old_password: string;

  @IsString()
  @IsIn(roles)
  public role_name: string;

  @IsString()
  @IsIn(genres)
  public genre: string;

  @IsString()
  @IsOptional()
  //@Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
  public birthdate: string;

  @IsString()
  public firstname: string;

  @IsString()
  public lastname: string;

  @IsString()
  public phone: string;

  @IsBoolean()
  @IsOptional()
  public active: boolean;
}
