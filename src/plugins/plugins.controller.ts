import {Controller, Param, Post, Res, UseGuards} from '@nestjs/common';
import {RolesGuard} from "../_guards/roles.guard";
import { join } from "path";

@Controller('api/plugins')
export class PluginsController {

    @UseGuards(RolesGuard)
    @Post("download/:fileName")
    async downloadFile(@Param() param, @Res() res) {
        const link = join(__dirname, '..', '..', '..', 'mk3-public', 'plugins', param);
        return res.download(link)
    }
}
