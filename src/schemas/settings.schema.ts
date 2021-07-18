import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema()
export class Settings {
    @Prop({ type: Number })
    key: number;
    @Prop({ type: String })
    pluginDownloadLink: string;
    @Prop({ type: String })
    launcherDownloadLink: string;
}
export const SettingsSchema = SchemaFactory.createForClass(Settings);

