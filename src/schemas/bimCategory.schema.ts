import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

@Schema({ collection: 'bimcategories' })
export class BimCat {
    id: mongoose.Schema.Types.ObjectId;
    @Prop({ required: true, unique: true, type: String })
    name: string;
    @Prop({ required: true, unique: true, type: String })
    code: string;
    @Prop({ type: Date })
    updated: Date;
}

export type BimCatDocument = BimCat & Document;

export const BimCatSchema = SchemaFactory.createForClass(BimCat);
