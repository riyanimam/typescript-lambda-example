import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { log } from './utils/logger';

export const processEvent = (payload: Record<string, unknown>) => {
  log('processEvent input:', payload);
  return {
    message: 'processed',
    input: payload,
  } as const;
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = event.body ? JSON.parse(event.body) : {};
  const result = processEvent(body);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
