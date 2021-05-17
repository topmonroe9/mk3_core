import {Controller, Param, Get, Res, UseGuards} from '@nestjs/common';
import {RolesGuard} from "../_guards/roles.guard";
import { join } from "path";

@Controller('api/plugins')
export class PluginsController {
    @UseGuards(RolesGuard)
    @Get('download/:fileName')
    async downloadFile(@Param() params, @Res() res) {
        const link = join(__dirname, '..', '..', '..', 'mk3-public', 'plugins', params.fileName);
        return res.download(link)
    }
}
