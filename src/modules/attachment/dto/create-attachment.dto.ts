
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAttachmentDto {
    @IsNotEmpty()
    @IsString()
    type: string;
}
