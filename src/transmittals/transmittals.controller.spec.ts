import { Test, TestingModule } from '@nestjs/testing';
import { TransmittalController } from './transmittal.controller';

describe('TransmittalsController', () => {
  let controller: TransmittalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransmittalController],
    }).compile();

    controller = module.get<TransmittalController>(TransmittalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
