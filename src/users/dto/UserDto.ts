import {Role} from "@interfaces/role.enum";
import {Prop, raw} from "@nestjs/mongoose";

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
    // allowedBimCat: BimCategory
    suspended: boolean
//     lastOnlinePortal: {type: Date},
//     lastOnlineLauncher: {type: Date},
    launcherDownloaded: Number
    downloadedFrom: string[]
//     loginsFromIp: {type: Array},
//     loginsFromMAC: {type: Array}
    isVerified: boolean
    allowedBimCat: any
}
