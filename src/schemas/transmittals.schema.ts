import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransmittalDocument = Transmittal & Document;

@Schema()
export class Transmittal {
    @Prop({ type: String })
    title: string;
    @Prop({ type: String })
    message: string;
    @Prop({ type: Date, default: Date.now })
    created: Date;
    @Prop({ type: Boolean, default: false })
    hidden: boolean;
}
export const TransmittalSchema = SchemaFactory.createForClass(Transmittal);

