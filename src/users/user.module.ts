import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RefreshToken, RefreshTokenSchema } from '@schemas/refresh-token.schema';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';
import { Employee, EmployeeSchema } from '@schemas/employee.schema';
import { BimCatsService } from '../bim-cats/bim-cats.service';
import { BimCat, BimCatSchema } from '@schemas/bimCategory.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: RefreshToken.name, schema: RefreshTokenSchema }]),
        MongooseModule.forFeature([{ name: Employee.name, schema: EmployeeSchema }]),
        MongooseModule.forFeature([{ name: BimCat.name, schema: BimCatSchema }]),
    ],
    providers: [UserService, RefreshTokensService, MailService, BimCatsService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
