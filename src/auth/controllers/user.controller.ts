import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Observable, map, of, switchMap } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { UpdateResult } from 'typeorm';

import { UserService } from '../services/user.service';
import { JwtGuard } from '../guards/jwt.guard';
import {
  isFileExtensionSafe,
  removeFile,
  saveImageToStorage,
} from '../helpers/image-storage';
import { DecodeTokenFromFront } from '../models/decodeTokenFromFront.interface';
import { User } from '../models/user.class';
import {
  FriendRequest,
  FriendRequestStatus,
} from '../models/friend-request.interface';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get(':userId')
  findUserById(@Param('userId') userId: string): Observable<User> {
    return this.userService.findUserByid(parseInt(userId));
  }

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Observable<UpdateResult | { error: string }> {
    const fileName = file?.filename;

    if (!fileName) return of({ error: 'File must be a png, jpg/jpeg' });

    const imagesFolderPath = join(process.cwd(), 'images');
    const fullImagePath = join(`${imagesFolderPath}/${file.filename}`);

    return isFileExtensionSafe(fullImagePath).pipe(
      switchMap((isFileLegit: boolean) => {
        if (isFileLegit) {
          const userId = req.user.id;

          return this.userService.updateUserImageById(userId, fileName);
        }

        removeFile(fullImagePath);
        return of({ error: 'File content does not match extension' });
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Get('image')
  findImage(@Request() req, @Res() res): Observable<object> {
    const userId = req.user.id;
    return this.userService.findImageNameByUserId(userId).pipe(
      switchMap((imageName: string) => {
        return of(res.sendFile(imageName, { root: './images' }));
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Get('image-name')
  findUserImageName(@Request() req): Observable<{ imageName: string }> {
    const userId = req.user.id;
    return this.userService.findImageNameByUserId(userId).pipe(
      switchMap((imageName: string) => {
        return of({ imageName });
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Post('update-image')
  updatingTokenAfterChangingProfilePicture(
    @Body() decodeToken: DecodeTokenFromFront,
  ): Observable<{ token: string }> {
    return this.userService
      .updatingTokenAfterChangingProfilePicture(decodeToken)
      .pipe(map((jwt: string) => ({ token: jwt })));
  }

  //adding as a friend
  //добавление в друзья
  @UseGuards(JwtGuard)
  @Post('friend-request/send/:receiverId')
  sendFriendRequest(
    @Param('receiverId') receiverId: string,
    @Request() req,
  ): Observable<FriendRequest | { error: string }> {
    return this.userService.sendFriendRequest(parseInt(receiverId), req.user);
  }

  //статус запроса в друзья
  @UseGuards(JwtGuard)
  @Get('friend-request/status/:receiverId')
  getFriendRequestStatus(
    @Param('receiverId') receiverId: string,
    @Request() req,
  ): Observable<FriendRequestStatus> {
    return this.userService.getFriendRequestStatus(
      parseInt(receiverId),
      req.user,
    );
  }

  @UseGuards(JwtGuard)
  @Patch('friend-request/response/:friendRequestId')
  respondToFriendRequest(
    @Param('friendRequestId') friendRequestId: string,
    @Body() statusResponse: FriendRequestStatus,
  ): Observable<FriendRequest> {
    return this.userService.respondToFriendRequest(
      parseInt(friendRequestId),
      statusResponse,
    );
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/me/received-requests')
  getFriendRequestsFromRecipients(@Request() req): Observable<FriendRequest[]> {
    return this.userService.getFriendRequestsFromRecipients(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('friends/my')
  getFriends(@Request() req): Observable<User[]> {
    return this.userService.getFriends(req.user);
  }
}
