import { Role } from '@interfaces/role.enum';

export class CrudUserDto {
    readonly email: string;
    readonly password: string;
    passwordHash: string;
    readonly confirmPassword: string;
    readonly role: Role[];
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly isVerified: boolean;
    readonly suspended: boolean;
    readonly allowedBimCat: [];
    readonly pluginAccessGranted: boolean;
}
