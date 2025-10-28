declare module '@aws-sdk/client-s3';
declare module 'csv-parse/sync';

declare module 'pg' {
  export type PoolConfig = any;
  export class Pool {
    constructor(config?: PoolConfig);
    query(text: string, params?: any[]): Promise<any>;
    end(): Promise<void>;
  }
  export function Client(config?: any): any;
}
