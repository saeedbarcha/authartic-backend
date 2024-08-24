import { Controller,  Post, Param,  } from '@nestjs/common';
import { ValidationCodeService } from './validation-code.service';


@Controller('validation')
export class ValidationCodeController {
  constructor(private readonly validationCodeService: ValidationCodeService) { }

  @Post('code/:code')
  findByCode(@Param('code') code: string) {
    return this.validationCodeService.findByCode(code);
  }

  
}
