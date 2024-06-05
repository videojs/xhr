export type BodyCallback = (
  error: Error,
  body: any
) => void;

export type HttpResponseHandler = (
  callback: BodyCallback,
  decodeResponseBody: boolean
) => XhrCallback;

export type XhrCallback = (
  error: Error,
  response: XhrResponse,
  body: any
) => void;

export interface XhrResponse {
  body: Object | string;
  statusCode: number;
  method: string;
  headers: XhrHeaders;
  url: string;
  rawRequest: XMLHttpRequest;
}

export interface XhrHeaders {
  [key: string]: string;
}

export interface XhrBaseConfig {
  useXDR?: boolean;
  sync?: boolean;
  method?: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH';
  timeout?: number;
  headers?: XhrHeaders;
  body?: string | any;
  json?: boolean;
  username?: string;
  password?: string;
  withCredentials?: boolean;
  responseType?: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
  requestType?: string;
  metadata?: Record<string, unknown>;
  retry?: Retry;
  beforeSend?: (xhrObject: XMLHttpRequest) => void;
  xhr?: XMLHttpRequest;
}

export interface XhrUriConfig extends XhrBaseConfig {
  uri: string;
}

export interface XhrUrlConfig extends XhrBaseConfig {
  url: string;
}

export interface XhrInstance {
  (options: XhrUriConfig | XhrUrlConfig, callback: XhrCallback): any;
  (url: string, callback: XhrCallback): any;
  (url: string, options: XhrBaseConfig, callback: XhrCallback): any;
}

export interface Retry {
  getCurrentFuzzedDelay(): number;
  shouldRetry(): boolean;
  moveToNextAttempt(): void;
}

export interface NetworkRequest {
  headers: Record<string, string>;
  uri: string;
  metadata: Record<string, unknown>;
  body?: unknown;
  retry?: Retry;
  timeout?: number;
}

export interface NetworkResponse {
  headers: Record<string, string>;
  responseUrl: string;
  body?: unknown;
  responseType?: XMLHttpRequestResponseType;
}

export type Interceptor<T> = (payload: T) => T;

export interface InterceptorsStorage<T> {
  enable(): void;
  reset(): void;
  addInterceptor(type: string, interceptor: Interceptor<T>): boolean;
  removeInterceptor(type: string, interceptor: Interceptor<T>): boolean;
  clearInterceptorsByType(type: string): boolean;
  clear(): boolean;
}

export interface RetryOptions {
  maxAttempts?: number;
  delayFactor?: number;
  fuzzFactor?: number;
  initialDelay?: number;
}

export interface RetryManager {
  enable(): void;
  reset(): void;
  createRetry(options?: RetryOptions): Retry;
}

export interface XhrStatic extends XhrInstance {
  del: XhrInstance;
  get: XhrInstance;
  head: XhrInstance;
  patch: XhrInstance;
  post: XhrInstance;
  put: XhrInstance;
  requestInterceptorsStorage: InterceptorsStorage<NetworkRequest>;
  responseInterceptorsStorage: InterceptorsStorage<NetworkResponse>;
  retryManager: RetryManager;
}

declare const Xhr: XhrStatic;

export default Xhr;
