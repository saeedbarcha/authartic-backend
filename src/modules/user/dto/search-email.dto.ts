import { IsEmail, IsNotEmpty,IsEnum } from 'class-validator';
import { UserRoleEnum } from '../enum/user.role.enum';

export class SearchEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}
