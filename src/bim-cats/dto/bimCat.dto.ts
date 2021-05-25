import mongoose from 'mongoose';

export class BimCatDto {
    id: mongoose.Schema.Types.ObjectId;
    name: string;
    code: string;
    updated: Date;
}
