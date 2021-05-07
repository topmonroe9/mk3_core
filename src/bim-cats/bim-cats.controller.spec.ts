import { Test, TestingModule } from '@nestjs/testing';
import { BimCatsController } from './bim-cats.controller';

describe('BimCatsController', () => {
  let controller: BimCatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BimCatsController],
    }).compile();

    controller = module.get<BimCatsController>(BimCatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
