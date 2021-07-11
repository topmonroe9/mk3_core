import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transmittal, TransmittalDocument } from '@schemas/transmittals.schema';
import { Model } from 'mongoose';


@Injectable()
export class TransmittalService {
    constructor(
        @InjectModel(Transmittal.name) private transmittalModel: Model<TransmittalDocument>,
    ) { }

    public async getAll() {
        return this.transmittalModel.find();
    }

    public async getById(id: string) {
        return this.transmittalModel.findById(id);
    }

    public async createOne(body: any) {
        const transmittal = new this.transmittalModel(body)
        await transmittal.save()
        return transmittal
    }

    public async updateOne(id: string, body: any) {
        const transmittal = await this.transmittalModel.findById(id)
        if (!transmittal) {
            throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
        }
        Object.assign(transmittal, body)
        await transmittal.save()

        return transmittal
    }

    public async deleteOne(id: string) {
        const transmittal = await this.transmittalModel.findByIdAndRemove(id)
        if (!transmittal) {
            throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
        }
        return transmittal
    }
}
