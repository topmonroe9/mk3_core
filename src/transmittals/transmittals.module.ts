import { Module } from '@nestjs/common';
import { TransmittalService } from './transmittal.service';
import { TransmittalController } from './transmittal.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transmittal, TransmittalSchema } from '@schemas/transmittals.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Transmittal.name, schema: TransmittalSchema}]),
    ],
  providers: [TransmittalService],
  controllers: [TransmittalController]
})
export class TransmittalsModule {}
