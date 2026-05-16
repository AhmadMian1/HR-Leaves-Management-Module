import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const loading = inject(LoadingService);

  loading.show();

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred.';

      if (error.error?.message) {
        message = error.error.message;
      } else if (error.error?.errors?.length) {
        message = error.error.errors.join('; ');
      } else if (error.status === 0) {
        message = 'Cannot connect to server. Please check your connection.';
      } else if (error.status === 404) {
        message = 'Resource not found.';
      } else if (error.status === 403) {
        message = 'Access denied.';
      }

      notification.error(message);
      return throwError(() => error);
    }),
    finalize(() => loading.hide())
  );
};
