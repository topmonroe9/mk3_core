import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../_interfaces/role.enum';
import * as mongoose from 'mongoose';
import { BimCat, BimCatDocument } from './bimCategory.schema';
import { BimCatDto } from '../bim-cats/dto';
// import { ResetToken } from "@schemas/resetToken.shema";

export type UserDocument = User & Document;

@Schema()
export class User {
    _id: string;

    @Prop({ required: true, unique: true })
    email: string;
    @Prop({ required: true, type: String })
    passwordHash: string;
    @Prop({ required: true, type: String })
    firstName: string;
    @Prop({ required: true, type: String })
    lastName: string;
    @Prop([{ required: true, type: String, enum: Role }])
    roles: Role[];
    @Prop({ type: String })
    verificationToken: string;
    @Prop({ type: Date })
    verified: Date;
    @Prop(
        raw({
            token: { type: String },
            expires: { type: Date },
        }),
    )
    resetToken: { token: string; expires: Date };
    @Prop({ type: Date })
    passwordReset: Date;
    @Prop({ type: Date, default: Date.now })
    created: Date;
    @Prop({ type: Date })
    updated: Date;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: BimCat.name })
    allowedBimCat: BimCat;
    @Prop({ type: Boolean, default: false })
    suspended: boolean;
    @Prop({ type: Date })
    suspendedAt: Date | undefined;
    //     lastOnlinePortal: {type: Date},
    //     lastOnlineLauncher: {type: Date},
    @Prop({ type: Number, default: 0 })
    launcherDownloaded: number;
    @Prop({ type: [String] })
    downloadedFrom: string[];
    @Prop({ type: [String] })
    loginsFromIp: string[];
    lastLoginIp: string;
    @Prop({ type: Date })
    lastActive: Date;
    //     loginsFromMAC: {type: Array}
    isVerified: boolean;
    notifyBimCatOpened: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('isVerified').get(function () {
    return !!(this.verified || this.passwordReset);
});
UserSchema.virtual('notifyBimCatOpened').get(function () {
    if (
        this.allowedBimCat == undefined ||
        Object.entries(this.allowedBimCat).length === 0
    )
        return false;
    return true;
});
UserSchema.virtual('lastLoginIp').get(function () {
    return this.loginsFromIp[this.loginsFromIp.length - 1];
});

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.passwordHash;
    },
});

export interface UserReq extends Request {
    sub: string;
    id: string;
    iat: number;
    exp: number;
    role: [Role];
}
