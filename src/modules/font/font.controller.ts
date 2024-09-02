// src/modules/font/font.controller.ts
import { Controller, Get} from '@nestjs/common';
import { FontService } from './font.service';

@Controller('font')
export class FontController {
  constructor(private readonly fontService: FontService) { }

  @Get('active')
  findActive() {
    return this.fontService.findActive();
  }

}
