import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserSchema } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { RefreshToken, RefreshTokenDocument } from '../schemas/refresh-token.schema';
import * as jwt from 'jsonwebtoken';
import { MailService } from '../mail/mail.service';
import { Role } from '../_interfaces/role.enum';
import * as config from 'config';

import { UserDto } from './dto/UserDto';
import { ForgotPwdDto, LoginUserDto, RegisterUserDto, ResetPwdDto, ValidateResetTokenDto, VerifyEmailDto } from './dto';
import { CrudUserDto } from './dto/crudUserDto';
import { Employee, EmployeeDocument } from '../schemas/employee.schema';
import { BimCatsService } from '../bim-cats/bim-cats.service';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(RefreshToken.name)
        private refreshTokenModel: Model<RefreshTokenDocument>,
        @InjectModel(Employee.name)
        private employeeModel: Model<EmployeeDocument>,
        private mailService: MailService,
        @Inject(forwardRef(() => BimCatsService))
        private bimCatsService: BimCatsService
    ) {}

    public async login({ email, password, ipAddress }: LoginUserDto) {
        const user: UserDocument = await this.userModel.findOne({ email });

        if (!user || !user.isVerified || !bcrypt.compareSync(password, user.passwordHash)) {
            throw new HttpException('Неправильные почта или пароль', HttpStatus.BAD_REQUEST);
        }

        if (user.suspended)
            throw new HttpException('Ваш аккаунт заморожен. Свяжитесь со своим руководителем.', HttpStatus.BAD_REQUEST);

        // authentication successful so generate jwt and refresh tokens
        const jwtToken = this.generateJwtToken(user);
        const refreshToken = this.generateRefreshToken(user, ipAddress);

        // save refresh token
        await refreshToken.save();

        // return basic details and tokens
        return {
            ...this.basicDetails(user),
            jwtToken,
            refreshToken: refreshToken.token,
        };
    }

    public async register(params: RegisterUserDto): Promise<void> {
        if (await this.userModel.findOne({ email: params.email })) {
            throw new HttpException('Пользователь с указанной почтой уже зарегистрирован.', HttpStatus.CONFLICT);
        }

        const account = new this.userModel(params);

        // if email is mk3.ru then Employee, otherwise default (outsource)
        if (this.emailIsMk3(params.email) && (await this.isEmployee(account))) {
            account.roles.push(Role.Employee);
            account.pluginAccessGranted = true;
        } else {
            account.roles.push(Role.Outsource);
            account.pluginAccessGranted = false;
        }

        const bimCat = await this.bimCatsService.getByCode(params.bimCatSelection);
        account.allowedBimCat = bimCat.id;

        account.verificationToken = this.randomTokenString();

        account.passwordHash = await this.hash(params.password);

        await account.save();

        await this.mailService.sendVerificationEmail(account);
        return;
    }

    public async getById(id): Promise<UserDto> {
        const user = await this.getAccount(id);
        return this.basicDetails(user);
    }

    public async findByEmail(email) {
        return this.userModel.findOne({ email: email });
    }

    public async refreshToken(data: { token: string; ipAddress: string }) {
        const refreshToken: RefreshTokenDocument = await this.getRefreshToken(data.token);
        const account = await this.getAccount(refreshToken.account.id);
        // replace old refresh token with a new one and save
        const newRefreshToken = this.generateRefreshToken(account, data.ipAddress);
        refreshToken.revoked = new Date(Date.now());
        refreshToken.revokedByIp = data.ipAddress;
        refreshToken.replacedByToken = newRefreshToken.token;
        await refreshToken.save();
        await newRefreshToken.save();

        account.lastActive = new Date(Date.now());
        if (!account.loginsFromIp.includes(data.ipAddress)) account.loginsFromIp.push(data.ipAddress);

        // generate new jwt
        const jwtToken = this.generateJwtToken(account);

        await account.save();
        // return basic details and tokens
        return {
            ...this.basicDetails(account),
            jwtToken,
            refreshToken: newRefreshToken.token,
        };
    }

    public async getRefreshToken(token: string): Promise<RefreshTokenDocument> {
        const refreshToken: RefreshTokenDocument = await this.refreshTokenModel.findOne({ token }).populate('account');
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

        await refreshToken.save();
    }

    public async verifyEmail({ token }: VerifyEmailDto) {
        const account = await this.userModel.findOne({
            verificationToken: token,
        });

        if (!account) throw new HttpException('Не удалось подтвердить почту.', HttpStatus.INTERNAL_SERVER_ERROR);

        account.verified = new Date(Date.now());
        account.verificationToken = undefined;
        await account.save();
        await this.mailService.sendWelcomeEmail(account);
    }

    public async forgotPassword(body: ForgotPwdDto, origin: string) {
        const account = await this.userModel.findOne({ email: body.email });

        // always return ok response to prevent email enumeration
        if (!account) throw new HttpException('ok', 200);

        // create reset token that expires after 24 hours
        account.resetToken = {
            token: this.randomTokenString(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
        await account.save();

        // send email
        await this.mailService.sendPasswordResetEmail(account);
    }

    public async validateResetToken({ token }: ValidateResetTokenDto) {
        const account = await this.userModel.findOne({
            'resetToken.token': token,
            'resetToken.expires': { $gt: Date.now() },
        });

        if (!account) throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    public async resetPassword({ token, password }: ResetPwdDto) {
        const account: UserDocument = await this.userModel.findOne({
            'resetToken.token': token,
            'resetToken.expires': { $gt: Date.now() },
        });

        if (!account)
            throw new HttpException('Пользователь не существует или неправильный токен', HttpStatus.BAD_REQUEST);

        // update password and remove reset token
        account.passwordHash = await this.hash(password);
        account.passwordReset = new Date(Date.now());
        account.resetToken = undefined;
        await account.save();
    }

    public async getAll(): Promise<UserDto[]> {
        const accounts: UserDocument[] = await this.userModel.find().populate('allowedBimCat', ['_id', 'name']);
        return accounts.map((x) => this.basicDetails(x));
    }

    public async create(params: CrudUserDto): Promise<UserDto> {
        // validate
        if (await this.userModel.findOne({ email: params.email })) {
            throw new HttpException(`Аккаунт c почтой  "${params.email}" уже зарегистрирован`, HttpStatus.CONFLICT);
        }

        const account: UserDocument = new this.userModel(params);
        account.verified = new Date(Date.now());

        // hash password
        account.passwordHash = await this.hash(params.password);

        // save account
        await account.save();

        return this.basicDetails(account);
    }

    public async update(id: string, params: CrudUserDto) {
        const account: UserDocument = await this.getAccount(id);
        // validate (if email was changed)
        if (params.email && account.email !== params.email && (await this.userModel.findOne({ email: params.email }))) {
            throw new HttpException(`Почта "${params.email}" занята другим пользователем.`, HttpStatus.CONFLICT);
        }
        // hash password if it was entered
        if (params.password && params.password != '') {
            params.passwordHash = await this.hash(params.password);
        }

        if (params.pluginAccessGranted === true && !account.notifyBimCatOpened) {
            try {
                await this.mailService.notifyBimCatOpened(account);
            } catch (err) {
                console.log(err);
            }
        }

        // copy params to account and save
        Object.assign(account, params);
        account.updated = new Date(Date.now());

        // if suspended
        if (params.suspended) account.suspendedAt = new Date(Date.now());
        if (!params.suspended) account.suspendedAt = undefined;

        await account.save();

        return this.basicDetails(account);
    }

    public async updateMany(params: CrudUserDto[]): Promise<UserDto[]> {
        const accounts: UserDocument[] = [];
        for (const user of params) {
            const account = await this.userModel.findById(user.id);
            Object.assign(account, user);
            account.updated = new Date(Date.now());
            await account.save(); //TODO refactor this crap to something more clever
            accounts.push(account);
        }
        return accounts.map((acc) => this.basicDetails(acc));
    }

    public async delete(id: string): Promise<void> {
        const account: UserDocument = await this.getAccount(id);
        await account.remove();
    }

    public async deleteMany(emails: string[]) {
        await this.userModel.deleteMany({ email: { $in: emails } });
        return emails;
    }

    public async getAccount(id: string): Promise<UserDocument> {
        if (!this.isValidId(id)) throw new HttpException('Wrong id', HttpStatus.NOT_FOUND);
        const account: UserDocument = await this.userModel.findById(id).populate('allowedBimCat', ['_id', 'name']);
        if (!account) throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
        return account;
    }

    private emailIsMk3(email) {
        const regEx = /^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(mk3)\.ru$/;
        if (email.match(regEx)) return true;
        return false;
    }

    private async isEmployee(user: UserDocument): Promise<boolean> {
        const employee = await this.employeeModel.findOne({
            FirstName: user.firstName,
            LastName: user.lastName,
        });
        if (employee) return true;

        return false;
    }

    private randomTokenString(): string {
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
            createdByIp: ipAddress,
        });
    }

    private generateJwtToken(account: User): string {
        // create a jwt token containing the account id that expires in 15 minutes
        return jwt.sign(
            {
                sub: account._id,
                id: account._id,
            },
            config.get('security.jwtPrivateKey'),
            { expiresIn: '15h' }
        );
    }

    public basicDetails(account: UserDocument): UserDto {
        const {
            id,
            firstName,
            lastName,
            email,
            roles,
            created,
            updated,
            passwordReset,
            verified,
            resetToken,
            verificationToken,
            loginsFromIp,
            lastLoginIp,
            lastActive,
            isVerified,
            allowedBimCat,
            pluginAccessGranted,
            launcherDownloaded,
            downloadedFrom,
            suspended,
            suspendedAt,
        } = account;
        return <UserDto>{
            id,
            firstName,
            lastName,
            email,
            roles,
            created,
            updated,
            isVerified,
            allowedBimCat,
            pluginAccessGranted,
            passwordReset,
            resetToken,
            verificationToken,
            loginsFromIp,
            lastLoginIp,
            lastActive,
            verified,
            launcherDownloaded,
            downloadedFrom,
            suspended,
            suspendedAt,
        };
    }


}
