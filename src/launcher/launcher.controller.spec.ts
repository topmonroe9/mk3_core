import { Test, TestingModule } from '@nestjs/testing';
import { LauncherController } from './launcher.controller';

describe('LauncherController', () => {
  let controller: LauncherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LauncherController],
    }).compile();

    controller = module.get<LauncherController>(LauncherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
