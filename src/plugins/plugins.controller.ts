import { Controller, Get, Res, Response, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { RolesGuard } from '../_guards/roles.guard';
import { LauncherService } from '../launcher/launcher.service';
import { PluginsService } from './plugins.service';
import fetch from 'node-fetch';
import { createReadStream } from 'fs';
import { join } from 'path';
import * as fs from 'fs';

@Controller('api/plugins')
export class PluginsController {
    constructor(private pluginService: PluginsService) {}

    @UseGuards(RolesGuard)
    @Get('download/MK3.zip') // TODO change this route
    async downloadFile(@Res() res) {
        return this.pluginService.getPluginDownloadLink().then(async (link) => {
            return res.redirect(link)
        });
    }
}
