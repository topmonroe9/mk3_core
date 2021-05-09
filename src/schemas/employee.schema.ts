import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import { Document } from 'mongoose';


@Schema({ collection: 'employees' })
export class Employee {
    id: string
    @Prop({ required: true, type: String })
    FirstName: string
    @Prop({ required: true, type: String })
    LastName: string
}

export type EmployeeDocument = Employee & Document;

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
