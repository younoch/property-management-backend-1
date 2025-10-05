import { ApiProperty } from '@nestjs/swagger';

export class FeedbackDataDto {
  @ApiProperty({ description: 'The unique identifier of the feedback' })
  id: string;

  @ApiProperty({ description: 'The feedback message' })
  message: string;

  @ApiProperty({ description: 'URL of the page where feedback was submitted from', required: false })
  pageUrl?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Whether the feedback has been reviewed' })
  isReviewed: boolean;

  @ApiProperty({ description: 'When the feedback was created' })
  createdAt: Date;

  @ApiProperty({ description: 'ID of the user who submitted the feedback', nullable: true })
  userId: string  | null;

  @ApiProperty({ description: 'Email of the user who submitted the feedback' })
  userEmail: string;
}

export class FeedbackResponseDto {
  @ApiProperty({ description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ 
    description: 'The feedback data',
    type: FeedbackDataDto,
    isArray: true
  })
  data: FeedbackDataDto | FeedbackDataDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: Object,
    example: {
      total: 100,
      page: 1,
      limit: 10
    },
    required: false
  })
  meta?: {
    total: number;
    page: number;
    limit: number;
  };

  @ApiProperty({ description: 'ISO timestamp of the response' })
  timestamp: string;

  @ApiProperty({ description: 'API endpoint path' })
  path: string;
}
