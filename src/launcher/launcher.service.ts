import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Launcher, LauncherDocument } from '@schemas/launcher.schema';
import { UserDto } from '../users/dto/UserDto';
import { User, UserDocument } from '@schemas/user.schema';
import { Role } from '@interfaces/role.enum';

@Injectable()
export class LauncherService {
    constructor(
        @InjectModel(Launcher.name)
        private launcherModel: Model<LauncherDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    public async getLatest(): Promise<LauncherDto> {
        const launcher: LauncherDocument = await this.launcherModel
            .findOne()
            .sort({ version: -1 })
            .limit(1);
        return this.basicDetails(launcher);
    }

    public async getById(id: string): Promise<LauncherDto> {
        const launcher = await this.getLauncher(id);
        return this.basicDetails(launcher);
    }

    public async getAll(): Promise<LauncherDto[]> {
        const launchers = await this.launcherModel.find().sort({ version: -1 });
        return launchers.map((x) => this.basicDetails(x));
    }

    public async create(params: LauncherDto): Promise<LauncherDto> {
        if (await this.launcherModel.findOne({ version: params.version })) {
            throw new HttpException(
                `Версия ${params.version}" уже существует`,
                HttpStatus.CONFLICT,
            );
        }

        const launcher = new this.launcherModel(params);
        await launcher.save();

        return this.basicDetails(launcher);
    }

    public async update(id: string, params: LauncherDto): Promise<LauncherDto> {
        const launcher = await this.getLauncher(id);

        // copy params to plugin and save
        Object.assign(launcher, params);
        launcher.updated = new Date(Date.now());
        await launcher.save();

        return this.basicDetails(launcher);
    }

    public async delete(id: string): Promise<void> {
        const launcher = await this.getLauncher(id);
        await launcher.remove();
    }

    public async downloadById(id: string): Promise<string> {
        const launcher = await this.getLauncher(id);
        return launcher.downloadLink;
    }

    public async downloadLatest(user: UserDto, ip: string): Promise<string> {
        const account = await this.userModel.findOne({ _id: user.id });

        this.checkDownloadRestriction(account, user);

        const launcher = await this.launcherModel
            .findOne()
            .sort({ version: -1 })
            .limit(1);
        // increase counter of downloads
        await this.launcherDownloadCounter(user, ip);

        return launcher.downloadLink;
    }

    private async launcherDownloadCounter(user: UserDto, ip: string) {
        if (!this.isAdminOrManager(user)) {
            await this.userModel.updateOne(
                { _id: user.id, roles: { $ne: [Role.Admin, Role.Manager] } },
                {
                    $inc: { launcherDownloaded: 1 },
                    $addToSet: { downloadedFrom: ip },
                },
            );
        }
    }

    private isAdminOrManager(reqUser: UserDto): boolean {
        return reqUser.roles.some((r) =>
            [Role.Admin, Role.Manager].includes(r),
        );
    }

    private checkDownloadRestriction(account: UserDocument, reqUser: UserDto) {
        if (
            account.launcherDownloaded >= 3 &&
            !this.isAdminOrManager(reqUser)
        ) {
            throw new HttpException(
                'Превышен лимит на скачивание. Инцидент зафиксирован. Свяжитесь со своим руководителем.',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
        }
    }

    private async getLauncher(id: string): Promise<LauncherDocument> {
        if (!this.isValidId(id))
            throw new HttpException('Launcher not found', HttpStatus.NOT_FOUND);
        const launcher = await this.launcherModel.findById(id);
        if (!launcher) throw 'Лаунчер не найден';
        return launcher;
    }

    private isValidId(id: string) {
        return mongoose.Types.ObjectId.isValid(id);
    }

    private basicDetails(launcher: LauncherDocument): LauncherDto {
        const { id, version, downloadLink } = launcher;
        return { id, version, downloadLink };
    }
}
