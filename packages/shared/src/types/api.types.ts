export interface ApiResponseEnvelope<T> {
  data: T;
}

export interface ApiCollectionResponseEnvelope<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorDetails {
  field?: string;
  message: string;
}

export interface ApiErrorResponseEnvelope {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetails[];
  };
}
