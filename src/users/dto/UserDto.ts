import { Role } from '@interfaces/role.enum';
import { Prop, raw } from '@nestjs/mongoose';
import { BimCatDto } from '../../bim-cats/dto';
import mongoose from 'mongoose';

export class UserDto {
    id: mongoose.Schema.Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    roles: Role[];
    verificationToken: string;
    verified: Date;
    resetToken: { token: string; expires: Date };
    passwordReset: Date;
    created: Date;
    updated: Date;
    allowedBimCat: BimCatDto;
    pluginAccessGranted: boolean;
    suspended: boolean;
    suspendedAt: Date;
    //     lastOnlinePortal: {type: Date},
    //     lastOnlineLauncher: {type: Date},
    launcherDownloaded: number;
    downloadedFrom: string[];
    loginsFromIp: string[];
    lastLoginIp: string;
    lastActive: Date;
    //     loginsFromMAC: {type: Array}
    isVerified: boolean;
}
