import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { AuthService } from 'src/auth/services/auth.service';
import { FeedService } from '../services/feed.service';
import { User } from 'src/auth/models/user.interface';
import { FeedPost } from '../models/feedPost.interface';

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private feedService: FeedService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params }: { user: User; params: { id: number } } = request;

    if (!user || !params) return of(false);
    if (user.role === 'admin') return of(true);

    const userId = user.id;
    const feedId = params.id;

    return this.authService.findUserByid(userId).pipe(
      switchMap((user: User) =>
        this.feedService.findPostById(feedId).pipe(
          map((feedPost: FeedPost) => user.id === feedPost.author.id),

          catchError(() => of(false)),
        ),
      ),
      catchError(() => of(false)),
    );
  }
}
