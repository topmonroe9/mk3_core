import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from '@schemas/settings.schema';

@Injectable()
export class PluginsService {
    constructor(@InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>) {}

    public async getPluginDownloadLink() {
        const setting = await this.settingsModel.findOne({ key: 1 });
        if ( !setting || !setting.pluginDownloadLink )
            throw new HttpException('No link found', HttpStatus.NOT_FOUND);
        return setting.pluginDownloadLink;
    }
}
