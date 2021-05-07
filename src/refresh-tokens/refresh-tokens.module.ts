import { Module } from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import {MongooseModule} from "@nestjs/mongoose";
import {RefreshToken, RefreshTokenSchema} from "@schemas/refresh-token.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{name: RefreshToken.name, schema: RefreshTokenSchema}]),
  ],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService]
})
export class RefreshTokensModule {}
