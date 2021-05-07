import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import { Document } from 'mongoose';
import * as mongoose from "mongoose";
import {User, UserDocument} from "@schemas/user.schema";

export type RefreshTokenDocument = RefreshToken & Document;

@Schema()
export class RefreshToken {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    account: UserDocument
    @Prop({ type: String })
    token: string
    @Prop({ type: Date })
    expires: Date
    @Prop({ type: Date, default: Date.now })
    created: Date
    @Prop({ type: String })
    createdByIp: string
    @Prop({ type: Date })
    revoked: Date
    @Prop({ type: String })
    revokedByIp: string
    @Prop({ type: String })
    replacedByToken: string
    isExpired: boolean
    isActive: boolean
}
export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);


RefreshTokenSchema.virtual('isExpired').get(function () {
    return Date.now() >= this.expires;
});

RefreshTokenSchema.virtual('isActive').get(function () {
    return !this.revoked && !this.isExpired;
});
