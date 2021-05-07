import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import {Model} from "mongoose";
import {User, UserDocument} from "@schemas/user.schema";
import * as bcrypt from 'bcrypt'
import {randomBytes} from "crypto";
import {RefreshToken, RefreshTokenDocument} from "@schemas/refresh-token.schema";
import * as jwt from "jsonwebtoken";
import {MailService} from "../_sevices/mailer";
import {Role} from "../_interfaces/role.enum";

import {UserDto} from "./dto/UserDto";
import {ForgotPwdDto, LoginUserDto, RegisterUserDto, ResetPwdDto, ValidateResetTokenDto, VerifyEmailDto} from "./dto";
import {CrudUserDto} from "./dto/crudUserDto";

const config = require('config');

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
        private mailService: MailService,
    ) {
    }

    public async login({email, password, ipAddress}: LoginUserDto) {
        const user: UserDocument = await this.userModel.findOne({email});

        if (!user || !user.isVerified || !bcrypt.compareSync(password, user.passwordHash)) {
            throw new HttpException('Неправильные почта или пароль', HttpStatus.BAD_REQUEST);
        }

        if (user.suspended) throw new HttpException("Ваш аккаунт заморожен. Свяжитесь со своим руководителем.", HttpStatus.BAD_REQUEST)

        // authentication successful so generate jwt and refresh tokens
        const jwtToken = this.generateJwtToken(user);
        const refreshToken = this.generateRefreshToken(user, ipAddress);

        // save refresh token
        await refreshToken.save();

        // return basic details and tokens
        return {
            ...this.basicDetails(user),
            jwtToken,
            refreshToken: refreshToken.token
        };
    }

    public async register(params: RegisterUserDto, origin: string): Promise<void> {
        ;
        if (await this.userModel.findOne({email: params.email})) {
            // send already registered error in email to prevent account enumeration
            // return await this.sendAlreadyRegisteredEmail(params.email, origin);
        }

        // create account object
        const account = new this.userModel(params);

        // if email is mk3.ru then Employee, otherwise default (outsource)
        if (this.emailIsMk3(params.email) && await this.isEmployee(account)) {
            account.roles.push(Role.Employee);
        } else {
            account.roles.push(Role.Outsource)
        }

        account.verificationToken = this.randomTokenString();

        // hash password
        account.passwordHash = await this.hash(params.password);

        // save account
        await account.save();
        // send email
        // await this.sendVerificationEmail(account, origin);
        return
    }

    public async getById(id) {
        const user = await this.getAccount(id);
        return this.basicDetails(user)
    }

    public async findByEmail(email) {
        return this.userModel.findOne({email: email});
    }

    public async refreshToken(data: { token: string, ipAddress: string }) {
        const refreshToken: RefreshTokenDocument = await this.getRefreshToken(data.token);
        const {account} = refreshToken;
        // replace old refresh token with a new one and save
        const newRefreshToken = this.generateRefreshToken(account, data.ipAddress);
        refreshToken.revoked = new Date(Date.now());
        refreshToken.revokedByIp = data.ipAddress;
        refreshToken.replacedByToken = newRefreshToken.token;
        await refreshToken.save();
        await newRefreshToken.save();

        // generate new jwt
        const jwtToken = this.generateJwtToken(account);

        // return basic details and tokens
        return {
            ...this.basicDetails(account),
            jwtToken,
            refreshToken: newRefreshToken.token
        };
    }

    public async getRefreshToken(token: string): Promise<RefreshTokenDocument> {
        const refreshToken: RefreshTokenDocument = await this.refreshTokenModel.findOne({token}).populate('account');
        if (!refreshToken || !refreshToken.isActive) {
            throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
        }
        return refreshToken;
    }

    public async revokeToken(param: { ipAddress: any; token: any }): Promise<void> {
        const refreshToken = await this.getRefreshToken(param.token);
        // revoke token and save
        refreshToken.revoked = new Date(Date.now());
        refreshToken.revokedByIp = param.ipAddress;

        await refreshToken.save()
    }

    public async verifyEmail({token}: VerifyEmailDto) {
        const account = await this.userModel.findOne({token});

        if (!account) throw new HttpException('Не удалось подтвердить почту.', HttpStatus.INTERNAL_SERVER_ERROR);

        account.verified = new Date(Date.now());
        account.verificationToken = undefined;
        await account.save();
        // todo send a welcome email
    }

    public async forgotPassword(body: ForgotPwdDto, origin: string) {
        const account = await this.userModel.findOne({email: body.email});

        // always return ok response to prevent email enumeration
        if (!account) throw new HttpException('ok', 200);

        // create reset token that expires after 24 hours
        account.resetToken = {
            token: this.randomTokenString(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        await account.save();

        // send email
        await this.sendPasswordResetEmail(account, origin);
    }

    private async sendVerificationEmail(account: UserDto, origin: string) {
        let message;
        if (origin) {
            const verifyUrl = `${origin}#/account/verify-email?token=${account.verificationToken}`;
            message = `<p>Для завершения регистрации на портале MK3, пожалуйста, перейдите по следующей ссылке:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
        } else {
            message = `<p>Используйте токен, указанный ниже для подтверждения регистрации. </br>API Адрес:<code>/users/verify-email</code></p>
                   <p><code>${account.verificationToken}</code></p>`;
        }

        await this.mailService.sendEmail({
            to: account.email,
            subject: 'M.K.3 CRM - Подтверждение регистрации',
            html: `<h4>Подтверждение регистрации</h4>

               ${message}`
        });
    }

//
// async function sendAlreadyRegisteredEmail(email, origin) {
//     let message;
//     if (origin) {
//         message = `<p>Если вы забыли свой пароль - вы можете восстановить его на странице <a href="${origin}#/account/forgot-password">восстановления пароля</a></p>`;
//     } else {
//         message = `<p>Если вы забыли свой пароль - вы можете восстановить его используя API <code>/users/forgot-password</code></p>`;
//     }
//
//     await sendEmail({
//         to: email,
//         subject: 'М.К.3 Портал - аккаунт уже зарегистрирован',
//         html: `<h4>Аккаунт уже зарегистрирован на портале М.К.3</h4>
//                <p>Ваша почта <strong>${email}</strong> же зарегистрирована на портале М.К.3</p>
//                ${message}`
//     });
// }

    public async validateResetToken({token}: ValidateResetTokenDto) {
        const account = await this.userModel.findOne({
            'resetToken.token': token,
            'resetToken.expires': {$gt: Date.now()}
        });

        if (!account) throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    public async resetPassword({token, password}: ResetPwdDto) {
        const account: UserDocument = await this.userModel.findOne({
            'resetToken.token': token,
            'resetToken.expires': { $gt: Date.now() }
        });

        if (!account) throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);

        // update password and remove reset token
        account.passwordHash = await this.hash(password);
        account.passwordReset = new Date(Date.now());
        account.resetToken = undefined;
        await account.save();
    }

    public async getAll(): Promise<UserDto[]> {
        const accounts: UserDocument[] = await this.userModel.find().populate('allowedBimCat', ['_id', 'name']);
        return accounts.map( x => this.basicDetails(x) )
    }

    public async create(params: CrudUserDto): Promise<UserDto> {
        // validate
        if (await this.userModel.findOne({ email: params.email })) {
            throw new HttpException(`Аккаунт c почтой  "${params.email}" уже зарегистрирован`, HttpStatus.CONFLICT);
        }

        const account: UserDocument = new this.userModel(params);
        account.verified = new Date( Date.now() );

        // hash password
        account.passwordHash = await this.hash(params.password);

        // save account
        await account.save();

        return account as UserDto;
    }

    public async update(id: string, params: CrudUserDto) {
        const account: UserDocument = await this.getAccount(id);

        // validate (if email was changed)
        if (params.email && account.email !== params.email && await this.userModel.findOne({ email: params.email })) {
            throw new HttpException(`Почта "${params.email}" занята другим пользователем.`, HttpStatus.CONFLICT);
        }
        // hash password if it was entered
        if (params.password) {
            params.passwordHash = await this.hash(params.password);
        }

        // copy params to account and save
        Object.assign(account, params);
        account.updated = new Date( Date.now() );

        // if suspended
        if (params.suspended) account.suspendedAt = new Date( Date.now() )
        if (!params.suspended) account.suspendedAt = undefined

        await account.save();

        return this.basicDetails(account);
    }

    public async delete(id: string): Promise<void> {
        const account: UserDocument = await this.getAccount(id);
        await account.remove();
    }

    public async getAccount(id: string): Promise<UserDocument> {
        console.log(id)
        if ( !this.isValidId(id) ) throw new HttpException('Wrong id', HttpStatus.NOT_FOUND);
        const account: UserDocument = await this.userModel.findById(id)
        if (!account) throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
        return account;
    }

    private async validate(userData): Promise<User> {
        return await this.findByEmail(userData.email);
    }

    private async sendPasswordResetEmail(account: User, origin: string) {
        let message;
        if (origin) {
            const resetUrl = `${origin}#/account/reset-password?token=${account.resetToken.token}`;
            message = `<p>Перейдите по следующей ссылке для изменения пароля. Ссылка активна 24 часа.</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <p><br><br>Если вы не совершали сброс пароля, пожалуйста, в целях безопасности, перешлите это сообщение системному администратору</p>`;
        } else {
            message = `<p>Используйте следующий токен для восстановления пароля. API адрес: <code>/users/reset-password</code> </p>
                   <p><code>${account.resetToken.token}</code></p>`;
        }

        await this.mailService.sendEmail({
            to: account.email,
            subject: 'М.К.3 Портал - Восстановление пароля',
            html: `<h4>М.К.3 - Восстановление пароля</h4>
               ${message}`
        });
    }

    private emailIsMk3(email) {
        let regEx = "/^(([^<>()\\[\\]\\\\.,;:\\s@\"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@\"]+)*)|(\".+\"))@(?:mk3.ru)$/)"
        if (email.match(regEx)) return true
        return false
    }

    private async isEmployee(user) {
        // todo connect employee db
        throw new HttpException('Employee DB not connected', HttpStatus.NOT_IMPLEMENTED)
        // const employee = await Employee.findOne({
        //     FirstName: /user.firstName/i,
        //     LastName: /user.lastName/i
        // })
        // if (employee) return true

        return false
    }

    private randomTokenString() {
        return randomBytes(40).toString('hex');
    }

    private isValidId(id: string): boolean {
        return mongoose.Types.ObjectId.isValid(id);
    }


    private async hash(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    private generateRefreshToken(account, ipAddress) {
        // create a refresh token that expires in 7 days
        return new this.refreshTokenModel({
            account: account._id,
            token: this.randomTokenString(),
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdByIp: ipAddress
        });
    }

    private generateJwtToken(account: User): string {
        // create a jwt token containing the account id that expires in 15 minutes
        return jwt.sign({sub: account._id, id: account._id}, process.env.crm_jwtPrivateKey, {expiresIn: '15h'});
    }

    public basicDetails(account: UserDocument): UserDto {
        const { id, firstName, lastName, email, roles, created, updated,
            isVerified, allowedBimCat, launcherDownloaded, downloadedFrom, suspended } = account;
        return { id, firstName, lastName, email, roles, created, updated,
            isVerified, allowedBimCat,
            passwordReset: undefined,
            resetToken: {expires: undefined, token: ""},
            verificationToken: "",
            verified: undefined,
            launcherDownloaded, downloadedFrom, suspended  };
    }
}
