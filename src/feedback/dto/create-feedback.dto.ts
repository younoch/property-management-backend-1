import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEmail } from 'class-validator';
import { IsUrlOrPath } from '../../common/decorators/is-url-or-path.decorator';

export class CreateFeedbackDto {
  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  user_email: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsUrlOrPath({
    message: 'page_url must be a valid URL or path (e.g., http://example.com, /path, localhost:3000)'
  })
  @IsOptional()
  page_url?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
