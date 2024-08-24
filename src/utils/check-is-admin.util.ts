// src/common/role-check.util.ts
import { ForbiddenException } from '@nestjs/common';
import { User } from 'src/modules/auth/entities/user.entity';
import { UserRoleEnum } from 'src/modules/auth/enum/user.role.enum';

export function checkIsAdmin(user: User, message: string = 'Only Admin can perform this action.') {
  if (user.role !== UserRoleEnum.ADMIN) {
    throw new ForbiddenException(`${message}`);
  }
}
