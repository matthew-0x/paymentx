import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { listPayments } from './repositories/payments';
import { constants as statusCodes } from "http2";
import { ErrorCodes } from './models/errorCodes';
import { ErrorNames } from './models/errorNames';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try{
    const payments = await listPayments();
    return buildResponse(statusCodes.HTTP_STATUS_OK, { data: payments });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return buildResponse(ErrorCodes.INTERNAL_SERVER_ERROR, {
          error: ErrorNames.INTERNAL_SERVER_ERROR,
          details: error.message
        });
      }
};
