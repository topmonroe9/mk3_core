import { Test, TestingModule } from '@nestjs/testing';
import { BimCatsService } from './bim-cats.service';

describe('BimCatsService', () => {
  let service: BimCatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BimCatsService],
    }).compile();

    service = module.get<BimCatsService>(BimCatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
