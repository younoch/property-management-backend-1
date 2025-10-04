import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-role.enum';

export const ROLES_KEY = 'roles';

type RoleType = UserRole | string;

export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
