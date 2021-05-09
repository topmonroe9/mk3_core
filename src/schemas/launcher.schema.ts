import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'launchers' })
export class Launcher {
    @Prop({ required: true, unique: true, type: String })
    version: string;
    @Prop({ type: String })
    downloadLink: string;
    @Prop({ type: Date })
    updated: Date;
}

export type LauncherDocument = Launcher & Document;

export const LauncherSchema = SchemaFactory.createForClass(Launcher);
