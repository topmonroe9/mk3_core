import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../_decorators/roles.decorator';
import { Role } from '../_interfaces/role.enum';
import { UserService } from '../users/user.service';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import * as jwt from 'jsonwebtoken';
import * as config from 'config';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private userService: UserService,
        private refreshTokenService: RefreshTokensService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        if (!req.headers.authorization && !req.cookies.refreshToken) {
            return false;
        }

        if (
            req.headers.access === 'internal' &&
            req.headers.authorization === `Bearer ${process.env.INTERNAL_API_KEY}`
        ) {
            return true;
        }

        req.user = await this.validateToken(req.headers.authorization);
        await this.validateUser(req);

        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        //check if user has access to requested resource
        return requiredRoles.some((r) => req.user.roles.includes(r));
    }

    async validateToken(auth: string) {
        if (auth.split(' ')[0] !== 'Bearer') {
            throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
        }
        try {
            const token = auth.split(' ')[1];
            return await jwt.verify(token, config.get('security.jwtPrivateKey'));
        } catch (error) {
            const message = 'Token Error: ' + (error.message || error.name);
            throw new HttpException(message, HttpStatus.FORBIDDEN);
        }
    }

    async validateUser(req) {
        const account = await this.userService.getAccount(req.user.id);

        const refreshTokens = await this.refreshTokenService.find({ account: account.id });

        if (!account) throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);

        if (account.suspended)
            throw new HttpException('Ваш аккаунт заморожен. Свяжитесь со своим руководителем.', HttpStatus.FORBIDDEN);

        // authentication and authorization successful
        req.user.roles = account.roles;
        req.user.ownsToken = (token) => !!refreshTokens.find((x) => x.token === token);
    }
}
