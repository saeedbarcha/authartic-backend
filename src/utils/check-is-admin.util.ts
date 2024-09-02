// src/common/role-check.util.ts
import { ForbiddenException } from '@nestjs/common';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';
import { User } from 'src/modules/user/entities/user.entity';

export function checkIsAdmin(user: User, message: string = 'Only Admin can perform this action.') {
  if (user.role !== UserRoleEnum.ADMIN) {
    throw new ForbiddenException(`${message}`);
  }
}
