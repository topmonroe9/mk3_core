import { Test, TestingModule } from '@nestjs/testing';
import { BimCatsService } from './bim-cats.service';
import {BimCatDto} from "./dto";

describe('BimCatsService', () => {
  let service: BimCatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BimCatsService,
      ],
    }).compile();

    service = module.get<BimCatsService>(BimCatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return bimCatDto[]', () => {
    expect(typeof service.getAll()).toEqual("BimCatDto")
  })

});


export class BimCatsServiceFake {
  public getAvailible(): void {}
  public async save(): Promise<void> {}
  public async remove(): Promise<void> {}
  public async findOne(): Promise<void> {}
}
