import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vehicles/:vehicleId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Param('vehicleId') vehicleId: string) {
    return this.commentsService.findByVehicle(vehicleId);
  }

  @Post()
  create(
    @Param('vehicleId') vehicleId: string,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.commentsService.create(vehicleId, req.user.id, dto);
  }

  @Delete(':commentId')
  remove(
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return this.commentsService.remove(commentId, req.user.id, req.user.role);
  }
}
