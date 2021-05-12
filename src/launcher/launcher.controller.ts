import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
    UsePipes,
} from '@nestjs/common';
import { LauncherService } from './launcher.service';
import { RolesGuard } from '../_guards/roles.guard';
import { Role } from '@interfaces/role.enum';
import { Roles } from '../_decorators/roles.decorator';
import { JoiValidationPipe } from '../_pipes/joi-validation.pipe';
import * as Validate from './dto/launcherValidation';
import { join } from 'path';

@Controller('api/launchers')
export class LauncherController {
    constructor(private launcherService: LauncherService) {}

    @Get('/latest')
    async getLatest() {
        return this.launcherService.getLatest().then((launcher) => {
            return launcher;
            // todo maybe we should return a version number?
        });
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.Admin)
    async getAll() {
        return this.launcherService.getAll().then((launchers) => {
            return launchers;
        });
    }

    @Get('/id/:id')
    @UseGuards(RolesGuard)
    @Roles(Role.Admin)
    async getById(@Param() param) {
        return this.launcherService.getById(param.id).then((launchers) => {
            return launchers;
        });
    }

    @Get('/download/id/:id')
    @UseGuards(RolesGuard)
    @Roles(Role.Admin)
    async downloadById(@Param() param, @Res() res) {
        return this.launcherService.downloadById(param.id).then((file) => {
            return res.download(LauncherController.generateLink(file));
        });
    }

    @Get('/download/latest')
    @UseGuards(RolesGuard)
    async downloadLatest(@Req() req, @Res() res) {
        return this.launcherService
            .downloadLatest(req.user, req.ip)
            .then((file) => {
                return res.download(LauncherController.generateLink(file));
            });
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.Admin)
    @UsePipes(new JoiValidationPipe(Validate.create))
    async create(@Body() body) {
        return this.launcherService.create(body).then((launcher) => {
            return launcher;
        });
    }

    @Put('id/:id')
    @UseGuards(RolesGuard)
    @Roles(Role.Admin)
    @UsePipes(new JoiValidationPipe(Validate.create))
    async update(@Req() req) {
        return this.launcherService
            .update(req.params.id, req.body)
            .then((launcher) => {
                return launcher;
            });
    }

    @Delete('id/:id')
    @UseGuards(RolesGuard)
    @Roles(Role.Admin)
    async delete(@Req() req) {
        return this.launcherService.delete(req.params.id).then(() => {
            return { message: 'Версия лаунчера удалена.' };
        });
    }

    private static generateLink(fileName: string): string {
        return join(__dirname, '..', '..', '..', 'mk3-public', 'launchers', fileName);
    }
}
