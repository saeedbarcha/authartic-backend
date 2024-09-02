import { Test, TestingModule } from '@nestjs/testing';
import { FontController } from './font.controller';
import { FontService } from './font.service';

describe('FontController', () => {
  let controller: FontController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FontController],
      providers: [FontService],
    }).compile();

    controller = module.get<FontController>(FontController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
