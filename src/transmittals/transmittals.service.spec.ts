import { Test, TestingModule } from '@nestjs/testing';
import { TransmittalService } from './transmittal.service';

describe('TransmittalsService', () => {
  let service: TransmittalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransmittalService],
    }).compile();

    service = module.get<TransmittalService>(TransmittalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
