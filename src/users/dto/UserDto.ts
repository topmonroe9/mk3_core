import {Role} from "@interfaces/role.enum";
import {Prop, raw} from "@nestjs/mongoose";
import {BimCatDto} from "../../bim-cats/dto";

export class UserDto {
    id: string
    email: string
    firstName: string
    lastName: string
    roles: Role[]
    verificationToken: String
    verified: Date
    resetToken: { token: string, expires: Date }
    passwordReset: Date
    created: Date
    updated: Date
    allowedBimCat: BimCatDto
    suspended: boolean
    suspendedAt: Date
//     lastOnlinePortal: {type: Date},
//     lastOnlineLauncher: {type: Date},
    launcherDownloaded: Number
    downloadedFrom: string[]
    loginsFromIp: string[]
    lastLoginIp: string
    lastActive: Date
//     loginsFromMAC: {type: Array}
    isVerified: boolean
}
