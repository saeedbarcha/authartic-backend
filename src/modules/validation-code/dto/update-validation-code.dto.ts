import { PartialType } from '@nestjs/mapped-types';
import { CreateValidationCodeDto } from './create-validation-code.dto';

export class UpdateValidationCodeDto extends PartialType(CreateValidationCodeDto) {}
