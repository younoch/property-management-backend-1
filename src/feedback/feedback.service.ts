import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackDataDto, FeedbackResponseDto } from './dto/feedback-response.dto';
import { User } from '../users/user.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<FeedbackDataDto> {
    let user = null;
    let userEmail = createFeedbackDto.user_email;
    
    // If user_id is provided, verify the user exists
    if (createFeedbackDto.user_id) {
      user = await this.userRepository.findOne({
        where: { id: createFeedbackDto.user_id, email: createFeedbackDto.user_email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      userEmail = user.email;
    }

    const feedback = this.feedbackRepository.create({
      message: createFeedbackDto.message,
      page_url: createFeedbackDto.page_url,
      metadata: {
        ...(createFeedbackDto.metadata || {}),
        user_agent: createFeedbackDto.metadata?.userAgent || null,
      },
      user_id: user?.id || null,
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);
    
    return this.mapToResponseDto(savedFeedback, userEmail);
  }

  async findAll(
    page = 1,
    limit = 10,
    reviewed?: boolean,
  ): Promise<{ data: FeedbackDataDto[]; total: number }> {
    const [result, total] = await this.feedbackRepository.findAndCount({
      relations: ['user'],
      where: reviewed !== undefined ? { is_reviewed: reviewed } : {},
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Handle case where user might be null (for unauthenticated feedback)
    const data = result.map((feedback) =>
      this.mapToResponseDto(feedback, feedback.user?.email || 'anonymous@example.com'),
    );

    return { data, total };
  }

  async markAsReviewed(id: string): Promise<FeedbackDataDto> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    feedback.is_reviewed = true;
    const updatedFeedback = await this.feedbackRepository.save(feedback);
    
    return this.mapToResponseDto(updatedFeedback, feedback.user?.email || '');
  }

  private mapToResponseDto(feedback: Feedback, userEmail: string): FeedbackDataDto {
    return {
      id: feedback.id,
      message: feedback.message,
      page_url: feedback.page_url,
      metadata: feedback.metadata,
      is_reviewed: feedback.is_reviewed,
      created_at: feedback.created_at,
      // Convert string ID to number for backward compatibility with DTO
      user_id: feedback.user_id || null,
      user_email: userEmail,
    };
  }
}
