import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { BimCat, BimCatDocument } from '../schemas/bimCategory.schema';
import * as mongoose from 'mongoose';
import { BimCatDto } from './dto/bimCat.dto';

@Injectable()
export class BimCatsService {
    constructor(
        @InjectModel(BimCat.name) private bimCatModel: Model<BimCatDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) {}

    public async getAll(): Promise<BimCatDto[]> {
        const bimCats = await this.bimCatModel.find();
        return bimCats.map((x) => this.basicDetails(x));
    }

    public async getByCode(code: string): Promise<BimCatDto> {
        const bimCat = await this.bimCatModel.findOne({ code: code });
        return this.basicDetails(bimCat);
    }

    public async getById(id: string): Promise<BimCatDto> {
        const bimCat = await this.getBimCat(id);
        return this.basicDetails(bimCat);
    }

    public async getAvailable(userId: string): Promise<BimCatDto> {
        const user = await this.userModel
            .findById(userId)
            .populate('allowedBimCats', ['_id', 'name']);
        return this.basicDetails(user.allowedBimCat as BimCat);
    }

    public async create(params: BimCatDto): Promise<BimCatDto> {
        // validate
        if (await this.bimCatModel.findOne({ name: params.name })) {
            throw new HttpException(
                `Категория "${params.name}" уже существует`,
                HttpStatus.CONFLICT
            );
        }
        const bimCat = new this.bimCatModel(params);
        await bimCat.save();

        return this.basicDetails(bimCat);
    }

    public async update(id: string, params: BimCatDto): Promise<BimCatDto> {
        const bimCat = await this.getBimCat(id);

        // copy params to category and save
        Object.assign(bimCat, params);
        bimCat.updated = new Date(Date.now());
        await bimCat.save();

        return this.basicDetails(bimCat);
    }

    public async delete(id: string): Promise<void> {
        const bimCat = await this.getBimCat(id);
        await bimCat.remove();
    }

    // helper functions

    private async getBimCat(id: string): Promise<BimCatDocument> {
        if (!this.isValidId(id))
            throw new HttpException(
                'BimCategory not found',
                HttpStatus.NOT_FOUND
            );
        const bimCat = await this.bimCatModel.findById(id);
        if (!bimCat) throw 'BimCategory not found';
        return bimCat;
    }

    private basicDetails(bimCat: BimCatDocument | BimCat): BimCatDto {
        const { id, name, updated, code } = bimCat;
        return { id, name, updated, code };
    }
    private isValidId(id: string): boolean {
        return mongoose.Types.ObjectId.isValid(id);
    }
}
