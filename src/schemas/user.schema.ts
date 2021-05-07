import {Prop, raw, Schema, SchemaFactory} from "@nestjs/mongoose";
import { Document } from 'mongoose';
import { Role } from "@interfaces/role.enum";
import * as mongoose from "mongoose";
import {BimCat, BimCatDocument} from "@schemas/bimCategory.schema";
// import { ResetToken } from "@schemas/resetToken.shema";

export type UserDocument = User & Document;

@Schema()
export class User {
    _id: string

    @Prop({ required: true, unique: true })
    email: string
    @Prop({ required: true, type: String })
    passwordHash: string
    @Prop({ required: true, type: String })
    firstName: string
    @Prop({ required: true, type: String })
    lastName: string
    @Prop([{ required: true, type: String, enum: Role }])
    roles: Role[]
    @Prop({  type: String })
    verificationToken: String
    @Prop({ type: Date })
    verified: Date
    @Prop(raw({
        token: { type: String },
        expires: { type: Date }
    }))
    resetToken: { token: string, expires: Date }
    @Prop({ type: Date})
    passwordReset: Date
    @Prop({ type: Date, default: Date.now })
    created: Date
    @Prop({type: Date})
    updated: Date
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: BimCat.name})
    allowedBimCat: BimCatDocument // todo change this
    @Prop({type: Boolean, default: false})
    suspended: boolean
    @Prop({type: Date})
    suspendedAt: Date | undefined
//     lastOnlinePortal: {type: Date},
//     lastOnlineLauncher: {type: Date},
    @Prop({type: Number, default: 0})
    launcherDownloaded: Number
    @Prop({type: [String] })
    downloadedFrom: string[]
//     loginsFromIp: {type: Array},
//     loginsFromMAC: {type: Array}
    isVerified: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('isVerified').get(function () {
    return !!(this.verified || this.passwordReset);
});

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.passwordHash;
    }
});



export interface UserReq extends Request{
    sub: string
    id: string
    iat: number
    exp: number
    role: [Role]

}
