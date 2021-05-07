import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "@schemas/user.schema";
import {Model} from "mongoose";
import {RefreshToken, RefreshTokenDocument} from "@schemas/refresh-token.schema";

@Injectable()
export class RefreshTokensService {
    constructor(
        @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,

    ) {
    }

    public async find(query) {
        return this.refreshTokenModel.find(query);
    }


}
