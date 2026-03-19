import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CORRELATION_ID_HEADER } from '../middleware/correlation-id.middleware';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  correlationId: string;
}

@Injectable()
export class ResponseEnvelopeInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const req = context.switchToHttp().getRequest();
    const correlationId = req.headers[CORRELATION_ID_HEADER] as string;

    return next.handle().pipe(
      map((data) => {
        // If the handler already returned an envelope (e.g. paginated responses),
        // pass the meta through and wrap accordingly.
        const payload = data as Record<string, unknown> | null;
        if (payload && typeof payload === 'object' && 'items' in payload && 'page' in payload) {
          const { items, ...meta } = payload;
          return { success: true, data: items as T, meta, correlationId };
        }
        return { success: true, data, correlationId };
      }),
    );
  }
}
