import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
    UsePipes,
} from '@nestjs/common';
import { JoiValidationPipe } from '../_pipes/joi-validation.pipe';
import { UserService } from './user.service';

import { Role } from '../_interfaces/role.enum';
import { Roles } from '../_decorators/roles.decorator';
import { RolesGuard } from '../_guards/roles.guard';
import {
    ForgotPwdDto,
    LoginUserDto,
    RegisterUserDto,
    ResetPwdDto,
    Validation,
    VerifyEmailDto,
} from './dto';
import { UserDto } from './dto/UserDto';
import { CrudUserDto } from './dto/crudUserDto';
import _ = require('lodash');

@Controller('api/users')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('authenticate')
    async authenticate(
        @Body() user: LoginUserDto,
        @Req() req,
        @Res({ passthrough: true }) res
    ) {
        return this.userService
            .login({
                email: user.email,
                password: user.password,
                ipAddress: req.ip,
            })
            .then((user) => {
                this.setTokenCookie(res, user.refreshToken);
                return user;
            });
    }

    @Post('refresh-token')
    refreshToken(@Req() request, @Res() res) {
        const token = request.cookies.refreshToken;
        const ipAddress = request.ip;
        return this.userService
            .refreshToken({ token, ipAddress })
            .then(({ refreshToken, ...account }) => {
                this.setTokenCookie(res, refreshToken);
                res.send(account);
            });
    }

    @Post('revoke-token')
    @UseGuards(RolesGuard)
    revokeToken(@Req() req) {
        // accept token from request body or cookie
        const token = req.body.token || req.cookies.refreshToken;
        const ipAddress = req.ip;

        if (!token)
            throw new HttpException(
                'Token is required',
                HttpStatus.BAD_GATEWAY
            );

        //users can revoke their own tokens and admins can revoke any tokens
        if (!req.user.ownsToken(token) && req.user.roles.includes(Role.Admin)) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        return this.userService.revokeToken({ token, ipAddress }).then(() => {
            return 'Token revoked';
        });
    }

    @Post('register')
    @UsePipes(new JoiValidationPipe(Validation.register))
    async register(@Body() body: RegisterUserDto) {
        return this.userService.register(body).then(() => {
            return {
                message:
                    'Данные приняты. Проверьте электронную почту для подтверждения регистрации.',
            };
        });
    }

    @Post('verify-email')
    @UsePipes(new JoiValidationPipe(Validation.verifyEmail))
    verifyEmail(@Body() body: VerifyEmailDto) {
        return this.userService.verifyEmail(body).then(() => {
            return { message: 'Аккаунт успешно подтвержден. Выполните вход.' };
        });
    }

    @Post('forgot-password')
    @UsePipes(new JoiValidationPipe(Validation.forgotPassword))
    async forgotPassword(@Req() req, @Body() body: ForgotPwdDto) {
        return this.userService
            .forgotPassword(body, req.get('origin'))
            .then(() => {
                return {
                    message:
                        'Инструкции по восстановлению пароля отправлены на почту.',
                };
            });
    }

    @Post('validate-reset-token')
    @UsePipes(new JoiValidationPipe(Validation.validateResetToken))
    async validateResetToken(@Req() req) {
        return await this.userService.validateResetToken(req.body).then(() => {
            return { message: 'Token is valid' };
        });
    }

    @Post('reset-password')
    @UsePipes(new JoiValidationPipe(Validation.resetPassword))
    async resetPassword(@Body() body: ResetPwdDto) {
        return this.userService.resetPassword(body).then(() => {
            return { message: 'Пароль успешно сброшен. Выполните вход.' };
        });
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.Admin, Role.Manager)
    async getAll() {
        return this.userService.getAll().then((accounts: UserDto[]) => {
            return accounts;
        });
    }

    @Get('id/:id')
    @UseGuards(RolesGuard)
    getById(@Req() req) {
        // users can get their own account and admins can get any account
        const AdminOrManager = req.user.roles.some((r) =>
            [Role.Admin, Role.Manager].includes(r)
        );
        if (req.params.id !== req.user.id && !AdminOrManager) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }

        return this.userService.getAccount(req.params.id).then((account) => {
            return this.userService.basicDetails(account);
        });
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.Admin)
    @UsePipes(new JoiValidationPipe(Validation.create))
    async create(@Body() body: CrudUserDto) {
        return this.userService.create(body).then((account: UserDto) => {
            return account;
        });
    }

    @Put('id/:id')
    @UseGuards(RolesGuard)
    @UsePipes(new JoiValidationPipe(Validation.update))
    async update(@Req() req, @Body() body: CrudUserDto) {
        // users can update their own account and admins can update any account
        const isAdminOrManager =
            req.user.roles.includes(Role.Manager) ||
            req.user.roles.includes(Role.Admin);
        const isManager = req.user.roles.includes(Role.Manager);
        const changingAnotherUser = req.params.id !== req.user.id;

        if (changingAnotherUser && !isAdminOrManager)
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

        // managers can only change bimCats of other users
        if (changingAnotherUser && isManager)
            body = _.pick(body, ['allowedBimCats', 'pluginAccessGranted', 'isSuspended']);

        if (!isAdminOrManager)
            body = _.pick(body, ['firstName', 'lastName', 'password']);

        return this.userService.update(req.params.id, body).then((account) => {
            return account;
        });
    }

    @Delete('id/:id')
    @UseGuards(RolesGuard)
    @Roles(Role.Admin)
    async delete(@Param() param) {
        return this.userService.delete(param.id).then(() => {
            return { message: 'Аккаунт удален.' };
        });
    }

    @Get('me')
    @UseGuards(RolesGuard)
    async getCurrent(@Req() req) {
        return this.userService.getAccount(req.user.id).then((account) => {
            return this.userService.basicDetails(account);
        });
    }

    private setTokenCookie(res, token) {
        // create cookie with refresh token that expires in 7 days
        const cookieOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        res.cookie('refreshToken', token, cookieOptions);
    }
}
