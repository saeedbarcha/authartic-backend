import { Test, TestingModule } from '@nestjs/testing';
import { ValidationCodeController } from './validation-code.controller';
import { ValidationCodeService } from './validation-code.service';

describe('ValidationCodeController', () => {
  let controller: ValidationCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidationCodeController],
      providers: [ValidationCodeService],
    }).compile();

    controller = module.get<ValidationCodeController>(ValidationCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
