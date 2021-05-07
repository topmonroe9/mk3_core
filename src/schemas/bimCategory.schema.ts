import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import { Document } from 'mongoose';


@Schema({ collection: 'bimcategories' })
export class BimCat {

    @Prop({ required: true, unique: true, type: String })
    name: string
    @Prop({ type: Date })
    updated: Date
}

export type BimCatDocument = BimCat & Document;

export const BimCatSchema = SchemaFactory.createForClass(BimCat);
