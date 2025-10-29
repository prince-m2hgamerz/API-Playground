export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type BodyType = 'none' | 'json' | 'form' | 'raw' | 'xml';

export type AuthType = 'none' | 'bearer' | 'apikey' | 'basic';

export type KeyValuePair = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

export type RequestConfig = {
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  body: {
    type: BodyType;
    content: string;
  };
  auth: {
    type: AuthType;
    token?: string;
    key?: string;
    value?: string;
    username?: string;
    password?: string;
  };
};

export type ApiResponse = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
};
