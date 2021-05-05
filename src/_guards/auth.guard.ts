import {Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Global} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {UserService} from "../users/user.service";
import { RefreshTokensService } from "../refresh-tokens/refresh-tokens.service";


@Injectable()
export class AuthGuard implements CanActivate {

    constructor(  private userService: UserService,
                  private refreshTokenService: RefreshTokensService
                 ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        if (!request.headers.authorization) {
            return false;
        }
        request.user = await this.validateToken(request.headers.authorization);
        await this.validateUser(request)
        return true;
    }

    async validateToken(auth: string) {
        if (auth.split(' ')[0] !== 'Bearer') {
            throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
        }
        try {
            const token = auth.split(' ')[1];
            return await jwt.verify(token, process.env.crm_jwtPrivateKey)
        } catch (error) {
            const message = 'Token Error: ' + (error.message || error.name);
            throw new HttpException(message, HttpStatus.FORBIDDEN);
        }
    }

    async validateUser(req) {
        const account = await this.userService.getById(req.user.id);
        const refreshTokens = await this.refreshTokenService.find({account: account.id});

        if (!account) throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);

        if (account.suspended) throw new HttpException('Ваш аккаунт заморожен. Свяжитесь со своим руководителем.', HttpStatus.FORBIDDEN)

        // authentication and authorization successful
        req.user.role = account.roles;

        req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
    }
}

