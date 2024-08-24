import { Test, TestingModule } from '@nestjs/testing';
import { FontService } from './font.service';

describe('FontService', () => {
  let service: FontService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FontService],
    }).compile();

    service = module.get<FontService>(FontService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
