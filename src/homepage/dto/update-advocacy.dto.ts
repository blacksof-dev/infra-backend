import { PartialType } from '@nestjs/swagger';
import { CreateAdvocacyDto } from './create-advocacy.dto';

export class UpdateAdvocacyDto extends PartialType(CreateAdvocacyDto) {}
